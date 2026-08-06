/**
 * TX 扫码 SDK 32 位侧车宿主：64 位 Electron 主进程 spawn node-x86 + sidecar.js。
 */
const path = require('node:path');
const fs = require('node:fs');
const readline = require('node:readline');
const { spawn } = require('node:child_process');
const { app } = require('electron');

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
 * @returns {{ nodeX86Path: string, sidecarScript: string, nodeExists: boolean, scriptExists: boolean }}
 */
function probeSidecarRuntime() {
  const nodeX86Path = resolveNodeX86Path();
  const sidecarScript = resolveSidecarScriptPath();
  return {
    nodeX86Path,
    sidecarScript,
    nodeExists: fs.existsSync(nodeX86Path),
    scriptExists: fs.existsSync(sidecarScript)
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
    const requestId = msg?.requestId;
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
  if (sidecarProcess && sidecarReady) return Promise.resolve();
  if (bootPromise) return bootPromise;

  const runtime = probeSidecarRuntime();
  if (!runtime.nodeExists || !runtime.scriptExists) {
    sidecarBootErrorCode = 'SIDECAR_NODE_NOT_FOUND';
    sidecarBootError = runtime.nodeX86Path;
    return Promise.reject(new Error('SIDECAR_NODE_NOT_FOUND'));
  }

  bootPromise = new Promise((resolve, reject) => {
    sidecarReady = false;
    sidecarBootError = null;
    sidecarBootErrorCode = null;

    sidecarProcess = spawn(runtime.nodeX86Path, [runtime.sidecarScript], {
      cwd: resolveSidecarCwd(),
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true,
      env: {
        ...process.env,
        TX_SCANNER_DLL_DIR: resolveTxScannerLibDirForSidecar()
      }
    });

    const bootTimer = setTimeout(() => {
      sidecarBootErrorCode = 'SIDECAR_BOOT_TIMEOUT';
      sidecarBootError = 'sidecar ready timeout';
      bootPromise = null;
      reject(new Error('SIDECAR_BOOT_TIMEOUT'));
    }, 15000);

    sidecarReader = readline.createInterface({ input: sidecarProcess.stdout });
    sidecarReader.on('line', (line) => {
      try {
        const msg = JSON.parse(String(line));
        handleSidecarMessage(msg);
        if (msg?.type === 'ready') {
          clearTimeout(bootTimer);
          bootPromise = null;
          if (msg.ok === true) resolve();
          else reject(new Error(sidecarBootErrorCode ?? 'SDK_NOT_LOADED'));
        }
      } catch (err) {
        console.error('[tx-scanner-sidecar-host] parse line failed:', line, err);
      }
    });

    sidecarProcess.stderr?.on('data', (chunk) => {
      console.error('[tx-scanner-sidecar-host] stderr:', String(chunk));
    });

    sidecarProcess.on('error', (err) => {
      clearTimeout(bootTimer);
      bootPromise = null;
      sidecarBootErrorCode = 'SIDECAR_SPAWN_FAILED';
      sidecarBootError = err.message;
      reject(err);
    });

    sidecarProcess.on('exit', (code) => {
      sidecarReady = false;
      sidecarProcess = null;
      sidecarReader = null;
      bootPromise = null;
      console.log('[tx-scanner-sidecar-host] exited', code);
    });
  });

  return bootPromise;
}

/**
 * @param {Record<string, unknown>} command
 * @param {number} [timeoutMs]
 * @returns {Promise<Record<string, unknown>>}
 */
async function sendSidecarCommand(command, timeoutMs = 20000) {
  await ensureSidecarProcess();
  if (!sidecarProcess?.stdin) {
    throw new Error('SIDECAR_STDIN_UNAVAILABLE');
  }

  const requestId = `req_${++commandSeq}`;
  const payload = { ...command, requestId };

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      pendingCommands.delete(requestId);
      reject(new Error('SIDECAR_COMMAND_TIMEOUT'));
    }, timeoutMs);

    pendingCommands.set(requestId, { resolve, reject, timer });
    sidecarProcess.stdin.write(`${JSON.stringify(payload)}\n`);
  });
}

/**
 * @param {{ onDecode?: Function, onCommState?: Function }} [forwarders]
 */
function configureSidecarForwarders(forwarders = {}) {
  onDecodeForward = typeof forwarders.onDecode === 'function' ? forwarders.onDecode : null;
  onCommForward = typeof forwarders.onCommState === 'function' ? forwarders.onCommState : null;
}

/**
 * @returns {Promise<Record<string, unknown>>}
 */
async function getSidecarTxScannerStatus() {
  const runtime = probeSidecarRuntime();
  const base = {
    bridgeMode: 'sidecar',
    sidecarProcessArch: 'ia32',
    processArch: process.arch,
    dllPath: path.join(resolveTxScannerLibDirForSidecar(), 'tx_windows_fdata.dll'),
    libDir: resolveTxScannerLibDirForSidecar(),
    dllExists: fs.existsSync(path.join(resolveTxScannerLibDirForSidecar(), 'tx_windows_fdata.dll')),
    ...runtime
  };

  if (!runtime.nodeExists) {
    return {
      ok: false,
      sdkLoaded: false,
      error: 'SIDECAR_NODE_NOT_FOUND',
      errorDetail: runtime.nodeX86Path,
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
      ...base
    };
  } catch (err) {
    return {
      ok: false,
      sdkLoaded: false,
      error: sidecarBootErrorCode ?? 'SIDECAR_ERROR',
      errorDetail: sidecarBootError ?? (err instanceof Error ? err.message : String(err)),
      ...base
    };
  }
}

/**
 * @param {{ triggerMode?: number, saveTriggerMode?: boolean }} [options]
 * @returns {Promise<Record<string, unknown>>}
 */
async function startSidecarTxScanner(options = {}) {
  try {
    const result = await sendSidecarCommand({
      cmd: 'start',
      triggerMode: options.triggerMode,
      saveTriggerMode: options.saveTriggerMode
    });
    return { ...result, bridgeMode: 'sidecar' };
  } catch (err) {
    return {
      ok: false,
      error: sidecarBootErrorCode ?? 'SIDECAR_ERROR',
      errorDetail: err instanceof Error ? err.message : String(err),
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
  deinitSidecarTxScanner
};
