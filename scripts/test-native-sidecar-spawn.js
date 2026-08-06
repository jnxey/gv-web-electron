const { spawn } = require('child_process');
const readline = require('readline');
const path = require('path');

const lib = path.join(__dirname, '../resources/app/lib');
const exe = path.join(__dirname, '../resources/app/tx-scanner-native-sidecar/native-sidecar.exe');
const t0 = Date.now();

const p = spawn(exe, [], {
  cwd: lib,
  env: { ...process.env, TX_SCANNER_DLL_DIR: lib },
  stdio: ['pipe', 'pipe', 'pipe']
});

const rl = readline.createInterface({ input: p.stdout });
p.stderr.on('data', (d) => process.stderr.write(`ERR:${d}`));
p.stdout.on('data', (d) => process.stderr.write(`RAW:${d}`));

rl.on('line', (line) => {
  console.log(`${Date.now() - t0}ms`, line);
  try {
    const msg = JSON.parse(line);
    if (msg.type === 'ready') {
      p.stdin.write(`${JSON.stringify({ cmd: 'start', requestId: 'req_1' })}\n`);
    }
    if (msg.type === 'result' && msg.cmd === 'start') {
      p.kill();
      process.exit(msg.ok ? 0 : 2);
    }
  } catch (e) {
    console.log('PARSE_FAIL', e.message);
  }
});

setTimeout(() => {
  console.log('TIMEOUT 35s');
  p.kill();
  process.exit(1);
}, 35000);
