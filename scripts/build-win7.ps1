# 打 Windows 7 安装包（Electron 22.3.27，侧车 Node 16.20.2 ia32）。
# 在独立目录 .win7-stage 里安装依赖，不改当前 Win10 包用的 node_modules 和 resources/app/node-x86。
# 用法：在 gv-web-electron 根目录执行  npm run build:win7

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$Root = Split-Path -Parent $PSScriptRoot
$Stage = Join-Path $Root '.win7-stage'
$OutputDir = Join-Path $Root 'dist-win7'
$ElectronVersion = '22.3.27'
$NodeVersion = '16.20.2'
$SerialportVersion = '12.0.0'
$KoffiVersion = '2.16.3'
$WsVersion = '8.21.0'

function Assert-ExitCode {
  param([string]$Step)
  if ($LASTEXITCODE -ne 0) {
    throw "$Step failed with exit code $LASTEXITCODE"
  }
}

Write-Host "[build-win7] root=$Root"
Write-Host "[build-win7] electron=$ElectronVersion node-x86=$NodeVersion serialport=$SerialportVersion"

$Builder = Join-Path $Root 'node_modules\electron-builder\cli.js'
if (-not (Test-Path $Builder)) {
  throw "electron-builder not found. Run npm install in gv-web-electron first."
}

# 侧车 package.json 有 file:../../.. 依赖。npm 会把它做成指向工程根目录的联接，
# 7za 跟随这个联接会把目录自己打进安装包并一直变大。删除联接时不能用 Remove-Item -Recurse。
$DangerLink = Join-Path $Stage 'resources\app\tx-scanner-sidecar\node_modules\game-xch'
if (Test-Path $DangerLink) {
  & cmd /c rmdir "$DangerLink"
}

if (Test-Path $OutputDir) {
  Remove-Item -Recurse -Force $OutputDir
}
if (Test-Path $Stage) {
  Remove-Item -Recurse -Force $Stage
}
New-Item -ItemType Directory -Force -Path $Stage | Out-Null

Write-Host "[build-win7] copy project -> $Stage"
& robocopy $Root $Stage /E /NFL /NDL /NJH /NP /XD node_modules dist dist-win7 .win7-stage .git .idea out | Out-Null
$RobocopyCode = $LASTEXITCODE
if ($RobocopyCode -ge 8) {
  throw "robocopy failed: $RobocopyCode"
}

$LockFile = Join-Path $Stage 'package-lock.json'
if (Test-Path $LockFile) {
  Remove-Item -Force $LockFile
}

$PatchJs = Join-Path $env:TEMP 'gv-web-electron-patch-win7-package.js'
@'
const fs = require('fs');
const path = require('path');

const pkgPath = process.argv[2];
const outputDir = process.argv[3];
const electronVersion = process.argv[4];
const serialportVersion = process.argv[5];
const koffiVersion = process.argv[6];
const wsVersion = process.argv[7];
const root = path.dirname(pkgPath);
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

pkg.devDependencies = pkg.devDependencies || {};
pkg.devDependencies.electron = electronVersion;
delete pkg.devDependencies['electron-builder'];
delete pkg.devDependencies.prettier;
delete pkg.devDependencies.axios;
delete pkg.devDependencies['@electron/fuses'];
delete pkg.devDependencies.serialport;
delete pkg.devDependencies.koffi;
delete pkg.devDependencies.ws;

pkg.dependencies = {
  serialport: serialportVersion,
  koffi: koffiVersion,
  ws: wsVersion
};

pkg.scripts = pkg.scripts || {};
delete pkg.scripts.build;
delete pkg.scripts['build:win7'];

pkg.build = pkg.build || {};
pkg.build.electronVersion = electronVersion;
pkg.build.npmRebuild = true;
pkg.build.directories = pkg.build.directories || {};
pkg.build.directories.output = outputDir;
pkg.build.win = pkg.build.win || {};
pkg.build.win.artifactName = 'game-xch-win7-setup-${version}.${ext}';

pkg.build.extraResources = (pkg.build.extraResources || []).filter((item) => {
  const from = typeof item === 'string' ? item : item.from;
  if (from.indexOf('node_modules/') === 0 || from.indexOf('node_modules\\') === 0) {
    return true;
  }
  const exists = fs.existsSync(path.join(root, from));
  if (!exists) {
    console.log('[build-win7] skip missing extraResource ' + from);
  }
  return exists;
});

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
'@ | Set-Content -Path $PatchJs -Encoding UTF8

& node $PatchJs $Stage\package.json $OutputDir $ElectronVersion $SerialportVersion $KoffiVersion $WsVersion
Assert-ExitCode 'patch package.json'
Remove-Item -Force $PatchJs

Write-Host "[build-win7] install Node $NodeVersion win-x86 for scanner sidecar"
$NodeX86Dir = Join-Path $Stage 'resources\app\node-x86'
if (Test-Path $NodeX86Dir) {
  Remove-Item -Recurse -Force $NodeX86Dir
}
$NodeZipName = "node-v$NodeVersion-win-x86.zip"
$NodeUrl = "https://nodejs.org/dist/v$NodeVersion/$NodeZipName"
$TempZip = Join-Path $env:TEMP $NodeZipName
$ExtractParent = Join-Path $env:TEMP "gv-web-electron-node-$NodeVersion"
Invoke-WebRequest -Uri $NodeUrl -OutFile $TempZip
if (Test-Path $ExtractParent) {
  Remove-Item -Recurse -Force $ExtractParent
}
New-Item -ItemType Directory -Force -Path $ExtractParent | Out-Null
Expand-Archive -Path $TempZip -DestinationPath $ExtractParent -Force
$Extracted = Join-Path $ExtractParent "node-v$NodeVersion-win-x86"
if (-not (Test-Path (Join-Path $Extracted 'node.exe'))) {
  throw "node.exe not found after extracting $NodeUrl"
}
New-Item -ItemType Directory -Force -Path $NodeX86Dir | Out-Null
Copy-Item -Path (Join-Path $Extracted '*') -Destination $NodeX86Dir -Recurse -Force
Remove-Item -Force $TempZip -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force $ExtractParent -ErrorAction SilentlyContinue

$NodeExe = Join-Path $NodeX86Dir 'node.exe'
$Arch = & $NodeExe -p "process.version + ' ' + process.arch"
Assert-ExitCode 'node-x86 version'
Write-Host "[build-win7] node-x86 $Arch"
if ($Arch -ne "v$NodeVersion ia32") {
  throw "Expected v$NodeVersion ia32, got $Arch"
}

$SidecarDir = Join-Path $Stage 'resources\app\tx-scanner-sidecar'
$SidecarModules = Join-Path $SidecarDir 'node_modules'
if (Test-Path $SidecarModules) {
  Remove-Item -Recurse -Force $SidecarModules
}
$KoffiIsolate = Join-Path $env:TEMP 'gv-web-electron-koffi-ia32'
if (Test-Path $KoffiIsolate) {
  Remove-Item -Recurse -Force $KoffiIsolate
}
New-Item -ItemType Directory -Force -Path $KoffiIsolate | Out-Null
Set-Content -Path (Join-Path $KoffiIsolate 'package.json') -Value '{"private":true}' -Encoding ASCII
$NpmCmd = Join-Path $NodeX86Dir 'npm.cmd'
$env:npm_config_arch = 'ia32'
$env:npm_config_target_arch = 'ia32'
Write-Host "[build-win7] install koffi $KoffiVersion ia32"
Push-Location $KoffiIsolate
& $NpmCmd install "koffi@$KoffiVersion" --omit=dev
Assert-ExitCode 'koffi ia32 install'
Pop-Location
Remove-Item Env:npm_config_arch -ErrorAction SilentlyContinue
Remove-Item Env:npm_config_target_arch -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force -Path $SidecarModules | Out-Null
Copy-Item -Path (Join-Path $KoffiIsolate 'node_modules\koffi') -Destination (Join-Path $SidecarModules 'koffi') -Recurse -Force
Remove-Item -Recurse -Force $KoffiIsolate

$KoffiAddon = Join-Path $SidecarDir 'node_modules\koffi\build\koffi\win32_ia32\koffi.node'
if (-not (Test-Path $KoffiAddon)) {
  throw "koffi ia32 native addon not found: $KoffiAddon"
}

Write-Host "[build-win7] npm install in stage"
Push-Location $Stage
& npm install --no-fund --no-audit
Assert-ExitCode 'npm install'
Pop-Location

Write-Host "[build-win7] electron-builder -> $OutputDir"
$env:CSC_IDENTITY_AUTO_DISCOVERY = 'false'
& node $Builder --projectDir $Stage --win --x64
Assert-ExitCode 'electron-builder'

$Setup = Get-ChildItem -Path $OutputDir -Filter 'game-xch-win7-setup-*.exe' | Select-Object -First 1
if (-not $Setup) {
  throw "Win7 setup exe not found in $OutputDir"
}
Write-Host "[build-win7] done -> $($Setup.FullName)"
