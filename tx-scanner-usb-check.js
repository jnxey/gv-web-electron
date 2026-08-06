/**
 * 主机侧 USB 诊断：判断扫码枪是否以 FData USB 枚举（非 HID 键盘模式）。
 */
const { execFileSync } = require('node:child_process');

/**
 * @typedef {{ instanceId: string, className: string, friendlyName: string, service: string, busDesc: string, hardwareIds: string[] }} UsbDeviceRow
 */

/**
 * @param {string} script
 * @returns {string}
 */
function runPowerShellJson(script) {
  const wrapped = `[Console]::OutputEncoding=[System.Text.Encoding]::UTF8; ${script}`;
  const out = execFileSync(
    'powershell.exe',
    ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', wrapped],
    { encoding: 'utf8', timeout: 15000, windowsHide: true }
  );
  return out.trim();
}

/**
 * 查询可能与 TX 扫码枪相关的 PnP 设备。
 *
 * @returns {UsbDeviceRow[]}
 */
function queryScannerRelatedDevices() {
  const script = `
$rows = Get-PnpDevice -PresentOnly -ErrorAction SilentlyContinue |
  Where-Object {
    $_.InstanceId -match 'VID_9901|VID_0C2E|VID_0525|VID_1EAB|VID_05F9|SCAN|BARCODE|FDATA' -or
    $_.FriendlyName -match 'scan|barcode|fdata|tx'
  } |
  ForEach-Object {
    $inst = $_.InstanceId
    $svc = ''
    $bus = ''
    try { $svc = (Get-PnpDeviceProperty -InstanceId $inst -KeyName 'DEVPKEY_Device_Service' -ErrorAction SilentlyContinue).Data } catch {}
    try { $bus = (Get-PnpDeviceProperty -InstanceId $inst -KeyName 'DEVPKEY_Device_BusReportedDeviceDesc' -ErrorAction SilentlyContinue).Data } catch {}
    $hw = @()
    try { $hw = @((Get-PnpDeviceProperty -InstanceId $inst -KeyName 'DEVPKEY_Device_HardwareIds' -ErrorAction SilentlyContinue).Data) } catch {}
    [PSCustomObject]@{
      instanceId = $inst
      className = $_.Class
      friendlyName = $_.FriendlyName
      status = $_.Status
      service = [string]$svc
      busDesc = [string]$bus
      hardwareIds = ,@($hw | ForEach-Object { [string]$_ })
    }
  }
$rows | ConvertTo-Json -Compress -Depth 4
`;
  try {
    const raw = runPowerShellJson(script);
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

/** @type {{ result: Record<string, unknown>, expiresAt: number } | null} */
let usbDiagnoseCache = null;
const USB_DIAGNOSE_CACHE_MS = 3000;

/**
 * @returns {Record<string, unknown>}
 */
function getTxScannerUsbHostDiagnose() {
  const now = Date.now();
  if (usbDiagnoseCache && usbDiagnoseCache.expiresAt > now) {
    return usbDiagnoseCache.result;
  }
  const result = buildTxScannerUsbHostDiagnose();
  usbDiagnoseCache = { result, expiresAt: now + USB_DIAGNOSE_CACHE_MS };
  return result;
}

/**
 * @returns {Record<string, unknown>}
 */
function buildTxScannerUsbHostDiagnose() {
  const devices = queryScannerRelatedDevices();
  const analysis = analyzeUsbMode(devices);
  const conflicts = [];
  try {
    const ps = runPowerShellJson(
      `Get-Process native-sidecar,tx_windows_fdata -ErrorAction SilentlyContinue | Select-Object Name,Id | ConvertTo-Json -Compress`
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

module.exports = {
  getTxScannerUsbHostDiagnose,
  queryScannerRelatedDevices,
  analyzeUsbMode
};
