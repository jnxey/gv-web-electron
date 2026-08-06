/**
 * TX 扫码侧车日志：写入 resources/app/lib/tx-scanner-sidecar.log
 */
const fs = require('node:fs');
const path = require('node:path');

/**
 * @param {() => string} resolveLibDir
 * @returns {string}
 */
function resolveTxScannerSidecarLogPath(resolveLibDir) {
  return path.join(resolveLibDir(), 'tx-scanner-sidecar.log');
}

/**
 * @param {string} logPath
 * @param {string} scope
 * @param {string} message
 * @param {Record<string, unknown>} [extra]
 */
function appendTxScannerSidecarLog(logPath, scope, message, extra) {
  const ts = new Date().toISOString();
  const suffix =
    extra && Object.keys(extra).length > 0 ? ` ${JSON.stringify(extra)}` : '';
  const line = `[${ts}] [${scope}] ${message}${suffix}\n`;
  try {
    fs.appendFileSync(logPath, line, 'utf8');
  } catch (err) {
    console.error('[tx-scanner-sidecar-log] append failed:', err);
  }
}

/**
 * @param {string} logPath
 * @param {number} [maxLines]
 * @returns {string[]}
 */
function readTxScannerSidecarLogTail(logPath, maxLines = 80) {
  try {
    if (!fs.existsSync(logPath)) return [];
    const content = fs.readFileSync(logPath, 'utf8');
    const lines = content.split(/\r?\n/).filter((line) => line.trim() !== '');
    return lines.slice(-maxLines);
  } catch {
    return [];
  }
}

module.exports = {
  resolveTxScannerSidecarLogPath,
  appendTxScannerSidecarLog,
  readTxScannerSidecarLogTail
};
