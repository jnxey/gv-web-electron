/**
 * TX 扫码 SDK 32 位侧车宿主：优先 native-sidecar.exe（与厂商 Demo 同方式），回退 node-x86 + sidecar.js。
 */
const path = require('node:path');
const fs = require('node:fs');
const readline = require('node:readline');
const { spawn } = require('node:child_process');
const { app } = require('electron');
const {
  resolveTxScannerSidecarLogPath,
  appendTxScannerSidecarLog,
  isTxScannerDebugLogEnabled
} = require('./tx-scanner-sidecar-log');
const { getTxScannerUsbHostDiagnoseAsync } = require('./tx-scanner-usb-check');

/** @type {import('node:child_process').ChildProcess | null} */
let sidecarProcess = null;
/** @type {import('readline').Interface | null} */
let sidecarReader = null;
/** @type {Promise<void> | null} */
let bootPromise = null;
/** @type {Map<string, { resolve: Function, reject: Function, timer: NodeJS.Timeout }>} */
const pendingCommands = new Map();
/** @type {number} */
let commandSeq = 0;
/** @type {boolean} */
let sidecarReady = false;
/** @type {string} */
let sidecarSdkVersion = '';
/** @type {boolean} */
let sidecarInitialized = false;
/** @type {boolean} */
let sidecarDecoding = false;
/** @type {boolean | null} */
let sidecarConnected = null;
/** @type {string | null} */
let sidecarBootError = null;
/** @type {string | null} */
let sidecarBootErrorCode = null;

/** @type {((payload: Record<string, unknown>) => void) | null} */
let onDecodeForward = null;
/** @type {((payload: Record<string, unknown>) => void) | null} */
let onCommForward = null;

/**
 * @returns {string}
 */
function resolveAppRoot() {
  return app.isPackaged ? path.join(process.resourcesPath, 'app') : path.join(__dirname, 'resources/app');
}

/**
 * @returns {string}
 */
function resolveNodeX86Path() {
  return path.join(resolveAppRoot(), 'node-x86', 'node.exe');
}

function resolveNativeSidecarPath() {
  return path.join(resolveAppRoot(), 'tx-scanner-native-sidecar', 'native-sidecar.exe');
}

/**
 * @returns {string}
 */
function resolveSidecarScriptPath() {
  return path.join(resolveAppRoot(), 'tx-scanner-sidecar', 'sidecar.js');
}

/**
 * @returns {string}
 */
function resolveSidecarCwd() {
  return path.join(resolveAppRoot(), 'tx-scanner-sidecar');
}

/**
 * @returns {string}
 */
function resolveTxScannerLibDirForSidecar() {
  return path.join(resolveAppRoot(), 'lib');
}

/**
 * @returns {{ mode: 'native' | 'node', nativeSidecarExe: string, nativeExists: boolean, nodeX86Path: string, sidecarScript: string, nodeExists: boolean, scriptExists: boolean, libDir: string }}
 */
function probeSidecarRuntime() {
  const nativeSidecarExe = resolveNativeSidecarPath();
  const nodeX86Path = resolveNodeX86Path();
  const sidecarScript = resolveSidecarScriptPath();
  const libDir = resolveTxScannerLibDirForSidecar();
  const nativeExists = fs.existsSync(nativeSidecarExe);
  return {
    mode: nativeExists ? 'native' : 'node',
    nativeSidecarExe,
    nativeExists,
    nodeX86Path,
    sidecarScript,
    nodeExists: fs.existsSync(nodeX86Path),
    scriptExists: fs.existsSync(sidecarScript),
    libDir
  };
}

/**
 * @param {Record<string, unknown>} msg
 */
function handleSidecarMessage(msg) {
  const type = String(msg?.type ?? '');

  if (type === 'ready') {
    sidecarReady = msg?.ok === true;
    sidecarSdkVersion = typeof msg?.sdkVersion === 'string' ? msg.sdkVersion : '';
    if (!sidecarReady) {
      sidecarBootErrorCode = 'SDK_NOT_LOADED';
      sidecarBootError = String(msg?.errorDetail ?? 'sidecar sdk load failed');
    }
    return;
  }

  if (type === 'decode') {
    onDecodeForward?.({
      codeType: msg.codeType,
      data: msg.data,
      length: msg.length
    });
    return;
  }

  if (type === 'comm') {
    sidecarConnected = msg.connected === true;
    onCommForward?.({ connected: msg.connected === true });
    return;
  }

  if (type === 'result') {
    let requestId = typeof msg?.requestId === 'string' ? msg.requestId : null;
    if (!requestId || !pendingCommands.has(requestId)) {
      const cmd = typeof msg?.cmd === 'string' ? msg.cmd : '';
      if (cmd) {
        for (const [id, pending] of pendingCommands.entries()) {
          if (pending.cmd === cmd) {
            requestId = id;
            break;
          }
        }
      }
    }
    if (typeof requestId === 'string' && pendingCommands.has(requestId)) {
      const pending = pendingCommands.get(requestId);
      pendingCommands.delete(requestId);
      clearTimeout(pending.timer);
      pending.resolve(msg);
    }

    if (msg?.cmd === 'start' && msg?.ok === true) {
      sidecarInitialized = true;
      sidecarDecoding = true;
      if (typeof msg.sdkVersion === 'string') sidecarSdkVersion = msg.sdkVersion;
    }
    if (msg?.cmd === 'stop' && msg?.ok === true) {
      sidecarDecoding = false;
    }
    if (msg?.cmd === 'deinit' && msg?.ok === true) {
      sidecarInitialized = false;
      sidecarDecoding = false;
      sidecarConnected = null;
    }
    if (msg?.cmd === 'status') {
      sidecarInitialized = msg.initialized === true;
      sidecarDecoding = msg.decoding === true;
      if (msg.connected === true || msg.connected === false) sidecarConnected = msg.connected;
      if (typeof msg.sdkVersion === 'string') sidecarSdkVersion = msg.sdkVersion;
    }
    return;
  }

  if (type === 'error') {
    sidecarBootErrorCode = String(msg.error ?? 'SDK_ERROR');
    sidecarBootError = String(msg.errorDetail ?? '');
  }
}

/**
 * @returns {Promise<void>}
 */
function ensureSidecarProcess() {
  if (sidecarProcess && sidecarReady && sidecarProcess.stdin && !sidecarProcess.killed) {
    return Promise.resolve();
  }
  if (bootPromise) return bootPromise;

  const runtime = probeSidecarRuntime();
  if (runtime.mode === 'native') {
    if (!runtime.nativeExists) {
      sidecarBootErrorCode = 'SIDECAR_NATIVE_NOT_FOUND';
      sidecarBootError = runtime.nativeSidecarExe;
      return Promise.reject(new Error('SIDECAR_NATIVE_NOT_FOUND'));
    }
  } else if (!runtime.nodeExists || !runtime.scriptExists) {
    sidecarBootErrorCode = 'SIDECAR_NODE_NOT_FOUND';
    sidecarBootError = runtime.nodeX86Path;
    return Promise.reject(new Error('SIDECAR_NODE_NOT_FOUND'));
  }

  bootPromise = new Promise((resolve, reject) => {
    sidecarReady = false;
    sidecarBootError = null;
    sidecarBootErrorCode = null;

    const libDir = resolveTxScannerLibDirForSidecar();
    const logPath = resolveTxScannerSidecarLogPath(() => libDir);
    appendTxScannerSidecarLog(logPath, 'host', 'spawn sidecar', { mode: runtime.mode, libDir, logPath });
    const sidecarCwd =
      runtime.mode === 'native' ? path.dirname(runtime.nativeSidecarExe) : resolveSidecarCwd();
    const spawnEnv = {
      ...process.env,
      TX_SCANNER_DLL_DIR: libDir
    };
    if (isTxScannerDebugLogEnabled()) {
      spawnEnv.TX_SCANNER_LOG_FILE = logPath;
    } else {
      delete spawnEnv.TX_SCANNER_LOG_FILE;
    }
    const spawnOptions = {
      cwd: sidecarCwd,
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true,
      env: spawnEnv
    };

    /** @type {import('node:child_process').ChildProcess} */
    let spawnedProcess;
    if (runtime.mode === 'native') {
      spawnedProcess = spawn(runtime.nativeSidecarExe, [], spawnOptions);
    } else {
      spawnedProcess = spawn(runtime.nodeX86Path, [runtime.sidecarScript], spawnOptions);
    }
    sidecarProcess = spawnedProcess;

    const bootTimer = setTimeout(() => {
      sidecarBootErrorCode = 'SIDECAR_BOOT_TIMEOUT';
      sidecarBootError = 'sidecar ready timeout';
      bootPromise = null;
      reject(new Error('SIDECAR_BOOT_TIMEOUT'));
    }, 15000);

    sidecarReader = readline.createInterface({ input: spawnedProcess.stdout });
    sidecarReader.on('line', (line) => {
      const logPath = resolveTxScannerSidecarLogPath(() => resolveTxScannerLibDirForSidecar());
      try {
        const msg = JSON.parse(String(line));
        if (shouldLogSidecarStdout(msg)) {
          appendTxScannerSidecarLog(logPath, 'host', 'stdout', { line: String(line) });
        }
        handleSidecarMessage(msg);
        if (msg?.type === 'ready') {
          clearTimeout(bootTimer);
          bootPromise = null;
          if (msg.ok === true) {
            sidecarReady = true;
            resolve();
          } else {
            sidecarReady = false;
            reject(new Error(sidecarBootErrorCode ?? 'SDK_NOT_LOADED'));
          }
        }
      } catch (err) {
        appendTxScannerSidecarLog(logPath, 'host', 'stdout parse failed', {
          line: String(line),
          error: err instanceof Error ? err.message : String(err)
        });
        console.error('[tx-scanner-sidecar-host] parse line failed:', line, err);
      }
    });

    spawnedProcess.stderr?.on('data', (chunk) => {
      const text = String(chunk);
      const logPath = resolveTxScannerSidecarLogPath(() => resolveTxScannerLibDirForSidecar());
      appendTxScannerSidecarLog(logPath, 'host', 'stderr', { text });
      console.error('[tx-scanner-sidecar-host] stderr:', text);
    });

    spawnedProcess.on('error', (err) => {
      clearTimeout(bootTimer);
      bootPromise = null;
      if (sidecarProcess === spawnedProcess) {
        sidecarProcess = null;
        sidecarReader = null;
        sidecarReady = false;
      }
      sidecarBootErrorCode = 'SIDECAR_SPAWN_FAILED';
      sidecarBootError = err.message;
      reject(err);
    });

    spawnedProcess.on('exit', (code) => {
      console.log('[tx-scanner-sidecar-host] exited', code);
      const logPath = resolveTxScannerSidecarLogPath(() => resolveTxScannerLibDirForSidecar());
      if (code === 3221225477 || code === -1073741819) {
        appendTxScannerSidecarLog(logPath, 'host', 'sidecar crashed', {
          exitCode: code,
          hint: 'ACCESS_VIOLATION during SDK call (often decode_start without FData USB device)'
        });
      }
      if (sidecarProcess !== spawnedProcess) return;
      sidecarReady = false;
      sidecarProcess = null;
      sidecarReader = null;
      bootPromise = null;
    });
  });

  return bootPromise;
}

/**
 * @param {Record<string, unknown>} command
 * @param {number} [timeoutMs]
 * @returns {Promise<Record<string, unknown>>}
 */
async function sendSidecarCommand(command, timeoutMs = 20000, options = {}) {
  const resetOnFailure = options.resetOnFailure !== false;
  await ensureSidecarProcess();
  if (!sidecarProcess?.stdin || sidecarProcess.killed) {
    sidecarReady = false;
    throw new Error('SIDECAR_STDIN_UNAVAILABLE');
  }

  const requestId = `req_${++commandSeq}`;
  const payload = { ...command, requestId };
  const logPath = resolveTxScannerSidecarLogPath(() => resolveTxScannerLibDirForSidecar());
  appendTxScannerSidecarLog(logPath, 'host', 'stdin', payload);

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      rejectSidecarCommand(requestId, new Error('SIDECAR_COMMAND_TIMEOUT'), resetOnFailure);
    }, timeoutMs);

    pendingCommands.set(requestId, { resolve, reject, timer, cmd: String(command.cmd ?? '') });
    const payloadLine = `${JSON.stringify(payload)}\n`;
    const canContinue = sidecarProcess.stdin.write(payloadLine);
    if (!canContinue) {
      sidecarProcess.stdin.once('drain', () => {});
    }
  });
}

/**
 * @param {string} requestId
 * @param {Error} err
 */
function rejectSidecarCommand(requestId, err, resetOnFailure = true) {
  const pending = pendingCommands.get(requestId);
  if (!pending) return;
  pendingCommands.delete(requestId);
  clearTimeout(pending.timer);
  pending.reject(err);
  if (resetOnFailure) {
    resetSidecarProcessAfterFailure('command timeout or failure');
  }
}

/**
 * 命令超时或侧车无响应时杀掉进程，避免后续 stop/status 永久阻塞。
 *
 * @param {string} reason
 */
function resetSidecarProcessAfterFailure(reason) {
  console.error('[tx-scanner-sidecar-host] reset sidecar:', reason);
  if (sidecarProcess && !sidecarProcess.killed) {
    try {
      sidecarProcess.kill();
    } catch {
      /* ignore */
    }
  }
  sidecarProcess = null;
  sidecarReader = null;
  bootPromise = null;
  sidecarReady = false;
  pendingCommands.forEach((pending) => {
    clearTimeout(pending.timer);
    pending.reject(new Error('SIDECAR_RESET'));
  });
  pendingCommands.clear();
}

/**
 * @param {{ onDecode?: Function, onCommState?: Function }} [forwarders]
 */
function configureSidecarForwarders(forwarders = {}) {
  onDecodeForward = typeof forwarders.onDecode === 'function' ? forwarders.onDecode : null;
  onCommForward = typeof forwarders.onCommState === 'function' ? forwarders.onCommState : null;
}

/**
 * @param {Record<string, unknown>} msg
 * @returns {boolean}
 */
function shouldLogSidecarStdout(msg) {
  return msg?.type !== 'decode';
}

/**
 * @param {{ quick?: boolean, forceUsbRefresh?: boolean }} [options]
 * @returns {Promise<Record<string, unknown>>}
 */
async function getSidecarTxScannerStatus(options = {}) {
  const quick = options.quick !== false;
  const runtime = probeSidecarRuntime();
  const libDir = resolveTxScannerLibDirForSidecar();
  const dllPath = path.join(libDir, 'tx_windows_fdata.dll');

  let usbHostDiagnose = null;
  try {
    usbHostDiagnose = await getTxScannerUsbHostDiagnoseAsync({
      force: options.forceUsbRefresh === true
    });
  } catch (err) {
    usbHostDiagnose = {
      ok: false,
      error: err instanceof Error ? err.message : String(err)
    };
  }

  const base = {
    bridgeMode: 'sidecar',
    sidecarKind: runtime.mode,
    sidecarProcessArch: 'ia32',
    processArch: process.arch,
    dllPath,
    libDir,
    dllExists: fs.existsSync(dllPath),
    nativeSidecarExe: runtime.nativeSidecarExe,
    nativeExists: runtime.nativeExists,
    usbHostDiagnose,
    ...runtime
  };

  if (usbHostDiagnose?.mode === 'hid_keyboard') {
    return {
      ok: true,
      sdkLoaded: false,
      sdkRequired: false,
      initialized: false,
      decoding: false,
      connected: true,
      scannerMode: 'hid_keyboard',
      sidecarRunning: false,
      ...base
    };
  }

  if (runtime.mode === 'native' && !runtime.nativeExists) {
    return {
      ok: false,
      sdkLoaded: false,
      error: 'SIDECAR_NATIVE_NOT_FOUND',
      errorDetail: runtime.nativeSidecarExe,
      sidecarRunning: false,
      ...base
    };
  }

  if (runtime.mode === 'node' && !runtime.nodeExists) {
    return {
      ok: false,
      sdkLoaded: false,
      error: 'SIDECAR_NODE_NOT_FOUND',
      errorDetail: runtime.nodeX86Path,
      sidecarRunning: false,
      ...base
    };
  }

  const sidecarAlive =
    sidecarProcess && sidecarReady && sidecarProcess.stdin && !sidecarProcess.killed;

  if (sidecarAlive) {
    try {
      const result = await sendSidecarCommand({ cmd: 'status' }, 5000);
      return {
        ok: result.ok === true,
        sdkLoaded: result.sdkLoaded === true,
        initialized: result.initialized === true,
        decoding: result.decoding === true,
        connected: result.connected ?? sidecarConnected,
        sdkVersion: result.sdkVersion ?? sidecarSdkVersion,
        sidecarRunning: true,
        ...base
      };
    } catch (err) {
      if (!quick) {
        return {
          ok: false,
          sdkLoaded: false,
          error: sidecarBootErrorCode ?? 'SIDECAR_ERROR',
          errorDetail: sidecarBootError ?? (err instanceof Error ? err.message : String(err)),
          sidecarRunning: false,
          ...base
        };
      }
    }
  }

  if (quick) {
    return {
      ok: base.dllExists && (runtime.nativeExists || runtime.nodeExists),
      sdkLoaded: base.dllExists && (runtime.nativeExists || runtime.nodeExists),
      initialized: sidecarInitialized,
      decoding: sidecarDecoding,
      connected:
        usbHostDiagnose?.mode === 'fdata_usb'
          ? sidecarConnected
          : usbHostDiagnose?.mode === 'not_found'
            ? false
            : null,
      sdkVersion: sidecarSdkVersion || '',
      sidecarRunning: false,
      ...base
    };
  }

  try {
    await ensureSidecarProcess();
    const result = await sendSidecarCommand({ cmd: 'status' });
    return {
      ok: result.ok === true,
      sdkLoaded: result.sdkLoaded === true,
      initialized: result.initialized === true,
      decoding: result.decoding === true,
      connected: result.connected ?? sidecarConnected,
      sdkVersion: result.sdkVersion ?? sidecarSdkVersion,
      sidecarRunning: true,
      ...base
    };
  } catch (err) {
    return {
      ok: false,
      sdkLoaded: false,
      error: sidecarBootErrorCode ?? 'SIDECAR_ERROR',
      errorDetail: sidecarBootError ?? (err instanceof Error ? err.message : String(err)),
      sidecarRunning: false,
      ...base
    };
  }
}

/**
 * @param {{ triggerMode?: number, saveTriggerMode?: boolean }} [options]
 * @returns {Promise<Record<string, unknown>>}
 */
async function startSidecarTxScanner(options = {}) {
  const usbHostDiagnose = await getTxScannerUsbHostDiagnoseAsync({
    force: options.forceUsbRefresh === true
  });
  if (usbHostDiagnose?.mode === 'hid_keyboard') {
    return {
      ok: false,
      error: 'SDK_NOT_REQUIRED',
      errorDetail: 'hid_keyboard',
      bridgeMode: 'sidecar',
      scannerMode: 'hid_keyboard'
    };
  }

  try {
    const result = await sendSidecarCommand(
      {
        cmd: 'start',
        triggerMode: options.triggerMode,
        saveTriggerMode: options.saveTriggerMode,
        applyTriggerMode: options.applyTriggerMode,
        waitForDevice: options.waitForDevice,
        deviceWaitTimeoutMs: options.deviceWaitTimeoutMs
      },
      35000
    );
    appendTxScannerSidecarLog(
      resolveTxScannerSidecarLogPath(() => resolveTxScannerLibDirForSidecar()),
      'host',
      'start result',
      result
    );
    return { ...result, bridgeMode: 'sidecar' };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const errorCode =
      message === 'SIDECAR_COMMAND_TIMEOUT' || message === 'SIDECAR_RESET' || message === 'SIDECAR_STDIN_UNAVAILABLE'
        ? message
        : sidecarBootErrorCode ?? 'SIDECAR_ERROR';
    return {
      ok: false,
      error: errorCode,
      errorDetail: sidecarBootError ?? message,
      bridgeMode: 'sidecar'
    };
  }
}

/**
 * @returns {Promise<Record<string, unknown>>}
 */
async function stopSidecarTxScanner() {
  try {
    const result = await sendSidecarCommand({ cmd: 'stop' });
    return { ...result, bridgeMode: 'sidecar' };
  } catch (err) {
    return {
      ok: false,
      error: 'SIDECAR_ERROR',
      errorDetail: err instanceof Error ? err.message : String(err),
      bridgeMode: 'sidecar'
    };
  }
}

/**
 * @returns {Promise<Record<string, unknown>>}
 */
async function deinitSidecarTxScanner() {
  try {
    const result = await sendSidecarCommand({ cmd: 'deinit' });
    if (sidecarProcess && !sidecarProcess.killed) {
      sidecarProcess.kill();
      sidecarProcess = null;
      sidecarReader = null;
      bootPromise = null;
      sidecarReady = false;
    }
    return { ...result, bridgeMode: 'sidecar' };
  } catch (err) {
    return {
      ok: false,
      error: 'SIDECAR_ERROR',
      errorDetail: err instanceof Error ? err.message : String(err),
      bridgeMode: 'sidecar'
    };
  }
}

module.exports = {
  probeSidecarRuntime,
  configureSidecarForwarders,
  getSidecarTxScannerStatus,
  startSidecarTxScanner,
  stopSidecarTxScanner,
  deinitSidecarTxScanner,
  resolveTxScannerSidecarLogPath: () => resolveTxScannerSidecarLogPath(() => resolveTxScannerLibDirForSidecar())
};
