/**
 * KP-80A 等 ESC/POS 热敏打印机缺纸检测：经虚拟 COM 发送 DLE EOT 状态查询。
 * @see POS80 / ESC/POS：DLE EOT 2 = 脱机原因（bit5 纸尽停止）；DLE EOT 4 = 纸卷传感器（bit5-6 纸尽，bit2-3 纸将尽）
 */
const { SerialPort } = require('serialport');

/** ESC/POS：DLE EOT 2 — 脱机原因状态 */
const ESCPOS_CMD_DLE_EOT_OFFLINE = Buffer.from([0x10, 0x04, 2]);

/** ESC/POS：DLE EOT 4 — 纸卷传感器状态 */
const ESCPOS_CMD_DLE_EOT_PAPER_SENSOR = Buffer.from([0x10, 0x04, 4]);

/** 脱机状态 bit5：纸尽停止打印 */
const ESCPOS_OFFLINE_STATUS_PAPER_OUT_STOP = 0x20;

/** 纸卷传感器 bit5-6：纸尽 */
const ESCPOS_PAPER_SENSOR_END_MASK = 0x60;

/** 纸卷传感器 bit2-3：纸将尽 */
const ESCPOS_PAPER_SENSOR_NEAR_END_MASK = 0x0c;

/** 默认波特率（POS80 手册常见值；以设备自测页为准） */
const THERMAL_PRINTER_DEFAULT_BAUD_RATE = 19200;

/** 串口读写超时（毫秒） */
const THERMAL_PRINTER_SERIAL_TIMEOUT_MS = 400;

/** 同一 COM 口查询互斥链 */
let serialQueryMutex = Promise.resolve();

/**
 * @param {import('serialport').SerialPort} port
 * @param {number} timeoutMs
 * @returns {Promise<number>}
 */
function readOneStatusByte(port, timeoutMs) {
  return new Promise((resolve, reject) => {
    /** @type {NodeJS.Timeout | undefined} */
    let timer;

    const cleanup = () => {
      if (timer) clearTimeout(timer);
      port.removeListener('data', onData);
      port.removeListener('error', onError);
    };

    const onData = (chunk) => {
      if (!chunk || chunk.length === 0) return;
      cleanup();
      resolve(chunk[0]);
    };

    const onError = (err) => {
      cleanup();
      reject(err);
    };

    timer = setTimeout(() => {
      cleanup();
      reject(new Error('TIMEOUT'));
    }, timeoutMs);

    port.once('data', onData);
    port.once('error', onError);
  });
}

/**
 * @param {import('serialport').SerialPort} port
 * @param {Buffer} command
 * @returns {Promise<number|null>}
 */
async function queryEscPosStatusByte(port, command) {
  await new Promise((resolve, reject) => {
    port.write(command, (writeError) => {
      if (writeError) reject(writeError);
      else resolve(undefined);
    });
  });

  try {
    return await readOneStatusByte(port, THERMAL_PRINTER_SERIAL_TIMEOUT_MS);
  } catch (err) {
    if (err instanceof Error && err.message === 'TIMEOUT') {
      return null;
    }
    throw err;
  }
}

/**
 * @param {number|null|undefined} offlineStatus
 * @param {number|null|undefined} sensorStatus
 * @returns {{ paperOut: boolean, paperNearEnd: boolean, raw: { offline: number|null, sensor: number|null } }}
 */
function parseThermalPrinterPaperStatus(offlineStatus, sensorStatus) {
  const offline = typeof offlineStatus === 'number' ? offlineStatus : null;
  const sensor = typeof sensorStatus === 'number' ? sensorStatus : null;

  const paperOutByOffline = offline !== null && (offline & ESCPOS_OFFLINE_STATUS_PAPER_OUT_STOP) !== 0;
  const paperOutBySensor = sensor !== null && (sensor & ESCPOS_PAPER_SENSOR_END_MASK) !== 0;
  const paperNearEnd = sensor !== null && (sensor & ESCPOS_PAPER_SENSOR_NEAR_END_MASK) !== 0;

  return {
    paperOut: paperOutByOffline || paperOutBySensor,
    paperNearEnd,
    raw: { offline, sensor }
  };
}

/**
 * @param {{ path: string, baudRate: number }} options
 * @returns {Promise<{ ok: true, paperOut: boolean, paperNearEnd: boolean, raw: { offline: number|null, sensor: number|null } } | { ok: false, error: string }>}
 */
async function queryThermalPrinterPaperStatusOnPort(options) {
  const path = String(options?.path ?? '').trim();
  const baudRate = Number(options?.baudRate) || THERMAL_PRINTER_DEFAULT_BAUD_RATE;

  if (path === '') {
    return { ok: false, error: 'NOT_CONFIGURED' };
  }

  /** @type {import('serialport').SerialPort | null} */
  let port = null;

  try {
    port = new SerialPort({
      path,
      baudRate,
      autoOpen: false,
      dataBits: 8,
      stopBits: 1,
      parity: 'none'
    });

    await new Promise((resolve, reject) => {
      port.open((openError) => {
        if (openError) reject(openError);
        else resolve(undefined);
      });
    });

    const offlineStatus = await queryEscPosStatusByte(port, ESCPOS_CMD_DLE_EOT_OFFLINE);
    if (offlineStatus === null) {
      return { ok: false, error: 'TIMEOUT' };
    }

    let sensorStatus = null;
    try {
      sensorStatus = await queryEscPosStatusByte(port, ESCPOS_CMD_DLE_EOT_PAPER_SENSOR);
    } catch (sensorError) {
      console.warn('[thermal-printer-paper] paper sensor query failed:', sensorError);
    }

    const parsed = parseThermalPrinterPaperStatus(offlineStatus, sensorStatus);
    return { ok: true, ...parsed };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (/busy|access|in use|being used|cannot open/i.test(message)) {
      return { ok: false, error: 'PORT_BUSY' };
    }
    if (message === 'TIMEOUT') {
      return { ok: false, error: 'TIMEOUT' };
    }
    console.error('[thermal-printer-paper] query failed:', err);
    return { ok: false, error: 'SERIAL_ERROR', errorDetail: message };
  } finally {
    if (port && port.isOpen) {
      await new Promise((resolve) => {
        port.close(() => resolve(undefined));
      });
    }
  }
}

/**
 * 查询热敏打印机缺纸状态（短连接 COM + 进程内互斥）。
 * @param {{ port?: string, baudRate?: number }} [options]
 * @returns {Promise<{ ok: true, paperOut: boolean, paperNearEnd: boolean, raw: { offline: number|null, sensor: number|null } } | { ok: false, error: string }>}
 */
function queryThermalPrinterPaperStatus(options) {
  const run = () => queryThermalPrinterPaperStatusOnPort(options ?? {});
  const task = serialQueryMutex.then(run, run);
  serialQueryMutex = task.catch(() => undefined);
  return task;
}

module.exports = {
  THERMAL_PRINTER_DEFAULT_BAUD_RATE,
  queryThermalPrinterPaperStatus,
  parseThermalPrinterPaperStatus
};
