/**
 * KP-80A / autoreplyprint SDK 桥接（koffi + autoreplyprint.dll）。
 * USB 口用 CP_Port_OpenUsb；COM 口用 CP_Port_OpenCom。
 */
const path = require('node:path');
const { app } = require('electron');

/** @type {import('koffi') | null} */
let koffi = null;
/** @type {object | null} */
let lib = null;
/** @type {string | null} */
let loadError = null;

/** SDK 调用互斥，避免并发打开同一打印机 */
let sdkMutex = Promise.resolve();

/** ESC/POS 实时状态：缺纸 */
const CP_RTSTATUS_NOPAPER_MASK = 0x20;
/** ESC/POS 实时状态：纸将尽 */
const CP_RTSTATUS_PAPER_NEAREND_MASK = 0x0c;
/** 打印机错误状态：缺纸 */
const CP_PRINTER_ERROR_NOPAPER = 0x04;

/**
 * @returns {string}
 */
function resolveAutoreplyprintDllPath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'app/lib/autoreplyprint.dll');
  }
  return path.join(__dirname, 'resources/app/lib/autoreplyprint.dll');
}

/**
 * @returns {boolean}
 */
function ensureLibLoaded() {
  if (lib) return true;
  if (loadError) return false;

  try {
    koffi = require('koffi');
    lib = koffi.load(resolveAutoreplyprintDllPath());
    return true;
  } catch (err) {
    loadError = err instanceof Error ? err.message : String(err);
    console.error('[autoreplyprint-bridge] load failed:', err);
    return false;
  }
}

/**
 * @returns {{ ok: false, error: string, errorDetail?: string }}
 */
function sdkNotLoadedResult() {
  return {
    ok: false,
    error: 'SDK_NOT_LOADED',
    errorDetail: loadError ?? 'autoreplyprint.dll not available'
  };
}

/**
 * @param {() => Promise<unknown>} fn
 * @returns {Promise<unknown>}
 */
function withSdkMutex(fn) {
  const task = sdkMutex.then(fn, fn);
  sdkMutex = task.catch(() => undefined);
  return task;
}

/**
 * 解析 SDK 枚举端口 buffer（双 \0 分隔）。
 * @param {Buffer} buffer
 * @returns {string[]}
 */
function parseEnumPortBuffer(buffer) {
  const ports = [];
  let offset = 0;
  while (offset < buffer.length) {
    if (buffer[offset] === 0) break;
    const end = buffer.indexOf(0, offset);
    if (end < 0) break;
    const name = buffer.toString('utf8', offset, end).trim();
    if (name !== '') ports.push(name);
    offset = end + 1;
  }
  return ports;
}

/**
 * @param {(buf: Buffer, size: number) => number} enumFn
 * @returns {string[]}
 */
function enumPorts(enumFn) {
  if (!ensureLibLoaded()) return [];
  const buffer = Buffer.alloc(4096);
  try {
    enumFn(buffer, buffer.length);
  } catch (err) {
    console.error('[autoreplyprint-bridge] enum ports failed:', err);
    return [];
  }
  return parseEnumPortBuffer(buffer);
}

/**
 * @param {number} status
 * @returns {{ paperOut: boolean, paperNearEnd: boolean, offline: boolean, coverUp: boolean, raw: number }}
 */
function parseRtStatus(status) {
  const byte1 = (status >> 8) & 0xff;
  const byte0 = status & 0xff;
  return {
    paperOut: (byte1 & CP_RTSTATUS_NOPAPER_MASK) === CP_RTSTATUS_NOPAPER_MASK,
    paperNearEnd: ((status >> 24) & CP_RTSTATUS_PAPER_NEAREND_MASK) === CP_RTSTATUS_PAPER_NEAREND_MASK,
    offline: (byte0 & 0x08) === 0x08,
    coverUp: (byte1 & 0x04) === 0x04,
    raw: status
  };
}

/**
 * @param {number} errorStatus
 * @param {number} infoStatus
 */
function parsePrinterStatus(errorStatus, infoStatus) {
  return {
    paperOut: (Number(errorStatus) & CP_PRINTER_ERROR_NOPAPER) !== 0,
    paperNearEnd: false,
    errorStatus: Number(errorStatus),
    infoStatus: Number(infoStatus)
  };
}

/**
 * @typedef {{ port: string, type: 'usb'|'com' }} AutoreplyprintPortRef
 */

/**
 * 从 USB 端口名提取 VID:PID 键（用于去重）。
 * @param {string} port
 * @returns {string|null}
 */
function parseUsbPortVidPidKey(port) {
  const vidMatch = String(port).match(/vid[_:]([0-9a-f]+)/i);
  const pidMatch = String(port).match(/pid[_:]([0-9a-f]+)/i);
  if (!vidMatch || !pidMatch) return null;
  return `${vidMatch[1].toLowerCase()}:${pidMatch[1].toLowerCase()}`;
}

/**
 * USB 枚举去重：同一 VID/PID 只保留一项，优先短名 `VID:...`（OpenUsb 用这个）。
 * @param {string[]} rawPorts
 * @returns {Array<{ id: string, vid?: string, pid?: string }>}
 */
function buildUsbPortOptions(rawPorts) {
  /** @type {Map<string, { id: string, vid?: string, pid?: string, preferRank: number }>} */
  const grouped = new Map();

  for (const port of rawPorts) {
    const id = String(port ?? '').trim();
    if (id === '') continue;

    const vidPidKey = parseUsbPortVidPidKey(id);
    const groupKey = vidPidKey ?? id;
    const preferRank = /^VID:/i.test(id) ? 0 : id.startsWith('\\\\?\\usb#') ? 1 : 2;
    const [vid, pid] = vidPidKey ? vidPidKey.split(':') : [];
    const candidate = {
      id,
      ...(vid && pid ? { vid: vid.toUpperCase(), pid: pid.toUpperCase() } : {}),
      preferRank
    };
    const existing = grouped.get(groupKey);

    if (!existing || candidate.preferRank < existing.preferRank) {
      grouped.set(groupKey, candidate);
    }
  }

  return [...grouped.values()]
    .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }))
    .map(({ id, vid, pid }) => (vid && pid ? { id, vid, pid } : { id }));
}

/**
 * @typedef {{ id: string, vid?: string, pid?: string }} AutoreplyprintUsbPortOption */
/** @typedef {{ id: string }} AutoreplyprintComPortOption */

/**
 * @param {string[]} rawPorts
 * @returns {Array<{ id: string }>}
 */
function buildComPortOptions(rawPorts) {
  return rawPorts
    .map((port) => String(port ?? '').trim())
    .filter((port) => port !== '')
    .map((id) => ({ id }))
    .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
}

/**
 * @returns {{
 *   usb: string[],
 *   com: string[],
 *   usbOptions: AutoreplyprintUsbPortOption[],
 *   comOptions: AutoreplyprintComPortOption[],
 *   sdkLoaded: boolean,
 *   error?: string
 * }}
 */
function listAutoreplyprintPorts() {
  if (!ensureLibLoaded()) {
    return {
      usb: [],
      com: [],
      usbOptions: [],
      comOptions: [],
      sdkLoaded: false,
      error: loadError ?? 'SDK_NOT_LOADED'
    };
  }

  const CP_Port_EnumUsb = lib.func('CP_Port_EnumUsb', 'uint', ['char *', 'uint', 'void *']);
  const CP_Port_EnumCom = lib.func('CP_Port_EnumCom', 'uint', ['char *', 'uint', 'void *']);

  const usbOptions = buildUsbPortOptions(enumPorts((buf, size) => CP_Port_EnumUsb(buf, size, null)));
  const comOptions = buildComPortOptions(enumPorts((buf, size) => CP_Port_EnumCom(buf, size, null)));

  return {
    usb: usbOptions.map((item) => item.id),
    com: comOptions.map((item) => item.id),
    usbOptions,
    comOptions,
    sdkLoaded: true
  };
}

/**
 * @param {AutoreplyprintPortRef & { baudRate?: number }} options
 * @returns {unknown}
 */
function openPortHandle(options) {
  const port = String(options?.port ?? '').trim();
  const type = options?.type === 'com' ? 'com' : 'usb';

  if (port === '') return null;

  if (type === 'com') {
    const CP_Port_OpenCom = lib.func('CP_Port_OpenCom', 'void *', ['str', 'uint', 'int', 'int', 'int', 'int', 'int']);
    const baudRate = Number(options?.baudRate) || 19200;
    return CP_Port_OpenCom(port, baudRate, 8, 0, 0, 0, 1);
  }

  const CP_Port_OpenUsb = lib.func('CP_Port_OpenUsb', 'void *', ['str', 'int']);
  return CP_Port_OpenUsb(port, 1);
}

/**
 * @param {unknown} handle
 */
function closePortHandle(handle) {
  if (!handle || !lib) return;
  try {
    const CP_Port_Close = lib.func('CP_Port_Close', 'void', ['void *']);
    CP_Port_Close(handle);
  } catch (err) {
    console.error('[autoreplyprint-bridge] close port failed:', err);
  }
}

/**
 * @param {unknown} handle
 * @returns {{ rtStatus: number|null, rtParsed: ReturnType<typeof parseRtStatus>|null, errorStatus: number|null, infoStatus: number|null }}
 */
function queryStatusOnHandle(handle) {
  const CP_Pos_QueryRTStatus = lib.func('CP_Pos_QueryRTStatus', 'int', ['void *', 'uint']);
  const CP_Printer_GetPrinterStatusInfo = lib.func('CP_Printer_GetPrinterStatusInfo', 'int', [
    'void *',
    'int64 *',
    'int64 *',
    'int64 *'
  ]);

  let rtStatus = null;
  let rtParsed = null;
  const rt = CP_Pos_QueryRTStatus(handle, 3000);
  if (rt) {
    rtStatus = rt;
    rtParsed = parseRtStatus(rt);
  }

  let errorStatus = null;
  let infoStatus = null;
  const errPtr = koffi.alloc('int64', 1);
  const infoPtr = koffi.alloc('int64', 1);
  const tsPtr = koffi.alloc('int64', 1);
  if (CP_Printer_GetPrinterStatusInfo(handle, errPtr, infoPtr, tsPtr)) {
    errorStatus = koffi.decode(errPtr, 'int64');
    infoStatus = koffi.decode(infoPtr, 'int64');
  }

  return { rtStatus, rtParsed, errorStatus, infoStatus };
}

/**
 * 从 config 解析端口配置。
 * @param {Record<string, unknown>|null|undefined} localConfig
 * @returns {AutoreplyprintPortRef & { baudRate: number } | null}
 */
function resolvePortFromConfig(localConfig) {
  const port = String(localConfig?.thermal_printer_port ?? localConfig?.thermal_printer_com_port ?? '').trim();
  if (port === '') return null;

  let type = String(localConfig?.thermal_printer_port_type ?? '').trim().toLowerCase();
  if (type !== 'usb' && type !== 'com') {
    type = /^COM\d+$/i.test(port) ? 'com' : 'usb';
  }

  const baudRate = Number(localConfig?.thermal_printer_baud_rate);
  return {
    port,
    type,
    baudRate: Number.isFinite(baudRate) && baudRate > 0 ? baudRate : 19200
  };
}

/**
 * @param {AutoreplyprintPortRef & { baudRate?: number }} portRef
 * @returns {Promise<Record<string, unknown>>}
 */
async function queryPaperStatusOnPort(portRef) {
  return withSdkMutex(async () => {
    if (!ensureLibLoaded()) return sdkNotLoadedResult();

    let handle = null;
    try {
      handle = openPortHandle(portRef);
      if (!handle) {
        return { ok: false, error: 'OPEN_FAILED', errorDetail: 'CP_Port_Open returned null' };
      }

      const { rtStatus, rtParsed, errorStatus, infoStatus } = queryStatusOnHandle(handle);
      const printerParsed =
        errorStatus != null ? parsePrinterStatus(errorStatus, infoStatus ?? 0) : null;

      const paperOut = rtParsed?.paperOut === true || printerParsed?.paperOut === true;
      const paperNearEnd = rtParsed?.paperNearEnd === true;

      if (rtStatus == null && errorStatus == null) {
        return {
          ok: false,
          error: 'QUERY_FAILED',
          errorDetail: 'QueryRTStatus and GetPrinterStatusInfo failed',
          paperOut: false,
          paperNearEnd: false,
          raw: { rtStatus, errorStatus, infoStatus }
        };
      }

      return {
        ok: true,
        paperOut,
        paperNearEnd,
        raw: { rtStatus, rtParsed, errorStatus, infoStatus, printerParsed }
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[autoreplyprint-bridge] query paper failed:', err);
      return { ok: false, error: 'SDK_ERROR', errorDetail: message, paperOut: false };
    } finally {
      closePortHandle(handle);
    }
  });
}

/**
 * @param {Record<string, unknown>|null|undefined} localConfig
 * @returns {Promise<Record<string, unknown>>}
 */
async function queryConfiguredPaperStatus(localConfig) {
  const portRef = resolvePortFromConfig(localConfig);
  if (!portRef) {
    return { ok: false, error: 'NOT_CONFIGURED', paperOut: false };
  }
  return queryPaperStatusOnPort(portRef);
}

/**
 * 打印任务提交后校验（HTML 静默打印走 spooler，QueryPrintResult 可能无效，以 RTStatus 为辅）。
 * @param {Record<string, unknown>|null|undefined} localConfig
 * @param {{ waitMs?: number }} [options]
 * @returns {Promise<Record<string, unknown>>}
 */
async function verifyPrintJobOnConfiguredPort(localConfig, options = {}) {
  const waitMs = Number(options.waitMs) > 0 ? Number(options.waitMs) : 800;

  return withSdkMutex(async () => {
    if (!ensureLibLoaded()) return { ...sdkNotLoadedResult(), printSuccess: false, skipped: true };

    const portRef = resolvePortFromConfig(localConfig);
    if (!portRef) {
      return { ok: false, error: 'NOT_CONFIGURED', printSuccess: false, skipped: true };
    }

    await new Promise((resolve) => setTimeout(resolve, waitMs));

    let handle = null;
    try {
      handle = openPortHandle(portRef);
      if (!handle) {
        return { ok: false, error: 'OPEN_FAILED', printSuccess: false, skipped: false };
      }

      const CP_Pos_QueryPrintResult = lib.func('CP_Pos_QueryPrintResult', 'int', ['void *', 'uint']);
      const printResult = CP_Pos_QueryPrintResult(handle, 5000);
      const { rtStatus, rtParsed, errorStatus, infoStatus } = queryStatusOnHandle(handle);

      const paperOut = rtParsed?.paperOut === true || (Number(errorStatus) & CP_PRINTER_ERROR_NOPAPER) !== 0;
      const printSuccess = printResult !== 0 && paperOut !== true;

      return {
        ok: true,
        printSuccess,
        paperOut,
        printResult,
        raw: { rtStatus, rtParsed, errorStatus, infoStatus }
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { ok: false, error: 'SDK_ERROR', errorDetail: message, printSuccess: false };
    } finally {
      closePortHandle(handle);
    }
  });
}

module.exports = {
  listAutoreplyprintPorts,
  queryConfiguredPaperStatus,
  queryPaperStatusOnPort,
  verifyPrintJobOnConfiguredPort,
  resolvePortFromConfig
};
