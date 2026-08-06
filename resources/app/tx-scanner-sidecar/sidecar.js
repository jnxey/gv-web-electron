/**
 * TX 扫码 SDK 32 位侧车进程（由 node-x86 启动，加载 32 位 tx_windows_fdata.dll）。
 * 与主进程通过 stdin/stdout 逐行 JSON 通信。
 */
const path = require('node:path');
const readline = require('node:readline');

const SUCC = 0;
const TRIGGER_MODE_AUTOSENS = 3;

/** @type {import('koffi') | null} */
let koffi = null;
/** @type {object | null} */
let lib = null;
/** @type {Record<string, Function>} */
let fns = {};
/** @type {unknown} */
let decodeCbHandle = null;
/** @type {unknown} */
let commStateCbHandle = null;
/** @type {import('koffi').IKoffiCType | null} */
let DecodeDataCb = null;
/** @type {import('koffi').IKoffiCType | null} */
let CommStateCb = null;

let initialized = false;
let decoding = false;
let connected = null;

/**
 * @param {Record<string, unknown>} payload
 */
function emit(payload) {
  process.stdout.write(`${JSON.stringify(payload)}\n`);
}

/**
 * @returns {string}
 */
function resolveDllPath() {
  const libDir = process.env.TX_SCANNER_DLL_DIR;
  if (libDir) {
    return path.join(libDir, 'tx_windows_fdata.dll');
  }
  return path.join(__dirname, '..', 'lib', 'tx_windows_fdata.dll');
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
    emit({
      type: 'decode',
      codeType: Number(codeType),
      data: rawBuffer.toString('utf8'),
      length: rawBuffer.length
    });
  } catch (err) {
    emit({
      type: 'error',
      error: 'DECODE_CB_ERROR',
      errorDetail: err instanceof Error ? err.message : String(err)
    });
  }
  return SUCC;
}

/**
 * @param {number} state
 */
function onCommState(state) {
  connected = Number(state);
  emit({ type: 'comm', connected: connected === 1 });
}

/**
 * @returns {boolean}
 */
function ensureLibLoaded() {
  if (lib) return true;
  try {
    koffi = require('koffi');
    lib = koffi.load(resolveDllPath());
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
      tx_scanner_get_trigger_mode: lib.func('tx_scanner_get_trigger_mode', 'int', [])
    };
    return true;
  } catch (err) {
    emit({
      type: 'error',
      error: 'SDK_NOT_LOADED',
      errorDetail: err instanceof Error ? err.message : String(err)
    });
    return false;
  }
}

/**
 * @returns {string}
 */
function readSdkVersion() {
  if (!lib) return '';
  const buffer = Buffer.alloc(64);
  const len = fns.tx_scanner_get_version(buffer, buffer.length);
  if (len <= 0) return '';
  return buffer.toString('utf8', 0, len).replace(/\0.*$/, '');
}

/**
 * @param {{ triggerMode?: number, saveTriggerMode?: boolean }} [options]
 */
function handleStart(options = {}) {
  const requestId = options.requestId;
  if (!ensureLibLoaded()) {
    emit({
      type: 'result',
      cmd: 'start',
      requestId: options.requestId,
      ok: false,
      error: 'SDK_NOT_LOADED'
    });
    return;
  }

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
      if (ret < SUCC) {
        emit({ type: 'result', cmd: 'start', requestId, ok: false, error: 'REGISTER_DECODE_CB_FAILED', detail: ret });
        return;
      }
      ret = fns.tx_scanner_comm_state_fun_register(commStateCbHandle);
      if (ret < SUCC) {
        emit({ type: 'result', cmd: 'start', requestId, ok: false, error: 'REGISTER_COMM_CB_FAILED', detail: ret });
        return;
      }
      ret = fns.tx_scanner_init();
      if (ret < SUCC) {
        emit({ type: 'result', cmd: 'start', requestId, ok: false, error: 'INIT_FAILED', detail: ret });
        return;
      }
      initialized = true;
    }

    const modeRet = fns.tx_scanner_set_trigger_mode(resolvedTriggerMode, saveTriggerMode);
    if (modeRet < SUCC) {
      emit({ type: 'result', cmd: 'start', requestId, ok: false, error: 'SET_TRIGGER_MODE_FAILED', detail: modeRet });
      return;
    }

    if (!decoding) {
      const startRet = fns.tx_scanner_decode_start();
      if (startRet < SUCC) {
        emit({ type: 'result', cmd: 'start', requestId, ok: false, error: 'DECODE_START_FAILED', detail: startRet });
        return;
      }
      decoding = true;
    }

    emit({
      type: 'result',
      cmd: 'start',
      requestId,
      ok: true,
      initialized,
      decoding,
      triggerMode: resolvedTriggerMode,
      sdkVersion: readSdkVersion()
    });
  } catch (err) {
    emit({
      type: 'result',
      cmd: 'start',
      requestId,
      ok: false,
      error: 'SDK_ERROR',
      errorDetail: err instanceof Error ? err.message : String(err)
    });
  }
}

function handleStop(options = {}) {
  const requestId = options.requestId;
  if (!lib || !initialized) {
    emit({ type: 'result', cmd: 'stop', requestId, ok: true, decoding: false, skipped: true });
    return;
  }
  try {
    if (decoding) {
      const ret = fns.tx_scanner_decode_stop();
      if (ret < SUCC) {
        emit({ type: 'result', cmd: 'stop', requestId, ok: false, error: 'DECODE_STOP_FAILED', detail: ret });
        return;
      }
      decoding = false;
    }
    emit({ type: 'result', cmd: 'stop', requestId, ok: true, decoding: false });
  } catch (err) {
    emit({
      type: 'result',
      cmd: 'stop',
      requestId,
      ok: false,
      error: 'SDK_ERROR',
      errorDetail: err instanceof Error ? err.message : String(err)
    });
  }
}

function handleDeinit(options = {}) {
  const requestId = options.requestId;
  if (lib && initialized && decoding) {
    try {
      fns.tx_scanner_decode_stop();
    } catch {
      /* ignore */
    }
    decoding = false;
  }
  if (!lib || !initialized) {
    emit({ type: 'result', cmd: 'deinit', requestId, ok: true, skipped: true });
    return;
  }
  try {
    const ret = fns.tx_scanner_deinit();
    initialized = false;
    decoding = false;
    connected = null;
    if (decodeCbHandle) {
      koffi.unregister(decodeCbHandle);
      decodeCbHandle = null;
    }
    if (commStateCbHandle) {
      koffi.unregister(commStateCbHandle);
      commStateCbHandle = null;
    }
    emit({ type: 'result', cmd: 'deinit', requestId, ok: ret >= SUCC, detail: ret });
  } catch (err) {
    emit({
      type: 'result',
      cmd: 'deinit',
      requestId,
      ok: false,
      error: 'SDK_ERROR',
      errorDetail: err instanceof Error ? err.message : String(err)
    });
  }
}

function handleStatus(options = {}) {
  const requestId = options.requestId;
  emit({
    type: 'result',
    cmd: 'status',
    requestId,
    ok: !!lib,
    sdkLoaded: !!lib,
    initialized,
    decoding,
    connected: connected === null ? null : connected === 1,
    sdkVersion: lib ? readSdkVersion() : '',
    processArch: process.arch
  });
}

/**
 * @param {Record<string, unknown>} msg
 */
function handleCommand(msg) {
  const cmd = String(msg?.cmd ?? '');
  switch (cmd) {
    case 'start':
      handleStart(msg);
      break;
    case 'stop':
      handleStop(msg);
      break;
    case 'deinit':
      handleDeinit(msg);
      break;
    case 'status':
      handleStatus(msg);
      break;
    case 'ping':
      emit({ type: 'result', cmd: 'ping', ok: true, processArch: process.arch });
      break;
    default:
      emit({ type: 'result', cmd, ok: false, error: 'UNKNOWN_CMD' });
  }
}

function boot() {
  const loaded = ensureLibLoaded();
  emit({
    type: 'ready',
    ok: loaded,
    sdkVersion: loaded ? readSdkVersion() : '',
    processArch: process.arch,
    dllPath: resolveDllPath()
  });

  const rl = readline.createInterface({ input: process.stdin });
  rl.on('line', (line) => {
    const trimmed = String(line ?? '').trim();
    if (trimmed === '') return;
    try {
      handleCommand(JSON.parse(trimmed));
    } catch (err) {
      emit({
        type: 'error',
        error: 'INVALID_COMMAND',
        errorDetail: err instanceof Error ? err.message : String(err)
      });
    }
  });
}

boot();
