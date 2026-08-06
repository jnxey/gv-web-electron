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

/** --- koffi / DLL 加载状态 --- */

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
 * 探测 DLL 文件是否存在及 Electron 进程架构。
 *
 * @returns {{ dllPath: string, libDir: string, dllExists: boolean, processArch: string }}
 */
function probeTxScannerDll() {
  const dllPath = resolveTxScannerDllPath();
  return {
    dllPath,
    libDir: resolveTxScannerLibDir(),
    dllExists: fs.existsSync(dllPath),
    processArch: process.arch
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
  // Step ①：已加载则短路
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
 * 查询桥接层与设备当前状态快照，供 IPC tx-scanner-get-status 使用。
 *
 * @returns {Record<string, unknown>} 含 sdkLoaded / initialized / decoding / connected / sdkVersion 等
 */
function getTxScannerStatus() {
  const probe = probeTxScannerDll();

  // Step ①：DLL 未加载时返回错误分支
  if (!ensureLibLoaded()) {
    return {
      ok: false,
      sdkLoaded: false,
      initialized,
      decoding,
      connected,
      error: loadErrorCode ?? 'SDK_NOT_LOADED',
      errorDetail: loadError ?? 'tx_windows_fdata.dll not available',
      ...probe
    };
  }

  // Step ②：组装完整状态快照
  return {
    ok: true,
    sdkLoaded: true,
    initialized,
    decoding,
    connected: connected === null ? null : connected === 1,
    sdkVersion: readSdkVersion(),
    triggerMode: initialized ? fns.tx_scanner_get_trigger_mode() : null,
    ...probe
  };
}

/**
 * 初始化扫码 SDK 并启动解码。
 * 幂等：重复调用不会重复 init/register，仅确保处于 decoding 状态。
 *
 * @param {{ triggerMode?: number, saveTriggerMode?: boolean }} [options]
 *   triggerMode: 0~3，默认 TRIGGER_MODE_AUTOSENS(3)
 *   saveTriggerMode: true 时永久写入设备
 * @returns {Record<string, unknown>}
 */
function startTxScanner(options = {}) {
  // Step ①：确保 DLL 已加载
  if (!ensureLibLoaded()) return sdkNotLoadedResult();

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

    // Step ④：设置触发模式（如自动感应）
    const modeRet = fns.tx_scanner_set_trigger_mode(resolvedTriggerMode, saveTriggerMode);
    if (modeRet < SUCC) {
      return { ok: false, error: 'SET_TRIGGER_MODE_FAILED', detail: modeRet, triggerMode: resolvedTriggerMode };
    }

    // Step ⑤：启动解码（若尚未 decoding）
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
 * 停止解码（tx_scanner_decode_stop），保留 init 状态，可再次 startTxScanner。
 *
 * @returns {Record<string, unknown>}
 */
function stopTxScanner() {
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
 * @returns {Record<string, unknown>}
 */
function deinitTxScanner() {
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
  probeTxScannerDll
};
