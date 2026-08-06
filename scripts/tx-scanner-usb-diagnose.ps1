# TX 扫码枪 USB 模式诊断（主机侧）
$ErrorActionPreference = 'Continue'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host '=== TX Scanner USB Host Diagnose ==='

$devices = Get-PnpDevice -PresentOnly -ErrorAction SilentlyContinue |
  Where-Object {
    $_.InstanceId -match 'VID_9901|VID_0C2E|SCAN|BARCODE|FDATA' -or
    $_.FriendlyName -match 'scan|barcode|fdata|tx'
  }

if (-not $devices) {
  Write-Host '[!] No scanner-like USB device found.'
  exit 1
}

foreach ($dev in $devices) {
  $inst = $dev.InstanceId
  $svc = (Get-PnpDeviceProperty -InstanceId $inst -KeyName 'DEVPKEY_Device_Service' -ErrorAction SilentlyContinue).Data
  $bus = (Get-PnpDeviceProperty -InstanceId $inst -KeyName 'DEVPKEY_Device_BusReportedDeviceDesc' -ErrorAction SilentlyContinue).Data
  Write-Host "---"
  Write-Host "Status       : $($dev.Status)"
  Write-Host "Class        : $($dev.Class)"
  Write-Host "FriendlyName : $($dev.FriendlyName)"
  Write-Host "InstanceId   : $inst"
  Write-Host "Service      : $svc"
  Write-Host "BusDesc      : $bus"
}

$hid = $devices | Where-Object {
  $_.InstanceId -match 'VID_9901' -and ($_.Class -eq 'HIDClass' -or $_.Class -eq 'Keyboard')
}
if ($hid) {
  Write-Host ''
  Write-Host '[ROOT CAUSE LIKELY] Device is enumerated as HID keyboard (SCAN KEYBOARD).'
  Write-Host 'FData SDK (tx_windows_fdata.dll) requires FData USB mode, not HID keyboard mode.'
  Write-Host 'Switch scanner to FData USB via config barcode / vendor tool, then replug USB.'
  exit 2
}

Write-Host ''
Write-Host 'No HID-keyboard TX scanner node detected. Check sidecar/SDK logs next.'
exit 0
