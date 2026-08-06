# 安装 TX 扫码 SDK 32 位侧车运行时（node-x86 + koffi ia32）
# 用法：在 gv-web-electron 根目录执行  npm run setup:tx-scanner-sidecar

$ErrorActionPreference = 'Stop'

$Root = Split-Path -Parent $PSScriptRoot
$NodeX86Dir = Join-Path $Root 'resources/app/node-x86'
$SidecarDir = Join-Path $Root 'resources/app/tx-scanner-sidecar'
$NodeExe = Join-Path $NodeX86Dir 'node.exe'
$NodeVersion = '20.18.0'
$NodeZipName = "node-v$NodeVersion-win-x86.zip"
$NodeUrl = "https://nodejs.org/dist/v$NodeVersion/$NodeZipName"
$TempZip = Join-Path $env:TEMP $NodeZipName

Write-Host "[setup-tx-scanner-sidecar] root=$Root"

if (-not (Test-Path $NodeExe)) {
  Write-Host "[setup-tx-scanner-sidecar] downloading $NodeUrl"
  Invoke-WebRequest -Uri $NodeUrl -OutFile $TempZip
  $ExtractDir = Join-Path $env:TEMP "node-v$NodeVersion-win-x86"
  if (Test-Path $ExtractDir) {
    Remove-Item -Recurse -Force $ExtractDir
  }
  Expand-Archive -Path $TempZip -DestinationPath $env:TEMP -Force
  New-Item -ItemType Directory -Force -Path $NodeX86Dir | Out-Null
  Copy-Item -Path (Join-Path $ExtractDir '*') -Destination $NodeX86Dir -Recurse -Force
  Remove-Item -Force $TempZip -ErrorAction SilentlyContinue
  Write-Host "[setup-tx-scanner-sidecar] node-x86 installed -> $NodeX86Dir"
} else {
  Write-Host "[setup-tx-scanner-sidecar] node-x86 already exists"
}

if (-not (Test-Path $NodeExe)) {
  throw "node.exe not found at $NodeExe"
}

$arch = & $NodeExe -p "process.arch"
if ($arch -ne 'ia32') {
  throw "Expected ia32 node.exe, got $arch"
}

Write-Host "[setup-tx-scanner-sidecar] installing koffi (ia32) in $SidecarDir"
$env:npm_config_arch = 'ia32'
$env:npm_config_target_arch = 'ia32'
$NpmCmd = Join-Path $NodeX86Dir 'npm.cmd'
& $NpmCmd install --prefix $SidecarDir --omit=dev
Remove-Item Env:npm_config_arch -ErrorAction SilentlyContinue
Remove-Item Env:npm_config_target_arch -ErrorAction SilentlyContinue

$KoffiAddon = Join-Path $SidecarDir 'node_modules/koffi/build/koffi/win32_ia32/koffi.node'
if (-not (Test-Path $KoffiAddon)) {
  throw "koffi ia32 native addon not found: $KoffiAddon"
}

Write-Host "[setup-tx-scanner-sidecar] done. Restart Electron and test on consumption counter settings page."
