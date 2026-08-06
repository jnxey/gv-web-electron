/**
 * 【TX 扫码摄像头 SDK 桥接】USB FData 模式（koffi + tx_windows_fdata.dll）
 *
 * 依赖：
 * - koffi：加载 native DLL 并注册 C 回调
 * - tx_windows_fdata.dll：厂商 SDK，放置于 resources/app/lib/
 *
 * 数据流：
 *   SDK 扫码/连接回调 → broadcast() → BrowserWindow.webContents.send
 *   → 渲染进程 preload（onTxScannerDecode / onTxScannerCommState）
 *   → gv-web electron.js → useTxScanner / 业务页
 *
 * 生命周期（与官方 Demo 一致）：
 *   startTxScanner：register 回调 → init → set_trigger_mode → decode_start
 *   stopTxScanner：decode_stop（保留 init，可再次 start）
 *   deinitTxScanner：stop → deinit → koffi.unregister
 *
 * @see D:/Work/gv-web-electron/index.js ipcMain.handle('tx-scanner-*')
 */
const path = require('node:path');
const fs = require('node:fs');
const { app, BrowserWindow } = require('electron');
const sidecarHost = require('./tx-scanner-sidecar-host');
const { getTxScannerUsbHostDiagnoseAsync } = require('./tx-scanner-usb-check');

/** PE Machine：Intel 386+（32 位） */
const IMAGE_FILE_MACHINE_I386 = 0x014c;
/** PE Machine：AMD64（64 位） */
const IMAGE_FILE_MACHINE_AMD64 = 0x8664;

/** @type {'native' | 'sidecar' | null} 桥接模式：同进程 koffi 或 32 位侧车 */
let bridgeMode = null;

sidecarHost.configureSidecarForwarders({
  onDecode: (payload) => broadcast('tx-scanner-decode', payload),
  onCommState: (payload) => broadcast('tx-scanner-comm-state', payload)
});

/** @type {import('koffi') | null} koffi 模块实例，首次 ensureLibLoaded 时 require */
let koffi = null;
/** @type {object | null} koffi.load 返回的 DLL 句柄 */
let lib = null;
/** @type {string | null} DLL 加载失败时的错误信息，避免重复尝试 load */
let loadError = null;
/** @type {string | null} 结构化错误码：DLL_NOT_FOUND / DLL_ARCH_MISMATCH / DLL_DEPENDENCY_MISSING 等 */
let loadErrorCode = null;

/** --- SDK 运行时状态 --- */

/** @type {boolean} 是否已调用 tx_scanner_init 成功 */
let initialized = false;
/** @type {boolean} 是否已调用 tx_scanner_decode_start 且未 stop */
let decoding = false;
/** @type {number | null} USB 连接状态：0 断开 / 1 连接；null 表示尚未收到回调 */
let connected = null;

/** --- 已注册回调句柄（deinit 时必须 unregister，防止 koffi 槽位泄漏） --- */

/** @type {unknown} koffi.register 返回的解码数据回调句柄 */
let decodeCbHandle = null;
/** @type {unknown} koffi.register 返回的通信状态回调句柄 */
let commStateCbHandle = null;

/** SDK 返回值：成功 */
const SUCC = 0;

/**
 * DB_TRIGGER_MODE_E：自动感应模式（摄像头扫码常用）。
 * 对应 tx_scanner.h 中 DB_TRIGGER_M_AUTOSENS = 0x03。
 */
const TRIGGER_MODE_AUTOSENS = 3;

/** --- 回调 C 类型原型（koffi.proto 定义，供 register 与 lib.func 使用） --- */

/** @type {import('koffi').IKoffiCType | null} 解码数据回调：int32 (uint8 codeType, uint8 *pBuf, uint32 len) */
let DecodeDataCb = null;
/** @type {import('koffi').IKoffiCType | null} 通信状态回调：void (uint8 ucState) */
let CommStateCb = null;

/** --- 绑定的 SDK 导出函数表 --- */

/** @type {Record<string, Function>} tx_scanner_* 函数引用，ensureLibLoaded 时一次性绑定 */
let fns = {};

/**
 * 解析 SDK lib 目录（tx_windows_fdata.dll 与 msvcr100d.dll 等依赖需同目录）。
 *
 * @returns {string}
 */
function resolveTxScannerLibDir() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'app/lib');
  }
  return path.join(__dirname, 'resources/app/lib');
}

/**
 * 解析 tx_windows_fdata.dll 的绝对路径。
 * 开发态与打包态路径不同，与 autoreplyprint-bridge 保持一致。
 *
 * @returns {string} DLL 绝对路径
 */
function resolveTxScannerDllPath() {
  return path.join(resolveTxScannerLibDir(), 'tx_windows_fdata.dll');
}

/**
 * 读取 PE 文件的 Machine 字段，判断 DLL 为 x86 或 x64。
 *
 * @param {string} filePath
 * @returns {number | null}
 */
function readPeMachineType(filePath) {
  if (!fs.existsSync(filePath)) return null;
  let fd;
  try {
    fd = fs.openSync(filePath, 'r');
    const dosHeader = Buffer.alloc(64);
    fs.readSync(fd, dosHeader, 0, 64, 0);
    const peOffset = dosHeader.readUInt32LE(0x3c);
    const peSig = Buffer.alloc(4);
    fs.readSync(fd, peSig, 0, 4, peOffset);
    if (peSig.toString('ascii') !== 'PE\0\0') return null;
    const machineBuf = Buffer.alloc(2);
    fs.readSync(fd, machineBuf, 0, 2, peOffset + 4);
    return machineBuf.readUInt16LE(0);
  } catch {
    return null;
  } finally {
    if (fd !== undefined) fs.closeSync(fd);
  }
}

/**
 * @param {number | null} machine
 * @returns {'ia32' | 'x64' | 'unknown'}
 */
function peMachineToArch(machine) {
  if (machine === IMAGE_FILE_MACHINE_I386) return 'ia32';
  if (machine === IMAGE_FILE_MACHINE_AMD64) return 'x64';
  return 'unknown';
}

/**
 * 64 位 Electron + 32 位 SDK DLL 时走侧车；其余同架构走 native koffi。
 *
 * @returns {'native' | 'sidecar'}
 */
function resolveBridgeMode() {
  if (bridgeMode) return bridgeMode;

  const dllPath = resolveTxScannerDllPath();
  if (!fs.existsSync(dllPath)) {
    bridgeMode = 'native';
    return bridgeMode;
  }

  const machine = readPeMachineType(dllPath);
  if (process.arch === 'x64' && machine === IMAGE_FILE_MACHINE_I386) {
    bridgeMode = 'sidecar';
  } else {
    bridgeMode = 'native';
  }
  return bridgeMode;
}

/**
 * 探测 DLL 文件是否存在及 Electron 进程架构。
 *
 * @returns {{ dllPath: string, libDir: string, dllExists: boolean, processArch: string }}
 */
function probeTxScannerDll() {
  const dllPath = resolveTxScannerDllPath();
  const machine = fs.existsSync(dllPath) ? readPeMachineType(dllPath) : null;
  return {
    dllPath,
    libDir: resolveTxScannerLibDir(),
    dllExists: fs.existsSync(dllPath),
    processArch: process.arch,
    dllMachine: machine,
    dllArch: peMachineToArch(machine),
    bridgeMode: resolveBridgeMode()
  };
}

/**
 * 将 koffi.load 异常归类为可读错误码。
 *
 * @param {unknown} err
 * @param {{ dllPath: string, dllExists: boolean, processArch: string }} probe
 * @returns {{ error: string, errorDetail: string }}
 */
function classifyTxScannerLoadError(err, probe) {
  const message = err instanceof Error ? err.message : String(err);

  if (!probe.dllExists) {
    return {
      error: 'DLL_NOT_FOUND',
      errorDetail: probe.dllPath
    };
  }

  if (/386|x86|32.?bit|AMD x64|different architecture/i.test(message)) {
    return {
      error: 'DLL_ARCH_MISMATCH',
      errorDetail: `Electron=${probe.processArch}; SDK DLL must be 64-bit (x64) tx_windows_fdata.dll`
    };
  }

  if (/找不到指定的模块|specified module|cannot find module|error 126/i.test(message)) {
    return {
      error: 'DLL_DEPENDENCY_MISSING',
      errorDetail: message
    };
  }

  return {
    error: 'SDK_NOT_LOADED',
    errorDetail: message
  };
}

/**
 * 向所有 Electron 窗口广播 IPC 事件（主进程 → 渲染进程 push）。
 * 扫码结果与 USB 连接状态均通过此函数推送。
 *
 * @param {string} channel IPC 通道名，如 tx-scanner-decode
 * @param {Record<string, unknown>} payload 发送给渲染进程的数据
 */
function broadcast(channel, payload) {
  // Step ①：遍历当前所有 BrowserWindow
  for (const win of BrowserWindow.getAllWindows()) {
    // Step ②：跳过已销毁窗口
    if (win.isDestroyed()) continue;
    // Step ③：webContents.send 推送到对应渲染进程
    try {
      win.webContents.send(channel, payload);
    } catch (err) {
      console.error(`[tx-scanner-bridge] broadcast ${channel} failed:`, err);
    }
  }
}

/**
 * 从 SDK 回调中的 C 指针读取指定长度的字节数组。
 *
 * @param {unknown} buf SDK 传入的 uint8 * 指针
 * @param {number} len 有效字节长度 uiBufLen
 * @returns {Buffer} Node Buffer；无效时返回空 Buffer
 */
function bufferFromPointer(buf, len) {
  const size = Number(len);
  // Step ①：校验指针与长度
  if (!buf || !Number.isFinite(size) || size <= 0) return Buffer.alloc(0);
  // Step ②：koffi.decode 按 uint8 数组读取
  const bytes = koffi.decode(buf, koffi.array('uint8', size));
  // Step ③：转为 Node Buffer 便于 toString / base64
  return Buffer.from(bytes);
}

/**
 * SDK 解码数据回调（tx_scanner_decode_data_cb_fun）。
 * 扫码成功时由 native 层调用；将结果转 UTF-8 并广播到渲染进程。
 *
 * @param {number} codeType 码制类型（SDK ucCodeType）
 * @param {unknown} buf 扫码内容指针
 * @param {number} len 内容长度
 * @returns {number} 固定返回 SUCC(0)，满足 SDK 回调约定
 */
function onDecodeData(codeType, buf, len) {
  try {
    // Step ①：从 C 指针读取原始字节
    const rawBuffer = bufferFromPointer(buf, len);
    const data = rawBuffer.toString('utf8');
    // Step ②：广播给所有渲染窗口
    broadcast('tx-scanner-decode', {
      codeType: Number(codeType),
      data,
      length: rawBuffer.length
    });
  } catch (err) {
    console.error('[tx-scanner-bridge] decode callback failed:', err);
  }
  // Step ③：告知 SDK 回调处理成功
  return SUCC;
}

/**
 * SDK USB 连接状态回调（tx_scanner_comm_state_cb_fun）。
 * 设备插拔时由 native 层调用。
 *
 * @param {number} state 0=断开，1=连接
 */
function onCommState(state) {
  // Step ①：更新模块级连接状态
  connected = Number(state);
  // Step ②：广播连接状态变化
  broadcast('tx-scanner-comm-state', { connected: connected === 1 });
}

/**
 * 懒加载 tx_windows_fdata.dll，并绑定全部用到的 SDK 函数与回调原型。
 * 失败时记录 loadError，后续调用直接返回 false。
 *
 * @returns {boolean} DLL 是否可用
 */
function ensureLibLoaded() {
  // Step ①：侧车模式不在主进程 load DLL
  if (resolveBridgeMode() === 'sidecar') return false;

  // Step ②：已加载则短路
  if (lib) return true;

  const probe = probeTxScannerDll();

  try {
    // Step ②：加载 koffi 与 DLL
    koffi = require('koffi');
    lib = koffi.load(probe.dllPath);
    loadError = null;
    loadErrorCode = null;

    // Step ③：定义 C 回调函数原型（__cdecl 与 SDK extern "C" 一致）
    DecodeDataCb = koffi.proto('int __cdecl tx_scanner_decode_data_cb(uint8 codeType, uint8 *pBuf, uint32 uiBufLen)');
    CommStateCb = koffi.proto('void __cdecl tx_scanner_comm_state_cb(uint8 ucState)');

    // Step ④：绑定 SDK 导出函数到 fns 表
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
    const classified = classifyTxScannerLoadError(err, probe);
    loadErrorCode = classified.error;
    loadError = classified.errorDetail;
    console.error('[tx-scanner-bridge] load failed:', classified.error, classified.errorDetail, probe);
    lib = null;
    return false;
  }
}

/**
 * 构造统一的「SDK 未加载」错误响应，供 start/getStatus 等复用。
 *
 * @returns {{ ok: false, error: string, errorDetail?: string }}
 */
function sdkNotLoadedResult() {
  return {
    ok: false,
    error: loadErrorCode ?? 'SDK_NOT_LOADED',
    errorDetail: loadError ?? 'tx_windows_fdata.dll not available'
  };
}

/**
 * 读取 SDK 包版本字符串（tx_scanner_get_version）。
 *
 * @returns {string} 版本文本；失败或未加载时返回空字符串
 */
function readSdkVersion() {
  if (!ensureLibLoaded()) return '';
  // Step ①：分配版本缓冲区
  const buffer = Buffer.alloc(64);
  // Step ②：调用 SDK 写入版本
  const len = fns.tx_scanner_get_version(buffer, buffer.length);
  if (len <= 0) return '';
  // Step ③：截断 C 字符串末尾 \0
  return buffer.toString('utf8', 0, len).replace(/\0.*$/, '');
}

/**
 * @param {number} ms
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * @returns {{ ready: boolean, reason: string, deviceInfo?: string }}
 */
function probeDeviceReady() {
  if (connected === 1) return { ready: true, reason: 'comm' };
  if (connected === 0) return { ready: false, reason: 'disconnected' };
  if (!lib || !initialized) return { ready: false, reason: 'not_initialized' };

  try {
    const buffer = Buffer.alloc(128);
    const ret = fns.tx_scanner_get_version_info(buffer, buffer.length);
    if (ret >= SUCC) {
      connected = 1;
      broadcast('tx-scanner-comm-state', { connected: true });
      return {
        ready: true,
        reason: 'version_info',
        deviceInfo: buffer.toString('utf8', 0, ret).replace(/\0.*$/, '')
      };
    }
  } catch {
    /* ignore */
  }

  return { ready: false, reason: 'unknown' };
}

/**
 * @param {number} timeoutMs
 * @returns {Promise<{ ready: boolean, reason: string, deviceInfo?: string }>}
 */
async function waitForDeviceReady(timeoutMs) {
  const first = probeDeviceReady();
  if (first.ready) return first;

  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    await sleep(200);
    const probe = probeDeviceReady();
    if (probe.ready) return probe;
  }
  return probeDeviceReady();
}

/**
 * 查询桥接层与设备当前状态快照，供 IPC tx-scanner-get-status 使用。
 *
 * @param {{ quick?: boolean, forceUsbRefresh?: boolean }} [options]
 * @returns {Promise<Record<string, unknown>>}
 */
async function getTxScannerStatus(options = {}) {
  const probe = probeTxScannerDll();

  if (resolveBridgeMode() === 'sidecar') {
    const status = await sidecarHost.getSidecarTxScannerStatus(options);
    return {
      ...probe,
      ...status,
      bridgeMode: 'sidecar'
    };
  }

  // Step ①：DLL 未加载时返回错误分支
  if (!ensureLibLoaded()) {
    let usbHostDiagnose = null;
    try {
      usbHostDiagnose = await getTxScannerUsbHostDiagnoseAsync({
        force: options.forceUsbRefresh === true
      });
    } catch (err) {
      usbHostDiagnose = { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
    return {
      ok: false,
      sdkLoaded: false,
      initialized,
      decoding,
      connected,
      error: loadErrorCode ?? 'SDK_NOT_LOADED',
      errorDetail: loadError ?? 'tx_windows_fdata.dll not available',
      usbHostDiagnose,
      ...probe
    };
  }

  // Step ②：组装完整状态快照（含 USB 主机诊断，供 HID/FData 自动分流）
  let usbHostDiagnose = null;
  try {
    usbHostDiagnose = await getTxScannerUsbHostDiagnoseAsync({
      force: options.forceUsbRefresh === true
    });
  } catch (err) {
    usbHostDiagnose = { ok: false, error: err instanceof Error ? err.message : String(err) };
  }

  return {
    ok: true,
    sdkLoaded: true,
    initialized,
    decoding,
    connected: connected === null ? null : connected === 1,
    sdkVersion: readSdkVersion(),
    triggerMode: initialized ? fns.tx_scanner_get_trigger_mode() : null,
    bridgeMode: 'native',
    usbHostDiagnose,
    ...probe
  };
}

/**
 * 初始化扫码 SDK 并启动解码。
 * 幂等：重复调用不会重复 init/register，仅确保处于 decoding 状态。
 *
 * @param {{ triggerMode?: number, saveTriggerMode?: boolean, applyTriggerMode?: boolean }} [options]
 *   applyTriggerMode: true 时才调用 set_trigger_mode（需设备已连接；失败不阻断 decode_start）
 * @returns {Promise<Record<string, unknown>>}
 */
async function startTxScanner(options = {}) {
  if (resolveBridgeMode() === 'sidecar') {
    return sidecarHost.startSidecarTxScanner(options);
  }

  // Step ①：确保 DLL 已加载
  if (!ensureLibLoaded()) return sdkNotLoadedResult();

  const applyTriggerMode = options.applyTriggerMode === true;
  const waitForDevice = options.waitForDevice !== false;
  const triggerMode = Number(options.triggerMode);
  const resolvedTriggerMode =
    Number.isFinite(triggerMode) && triggerMode >= 0 && triggerMode <= 3 ? triggerMode : TRIGGER_MODE_AUTOSENS;
  const saveTriggerMode = options.saveTriggerMode === true ? 1 : 0;

  try {
    // Step ②：首次启动时 koffi.register 持久回调（SDK 异步调用，不可 GC）
    if (!decodeCbHandle) {
      decodeCbHandle = koffi.register(onDecodeData, koffi.pointer(DecodeDataCb));
      commStateCbHandle = koffi.register(onCommState, koffi.pointer(CommStateCb));
    }

    // Step ③：首次 init：注册回调 → tx_scanner_init
    if (!initialized) {
      let ret = fns.tx_scanner_decode_data_fun_register(decodeCbHandle);
      if (ret < SUCC) return { ok: false, error: 'REGISTER_DECODE_CB_FAILED', detail: ret };

      ret = fns.tx_scanner_comm_state_fun_register(commStateCbHandle);
      if (ret < SUCC) return { ok: false, error: 'REGISTER_COMM_CB_FAILED', detail: ret };

      ret = fns.tx_scanner_init();
      if (ret < SUCC) return { ok: false, error: 'INIT_FAILED', detail: ret };
      initialized = true;
    }

    if (waitForDevice) {
      const timeoutMs = Number(options.deviceWaitTimeoutMs);
      const deviceProbe = await waitForDeviceReady(Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : 12000);
      if (!deviceProbe.ready) {
        return {
          ok: false,
          error: 'DEVICE_NOT_CONNECTED',
          connected: connected === null ? null : connected === 1,
          detail: -1,
          deviceProbeReason: deviceProbe.reason
        };
      }
    }

    // Step ④：启动解码（与官方 Demo 一致，优先 decode_start）
    if (!decoding) {
      const startRet = fns.tx_scanner_decode_start();
      if (startRet < SUCC) {
        return {
          ok: false,
          error: connected === 1 ? 'DECODE_START_FAILED' : 'DEVICE_NOT_CONNECTED',
          connected: connected === null ? null : connected === 1,
          detail: startRet
        };
      }
      decoding = true;
    }

    // Step ⑤：可选设置触发模式（需设备已连接；失败仅警告，不阻断解码）
    /** @type {Record<string, unknown> | null} */
    let triggerModeWarning = null;
    if (applyTriggerMode) {
      const modeRet = fns.tx_scanner_set_trigger_mode(resolvedTriggerMode, saveTriggerMode);
      if (modeRet < SUCC) {
        triggerModeWarning = {
          error: 'SET_TRIGGER_MODE_FAILED',
          detail: modeRet,
          triggerMode: resolvedTriggerMode
        };
      }
    }

    return {
      ok: true,
      initialized,
      decoding,
      triggerMode: applyTriggerMode ? resolvedTriggerMode : null,
      triggerModeApplied: applyTriggerMode && triggerModeWarning === null,
      triggerModeWarning,
      sdkVersion: readSdkVersion()
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[tx-scanner-bridge] start failed:', err);
    return { ok: false, error: 'SDK_ERROR', errorDetail: message };
  }
}

/**
 * 停止解码（tx_scanner_decode_stop），保留 init 状态，可再次 startTxScanner。
 *
 * @returns {Promise<Record<string, unknown>> | Record<string, unknown>}
 */
function stopTxScanner() {
  if (resolveBridgeMode() === 'sidecar') {
    return sidecarHost.stopSidecarTxScanner();
  }

  // Step ①：未 init 或未加载时安全跳过
  if (!ensureLibLoaded() || !initialized) {
    return { ok: true, decoding: false, skipped: true };
  }

  try {
    // Step ②：若正在解码则调用 decode_stop
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
 * 完整释放 SDK：stop → deinit → unregister 回调。
 * 应用退出（before-quit）或页面明确释放时调用。
 *
 * @returns {Promise<Record<string, unknown>> | Record<string, unknown>}
 */
function deinitTxScanner() {
  if (resolveBridgeMode() === 'sidecar') {
    return sidecarHost.deinitSidecarTxScanner();
  }

  // Step ①：先停止解码
  stopTxScanner();

  // Step ②：未 init 时无需 deinit
  if (!ensureLibLoaded() || !initialized) {
    return { ok: true, initialized: false, skipped: true };
  }

  try {
    // Step ③：调用 SDK deinit
    const ret = fns.tx_scanner_deinit();
    initialized = false;
    connected = null;

    // Step ④：释放 koffi 回调槽位
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
  resolveTxScannerDllPath,
  resolveTxScannerLibDir,
  probeTxScannerDll,
  resolveBridgeMode,
  readPeMachineType
};
