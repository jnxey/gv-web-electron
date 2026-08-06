# 编译 native-sidecar.exe（Win32）
$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
$OutDir = Join-Path $Root 'resources/app/tx-scanner-native-sidecar'
$Src = Join-Path $OutDir 'native-sidecar.cpp'
$Exe = Join-Path $OutDir 'native-sidecar.exe'

Write-Host "[build-native-sidecar] out=$Exe"

$vswhere = Join-Path ${env:ProgramFiles(x86)} 'Microsoft Visual Studio\Installer\vswhere.exe'
if (-not (Test-Path $vswhere)) {
  throw 'Visual Studio vswhere not found. Install VS Build Tools or run cl manually (see README.md).'
}

$vcvars = & $vswhere -latest -property installationPath
if (-not $vcvars) { throw 'Visual Studio installation not found.' }

$vcvarsBat = Join-Path $vcvars 'VC\Auxiliary\Build\vcvars32.bat'
if (-not (Test-Path $vcvarsBat)) { throw "vcvars32.bat not found: $vcvarsBat" }

$buildCmd = "cd /d `"$OutDir`" && cl /nologo /EHsc /O2 /MT `"$Src`" /Fe:`"native-sidecar.new.exe`""
cmd /c "`"$vcvarsBat`" && $buildCmd"
$newExe = Join-Path $OutDir 'native-sidecar.new.exe'
if (-not (Test-Path $newExe)) { throw 'Build failed: native-sidecar.new.exe not created.' }

Get-Process native-sidecar -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Milliseconds 300

if (Test-Path $Exe) {
  Remove-Item -Path $Exe -Force
}
Move-Item -Path $newExe -Destination $Exe -Force

$obj = Join-Path $OutDir 'native-sidecar.obj'
if (Test-Path $obj) { Remove-Item $obj -Force }

Write-Host "[build-native-sidecar] done -> $Exe"
Write-Host "Restart Electron and test TX scanner on consumption counter settings page."
