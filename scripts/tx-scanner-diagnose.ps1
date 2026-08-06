# TX FData SDK 诊断：32 位 Node 侧车 init 后探测设备
$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
$NodeExe = Join-Path $Root 'resources/app/node-x86/node.exe'
$SidecarDir = Join-Path $Root 'resources/app/tx-scanner-sidecar'
$LibDir = Join-Path $Root 'resources/app/lib'

if (-not (Test-Path $NodeExe)) {
  Write-Host 'ERROR: node-x86 not found. Run: npm run setup:tx-scanner-sidecar'
  exit 1
}

$diagJs = @'
const path = require('node:path');
const koffi = require('koffi');
const dllPath = path.join(process.env.TX_SCANNER_DLL_DIR, 'tx_windows_fdata.dll');
const SUCC = 0;
let connected = null;

function log(obj) {
  console.log(JSON.stringify({ type: 'diag', ...obj }));
}

try {
  const lib = koffi.load(dllPath);
  const DecodeDataCb = koffi.proto('int __cdecl tx_scanner_decode_data_cb(uint8 codeType, uint8 *pBuf, uint32 uiBufLen)');
  const CommStateCb = koffi.proto('void __cdecl tx_scanner_comm_state_cb(uint8 ucState)');

  const fns = {
    init: lib.func('tx_scanner_init', 'int', []),
    deinit: lib.func('tx_scanner_deinit', 'int', []),
    get_version: lib.func('tx_scanner_get_version', 'int', ['uint8 *', 'uint8']),
    reg_decode: lib.func('tx_scanner_decode_data_fun_register', 'int', [koffi.pointer(DecodeDataCb)]),
    reg_comm: lib.func('tx_scanner_comm_state_fun_register', 'int', [koffi.pointer(CommStateCb)]),
    get_version_info: lib.func('tx_scanner_get_version_info', 'int', ['uint8 *', 'uint16']),
    get_product_info: lib.func('tx_scanner_get_all_product_info', 'int', ['uint8 *', 'uint16']),
    decode_start: lib.func('tx_scanner_decode_start', 'int', []),
    decode_stop: lib.func('tx_scanner_decode_stop', 'int', [])
  };

  const decodeCb = koffi.register((codeType, buf, len) => SUCC, koffi.pointer(DecodeDataCb));
  const commCb = koffi.register((state) => {
    connected = Number(state);
    log({ event: 'comm', connected: connected === 1 });
  }, koffi.pointer(CommStateCb));

  log({ step: 'load', ok: true, dllPath, arch: process.arch });

  let ret = fns.reg_decode(decodeCb);
  log({ step: 'reg_decode', ret });
  ret = fns.reg_comm(commCb);
  log({ step: 'reg_comm', ret });
  ret = fns.init();
  log({ step: 'init', ret });

  const verBuf = Buffer.alloc(64);
  const verLen = fns.get_version(verBuf, verBuf.length);
  log({ step: 'get_version', ret: verLen, version: verBuf.toString('utf8', 0, Math.max(0, verLen)).replace(/\0.*$/, '') });

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  await wait(3000);

  const infoBuf = Buffer.alloc(128);
  const infoRet = fns.get_version_info(infoBuf, infoBuf.length);
  log({
    step: 'get_version_info',
    ret: infoRet,
    info: infoRet >= 0 ? infoBuf.toString('utf8', 0, infoRet).replace(/\0.*$/, '') : ''
  });

  const prodBuf = Buffer.alloc(256);
  const prodRet = fns.get_product_info(prodBuf, prodBuf.length);
  log({
    step: 'get_product_info',
    ret: prodRet,
    info: prodRet >= 0 ? prodBuf.toString('utf8', 0, prodRet).replace(/\0.*$/, '') : ''
  });

  log({ step: 'comm_state_after_wait', connected });

  const startRet = fns.decode_start();
  log({ step: 'decode_start', ret: startRet });
  if (startRet >= SUCC) fns.decode_stop();

  fns.deinit();
  koffi.unregister(decodeCb);
  koffi.unregister(commCb);
  log({ step: 'done', ok: true });
} catch (err) {
  log({ step: 'error', message: err instanceof Error ? err.message : String(err) });
  process.exit(1);
}
'@

$diagPath = Join-Path $env:TEMP 'tx-scanner-diag.mjs'
Set-Content -Path $diagPath -Value $diagJs -Encoding UTF8
$env:TX_SCANNER_DLL_DIR = $LibDir
Push-Location $SidecarDir
& $NodeExe $diagPath
Pop-Location
