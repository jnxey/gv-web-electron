/**
 * TX 扫码摄像头 SDK 桥接（USB FData，koffi + tx_windows_fdata.dll）。
 *
 * DLL 放置路径：resources/app/lib/tx_windows_fdata.dll
 * 扫码结果通过 BrowserWindow.webContents.send('tx-scanner-decode') 推送到渲染进程。
 */
const path = require('node:path');
const { app, BrowserWindow } = require('electron');

/** @type {import('koffi') | null} */
let koffi = null;
/** @type {object | null} */
let lib = null;
/** @type {string | null} */
let loadError = null;

/** @type {boolean} */
let initialized = false;
/** @type {boolean} */
let decoding = false;
/** @type {number | null} */
let connected = null;
/** @type {unknown} */
let decodeCbHandle = null;
/** @type {unknown} */
let commStateCbHandle = null;

/** SDK：SUCC / FAIL */
const SUCC = 0;

/** DB_TRIGGER_MODE_E：自动感应（摄像头常用） */
const TRIGGER_MODE_AUTOSENS = 3;

/** @type {import('koffi').IKoffiCType | null} */
let DecodeDataCb = null;
/** @type {import('koffi').IKoffiCType | null} */
let CommStateCb = null;

/** @type {Record<string, Function>} */
let fns = {};

/**
 * @returns {string}
 */
function resolveTxScannerDllPath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'app/lib/tx_windows_fdata.dll');
  }
  return path.join(__dirname, 'resources/app/lib/tx_windows_fdata.dll');
}

/**
 * @param {string} channel
 * @param {Record<string, unknown>} payload
 */
function broadcast(channel, payload) {
  for (const win of BrowserWindow.getAllWindows()) {
    if (win.isDestroyed()) continue;
    try {
      win.webContents.send(channel, payload);
    } catch (err) {
      console.error(`[tx-scanner-bridge] broadcast ${channel} failed:`, err);
    }
  }
}

/**
 * @param {unknown} buf
 * @param {number} len
 * @returns {Buffer}
 */
function bufferFromPointer(buf, len) {
  const size = Number(len);
  if (!buf || !Number.isFinite(size) || size <= 0) return Buffer.alloc(0);
  const bytes = koffi.decode(buf, koffi.array('uint8', size));
  return Buffer.from(bytes);
}

/**
 * @param {number} codeType
 * @param {unknown} buf
 * @param {number} len
 * @returns {number}
 */
function onDecodeData(codeType, buf, len) {
  try {
    const rawBuffer = bufferFromPointer(buf, len);
    const data = rawBuffer.toString('utf8');
    broadcast('tx-scanner-decode', {
      codeType: Number(codeType),
      data,
      length: rawBuffer.length
    });
  } catch (err) {
    console.error('[tx-scanner-bridge] decode callback failed:', err);
  }
  return SUCC;
}

/**
 * @param {number} state
 */
function onCommState(state) {
  connected = Number(state);
  broadcast('tx-scanner-comm-state', { connected: connected === 1 });
}

/**
 * @returns {boolean}
 */
function ensureLibLoaded() {
  if (lib) return true;
  if (loadError) return false;

  try {
    koffi = require('koffi');
    lib = koffi.load(resolveTxScannerDllPath());

    DecodeDataCb = koffi.proto('int __cdecl tx_scanner_decode_data_cb(uint8 codeType, uint8 *pBuf, uint32 uiBufLen)');
    CommStateCb = koffi.proto('void __cdecl tx_scanner_comm_state_cb(uint8 ucState)');

    fns = {
      tx_scanner_init: lib.func('tx_scanner_init', 'int', []),
      tx_scanner_deinit: lib.func('tx_scanner_deinit', 'int', []),
      tx_scanner_get_version: lib.func('tx_scanner_get_version', 'int', ['uint8 *', 'uint8']),
      tx_scanner_decode_data_fun_register: lib.func('tx_scanner_decode_data_fun_register', 'int', [
        koffi.pointer(DecodeDataCb)
      ]),
      tx_scanner_comm_state_fun_register: lib.func('tx_scanner_comm_state_fun_register', 'int', [
        koffi.pointer(CommStateCb)
      ]),
      tx_scanner_decode_start: lib.func('tx_scanner_decode_start', 'int', []),
      tx_scanner_decode_stop: lib.func('tx_scanner_decode_stop', 'int', []),
      tx_scanner_set_trigger_mode: lib.func('tx_scanner_set_trigger_mode', 'int', ['uint8', 'uint8']),
      tx_scanner_get_trigger_mode: lib.func('tx_scanner_get_trigger_mode', 'int', []),
      tx_scanner_get_version_info: lib.func('tx_scanner_get_version_info', 'int', ['uint8 *', 'uint16']),
      tx_scanner_get_all_product_info: lib.func('tx_scanner_get_all_product_info', 'int', ['uint8 *', 'uint16']),
      tx_scanner_scan_sw: lib.func('tx_scanner_scan_sw', 'int', ['uint8'])
    };

    return true;
  } catch (err) {
    loadError = err instanceof Error ? err.message : String(err);
    console.error('[tx-scanner-bridge] load failed:', err);
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
    errorDetail: loadError ?? 'tx_windows_fdata.dll not available'
  };
}

/**
 * @returns {string}
 */
function readSdkVersion() {
  if (!ensureLibLoaded()) return '';
  const buffer = Buffer.alloc(64);
  const len = fns.tx_scanner_get_version(buffer, buffer.length);
  if (len <= 0) return '';
  return buffer.toString('utf8', 0, len).replace(/\0.*$/, '');
}

/**
 * @returns {Record<string, unknown>}
 */
function getTxScannerStatus() {
  if (!ensureLibLoaded()) {
    return {
      ok: false,
      sdkLoaded: false,
      initialized,
      decoding,
      connected,
      error: loadError ?? 'SDK_NOT_LOADED'
    };
  }

  return {
    ok: true,
    sdkLoaded: true,
    initialized,
    decoding,
    connected: connected === null ? null : connected === 1,
    sdkVersion: readSdkVersion(),
    triggerMode: initialized ? fns.tx_scanner_get_trigger_mode() : null
  };
}

/**
 * @param {{ triggerMode?: number, saveTriggerMode?: boolean }} [options]
 * @returns {Record<string, unknown>}
 */
function startTxScanner(options = {}) {
  if (!ensureLibLoaded()) return sdkNotLoadedResult();

  const triggerMode = Number(options.triggerMode);
  const resolvedTriggerMode =
    Number.isFinite(triggerMode) && triggerMode >= 0 && triggerMode <= 3 ? triggerMode : TRIGGER_MODE_AUTOSENS;
  const saveTriggerMode = options.saveTriggerMode === true ? 1 : 0;

  try {
    if (!decodeCbHandle) {
      decodeCbHandle = koffi.register(onDecodeData, koffi.pointer(DecodeDataCb));
      commStateCbHandle = koffi.register(onCommState, koffi.pointer(CommStateCb));
    }

    if (!initialized) {
      let ret = fns.tx_scanner_decode_data_fun_register(decodeCbHandle);
      if (ret < SUCC) return { ok: false, error: 'REGISTER_DECODE_CB_FAILED', detail: ret };

      ret = fns.tx_scanner_comm_state_fun_register(commStateCbHandle);
      if (ret < SUCC) return { ok: false, error: 'REGISTER_COMM_CB_FAILED', detail: ret };

      ret = fns.tx_scanner_init();
      if (ret < SUCC) return { ok: false, error: 'INIT_FAILED', detail: ret };
      initialized = true;
    }

    const modeRet = fns.tx_scanner_set_trigger_mode(resolvedTriggerMode, saveTriggerMode);
    if (modeRet < SUCC) {
      return { ok: false, error: 'SET_TRIGGER_MODE_FAILED', detail: modeRet, triggerMode: resolvedTriggerMode };
    }

    if (!decoding) {
      const startRet = fns.tx_scanner_decode_start();
      if (startRet < SUCC) return { ok: false, error: 'DECODE_START_FAILED', detail: startRet };
      decoding = true;
    }

    return {
      ok: true,
      initialized,
      decoding,
      triggerMode: resolvedTriggerMode,
      sdkVersion: readSdkVersion()
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[tx-scanner-bridge] start failed:', err);
    return { ok: false, error: 'SDK_ERROR', errorDetail: message };
  }
}

/**
 * @returns {Record<string, unknown>}
 */
function stopTxScanner() {
  if (!ensureLibLoaded() || !initialized) {
    return { ok: true, decoding: false, skipped: true };
  }

  try {
    if (decoding) {
      const ret = fns.tx_scanner_decode_stop();
      if (ret < SUCC) return { ok: false, error: 'DECODE_STOP_FAILED', detail: ret };
      decoding = false;
    }
    return { ok: true, decoding: false };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[tx-scanner-bridge] stop failed:', err);
    return { ok: false, error: 'SDK_ERROR', errorDetail: message };
  }
}

/**
 * @returns {Record<string, unknown>}
 */
function deinitTxScanner() {
  stopTxScanner();

  if (!ensureLibLoaded() || !initialized) {
    return { ok: true, initialized: false, skipped: true };
  }

  try {
    const ret = fns.tx_scanner_deinit();
    initialized = false;
    connected = null;

    if (decodeCbHandle) {
      koffi.unregister(decodeCbHandle);
      decodeCbHandle = null;
    }
    if (commStateCbHandle) {
      koffi.unregister(commStateCbHandle);
      commStateCbHandle = null;
    }

    if (ret < SUCC) return { ok: false, error: 'DEINIT_FAILED', detail: ret };
    return { ok: true, initialized: false, decoding: false };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[tx-scanner-bridge] deinit failed:', err);
    return { ok: false, error: 'SDK_ERROR', errorDetail: message };
  }
}

module.exports = {
  getTxScannerStatus,
  startTxScanner,
  stopTxScanner,
  deinitTxScanner,
  resolveTxScannerDllPath
};
