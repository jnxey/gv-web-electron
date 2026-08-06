/**
 * 主机侧 USB 诊断：判断扫码枪是否以 FData USB 枚举（非 HID 键盘模式）。
 */
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');

const execFileAsync = promisify(execFile);

/**
 * @typedef {{ instanceId: string, className: string, friendlyName: string, service: string, busDesc: string, hardwareIds: string[] }} UsbDeviceRow
 */

/** @type {{ result: Record<string, unknown>, expiresAt: number } | null} */
let usbDiagnoseCache = null;
/** @type {Promise<Record<string, unknown>> | null} */
let usbDiagnoseInflight = null;

const USB_DIAGNOSE_CACHE_MS = 60000;

/**
 * 单次 PowerShell：CIM 按 VID_9901 过滤（避免 Get-PnpDevice 全量枚举）+ 冲突进程。
 *
 * @returns {Promise<string>}
 */
async function runPowerShellJsonAsync(script) {
  const wrapped = `[Console]::OutputEncoding=[System.Text.Encoding]::UTF8; ${script}`;
  const { stdout } = await execFileAsync(
    'powershell.exe',
    ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', wrapped],
    { encoding: 'utf8', timeout: 12000, windowsHide: true, maxBuffer: 4 * 1024 * 1024 }
  );
  return String(stdout ?? '').trim();
}

/**
 * @returns {Promise<UsbDeviceRow[]>}
 */
async function queryScannerRelatedDevicesAsync() {
  const script = `
$rows = Get-CimInstance Win32_PnPEntity -Filter "PNPDeviceID LIKE '%VID_9901%'" -ErrorAction SilentlyContinue |
  ForEach-Object {
    [PSCustomObject]@{
      instanceId = [string]$_.PNPDeviceID
      className = [string]$_.PNPClass
      friendlyName = [string]$_.Name
      status = 'OK'
      service = [string]$_.Service
      busDesc = [string]$_.Name
      hardwareIds = ,@([string]$_.PNPDeviceID)
    }
  }
$rows | ConvertTo-Json -Compress -Depth 4
`;
  try {
    const raw = await runPowerShellJsonAsync(script);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return parsed ? [parsed] : [];
  } catch {
    return [];
  }
}

/**
 * @param {UsbDeviceRow[]} devices
 * @returns {Record<string, unknown>}
 */
function analyzeUsbMode(devices) {
  const txVid9901 = devices.filter((d) => /VID_9901/i.test(d.instanceId || ''));
  const hidKeyboard = txVid9901.filter(
    (d) =>
      d.service === 'HidUsb' ||
      d.className === 'Keyboard' ||
      /SCAN KEYBOARD/i.test(d.busDesc || '') ||
      /Class_03.*SubClass_01.*Prot_01/i.test((d.hardwareIds || []).flat().join('|'))
  );
  const fdataCandidates = txVid9901.filter(
    (d) =>
      d.service &&
      d.service !== 'HidUsb' &&
      d.service !== 'kbdhid' &&
      !/Keyboard|HIDClass|Mouse/i.test(d.className || '')
  );

  let mode = 'unknown';
  let summary = '未检测到 VID_9901 TX 扫码枪 USB 设备';
  let recommendation = '请确认扫码枪已插入 USB，并在设备管理器中查看';

  if (hidKeyboard.length > 0 && fdataCandidates.length === 0) {
    mode = 'hid_keyboard';
    summary = '扫码枪被 Windows 识别为 HID 键盘（BusDesc=SCAN KEYBOARD），不是 FData USB 接口';
    recommendation =
      '请扫描「USB FData 模式」配置码或按厂商说明切换模式；切换后设备管理器应出现非 HidUsb/Keyboard 的 USB 设备，厂商 Demo 应打印 scanner usb fdata state:1';
  } else if (fdataCandidates.length > 0) {
    mode = 'fdata_usb';
    summary = '检测到 VID_9901 的 FData USB 类设备节点';
    recommendation = '若 SDK 仍失败，请关闭厂商 Demo 及所有 native-sidecar.exe 后重试';
  } else if (txVid9901.length === 0) {
    mode = 'not_found';
    summary = '未检测到 VID_9901 扫码枪（可能未插入或驱动异常）';
    recommendation = '请插拔 USB 并确认设备管理器中有对应设备';
  }

  return {
    mode,
    summary,
    recommendation,
    hidKeyboardDevices: hidKeyboard,
    fdataCandidateDevices: fdataCandidates,
    txVid9901Devices: txVid9901,
    allMatchedDevices: devices
  };
}

/**
 * @returns {Promise<Record<string, unknown>>}
 */
async function buildTxScannerUsbHostDiagnoseAsync() {
  const devices = await queryScannerRelatedDevicesAsync();
  const analysis = analyzeUsbMode(devices);
  const conflicts = [];

  try {
    const ps = await runPowerShellJsonAsync(
      `Get-Process native-sidecar -ErrorAction SilentlyContinue | Select-Object Name,Id | ConvertTo-Json -Compress`
    );
    if (ps) {
      const proc = JSON.parse(ps);
      const list = Array.isArray(proc) ? proc : proc ? [proc] : [];
      for (const p of list) conflicts.push(p);
    }
  } catch {
    /* ignore */
  }

  return {
    ok: true,
    ...analysis,
    conflictingProcesses: conflicts,
    checkedAt: new Date().toISOString()
  };
}

/**
 * @param {{ force?: boolean }} [options]
 * @returns {Promise<Record<string, unknown>>}
 */
async function getTxScannerUsbHostDiagnoseAsync(options = {}) {
  const now = Date.now();
  if (!options.force && usbDiagnoseCache && usbDiagnoseCache.expiresAt > now) {
    return usbDiagnoseCache.result;
  }
  if (usbDiagnoseInflight) {
    return usbDiagnoseInflight;
  }

  usbDiagnoseInflight = buildTxScannerUsbHostDiagnoseAsync()
    .then((result) => {
      usbDiagnoseCache = { result, expiresAt: Date.now() + USB_DIAGNOSE_CACHE_MS };
      return result;
    })
    .finally(() => {
      usbDiagnoseInflight = null;
    });

  return usbDiagnoseInflight;
}

/**
 * 同步读取缓存（无缓存时返回 null）。status 快速路径用。
 *
 * @returns {Record<string, unknown> | null}
 */
function getTxScannerUsbHostDiagnoseCachedSync() {
  if (usbDiagnoseCache && usbDiagnoseCache.expiresAt > Date.now()) {
    return usbDiagnoseCache.result;
  }
  return null;
}

/**
 * @deprecated 优先使用 getTxScannerUsbHostDiagnoseAsync；同步版仅作兜底。
 * @returns {Record<string, unknown>}
 */
function getTxScannerUsbHostDiagnose() {
  const cached = getTxScannerUsbHostDiagnoseCachedSync();
  if (cached) return cached;
  return {
    ok: false,
    mode: 'unknown',
    summary: 'USB 诊断尚未完成',
    recommendation: '请稍后刷新状态',
    stale: true
  };
}

module.exports = {
  getTxScannerUsbHostDiagnose,
  getTxScannerUsbHostDiagnoseAsync,
  getTxScannerUsbHostDiagnoseCachedSync,
  queryScannerRelatedDevices: queryScannerRelatedDevicesAsync,
  analyzeUsbMode
};
