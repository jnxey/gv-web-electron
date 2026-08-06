/**
 * TX 扫码侧车日志（默认关闭，避免生产环境持续写 lib/tx-scanner-sidecar.log）。
 * 排查时在启动 Electron 前设置：TX_SCANNER_DEBUG_LOG=1
 */
const fs = require('node:fs');
const path = require('node:path');

/**
 * @returns {boolean}
 */
function isTxScannerDebugLogEnabled() {
  return process.env.TX_SCANNER_DEBUG_LOG === '1' || process.env.TX_SCANNER_DEBUG_LOG === 'true';
}

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
  if (!isTxScannerDebugLogEnabled()) return;

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
  if (!isTxScannerDebugLogEnabled()) return [];

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
  isTxScannerDebugLogEnabled,
  resolveTxScannerSidecarLogPath,
  appendTxScannerSidecarLog,
  readTxScannerSidecarLogTail
};
