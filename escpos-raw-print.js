/**
 * 80mm 小票 RAW 打印（Windows）。
 * 把 HTML 画成位图，编码成 ESC/POS 光栅，以 RAW 作业写入已安装的 Windows 打印机。
 * 不走 Chromium webContents.print，避免小票机无法识别 EMF 后打出 Windows 测试页。
 */
const fs = require('fs');
const os = require('os');
const path = require('path');

/** 80mm 热敏纸可打印宽度（203dpi，须为 8 的倍数） */
const RECEIPT_RASTER_WIDTH_DOTS = 576;
/** GS v 0 高度字段上限 */
const RECEIPT_RASTER_HEIGHT_MAX = 65535;
/** 截图前用 CSS zoom 放大，缩回 576 点时笔画更清楚 */
const RECEIPT_CAPTURE_ZOOM = '2';
/** 首屏窗口宽度，需盖住放大后的 80mm 版面 */
const RECEIPT_CAPTURE_WINDOW_WIDTH = 720;
/** 首屏窗口高度，完整高度在量完内容后再拉开 */
const RECEIPT_CAPTURE_WINDOW_HEIGHT = 480;
/** 内容区额外留白，避免滚动条挤进截图 */
const RECEIPT_CAPTURE_PADDING_PX = 32;
/** 亮度低于该值的像素打成黑点，#333 正文不会被洗掉 */
const RECEIPT_MONOCHROME_LUMINANCE_MAX = 200;
/** 亮度比较用的定点放大倍数（0.299 / 0.587 / 0.114） */
const RECEIPT_LUMA_RED_WEIGHT = 299;
const RECEIPT_LUMA_GREEN_WEIGHT = 587;
const RECEIPT_LUMA_BLUE_WEIGHT = 114;
const RECEIPT_LUMA_SCALE = 1000;
/** 光栅结束后走纸行数，给切刀留出空白 */
const ESC_POS_FEED_LINE_COUNT = 4;
/** RAW 作业文档名 */
const RAW_DOCUMENT_NAME = 'gv-receipt';
/** Windows 假脱机数据类型：原样字节，不经 EMF */
const RAW_DATATYPE = 'RAW';
/** 截图临时 HTML 前缀 */
const RECEIPT_CAPTURE_HTML_PREFIX = 'gv-print-escpos-';
/** 默认打印份数 */
const RECEIPT_PRINT_DEFAULT_COPIES = 1;

/** 量小票元素在页面上的位置（CSS 像素） */
const MEASURE_RECEIPT_BOUNDS_SCRIPT =
  '(function () {' +
  'var target = document.querySelector(".finance-ledger-receipt") || document.body;' +
  'var rect = target.getBoundingClientRect();' +
  'var width = Math.max(target.scrollWidth, rect.width);' +
  'var height = Math.max(target.scrollHeight, rect.height);' +
  'return { x: rect.left, y: rect.top, width: width, height: height };' +
  '})()';

/** 把页面放大，供后续缩到 576 点 */
const APPLY_RECEIPT_ZOOM_SCRIPT =
  '(function () { document.documentElement.style.zoom = "' + RECEIPT_CAPTURE_ZOOM + '"; return true; })()';

/** 等两帧，让缩放和改窗口尺寸后的排版落地 */
const WAIT_RECEIPT_LAYOUT_SCRIPT =
  'new Promise(function (resolve) { requestAnimationFrame(function () { requestAnimationFrame(function () { resolve(true); }); }); })';

/** @type {number} 临时文件序号，避免同一毫秒里两张小票写到同一个路径 */
let receiptCaptureSerial = 0;

/** @type {object | null} winspool / kernel32 绑定，进程内只加载一次 */
let winspoolApi = null;

/**
 * 创建白底隐藏窗口，用来把小票 HTML 画成位图。
 * @returns {import('electron').BrowserWindow}
 */
function createReceiptCaptureWindow() {
  const electron = require('electron');
  return new electron.BrowserWindow({
    show: false,
    skipTaskbar: true,
    paintWhenInitiallyHidden: true,
    backgroundColor: '#ffffff',
    width: RECEIPT_CAPTURE_WINDOW_WIDTH,
    height: RECEIPT_CAPTURE_WINDOW_HEIGHT
  });
}

/**
 * 删除截图用的临时 HTML。
 * @param {string} filePath
 */
function removeReceiptCaptureTempFile(filePath) {
  if (filePath === '') return;
  fs.unlink(filePath, (err) => {
    if (err) console.error('删除打印临时文件失败:', filePath, err);
  });
}

/**
 * 取已解析的 Windows 打印机名。空字符串表示没有可打的目标。
 * @param {unknown} deviceName
 * @returns {string}
 */
function resolveReceiptPrinterName(deviceName) {
  if (typeof deviceName !== 'string') return '';
  return deviceName.trim();
}

/**
 * 份数与 webContents.print 一样：缺省或非法时打 1 份。
 * @param {unknown} copies
 * @returns {number}
 */
function resolveReceiptPrintCopies(copies) {
  const count = Number(copies);
  if (!Number.isFinite(count) || count < 1) return RECEIPT_PRINT_DEFAULT_COPIES;
  return Math.floor(count);
}

/**
 * 把页面里量到的矩形收成非负整数。量失败返回 null。
 * @param {unknown} metrics
 * @returns {{ x: number, y: number, width: number, height: number } | null}
 */
function readReceiptBounds(metrics) {
  if (metrics === null || metrics === undefined || typeof metrics !== 'object') return null;
  const bounds = /** @type {{ x?: unknown, y?: unknown, width?: unknown, height?: unknown }} */ (metrics);
  const x = Number(bounds.x);
  const y = Number(bounds.y);
  const width = Number(bounds.width);
  const height = Number(bounds.height);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width < 1 || height < 1) return null;
  return {
    x: Number.isFinite(x) && x > 0 ? Math.floor(x) : 0,
    y: Number.isFinite(y) && y > 0 ? Math.floor(y) : 0,
    width: Math.ceil(width),
    height: Math.ceil(height)
  };
}

/**
 * 等排版结束后读取小票元素边界。
 * @param {import('electron').WebContents} webContents
 * @returns {Promise<{ x: number, y: number, width: number, height: number } | null>}
 */
async function measureReceiptBounds(webContents) {
  await webContents.executeJavaScript(WAIT_RECEIPT_LAYOUT_SCRIPT);
  const metrics = await webContents.executeJavaScript(MEASURE_RECEIPT_BOUNDS_SCRIPT);
  return readReceiptBounds(metrics);
}

/**
 * 加载后的页面截成位图，宽度收到 576 点。
 * @param {import('electron').BrowserWindow} receiptCaptureWindow
 * @returns {Promise<Electron.NativeImage>}
 */
async function captureReceiptNativeImage(receiptCaptureWindow) {
  const webContents = receiptCaptureWindow.webContents;

  // 步骤 1：CSS zoom 放大版面。getBoundingClientRect 会跟着变大，截图矩形按这个结果取
  await webContents.executeJavaScript(APPLY_RECEIPT_ZOOM_SCRIPT);
  const zoomedBounds = await measureReceiptBounds(webContents);
  if (zoomedBounds === null) {
    throw new Error('小票版面尺寸无效');
  }

  // 步骤 2：把窗口拉到整张小票那么高，capturePage 只截视口，不拉开会裁掉下半截
  receiptCaptureWindow.setContentSize(
    zoomedBounds.width + RECEIPT_CAPTURE_PADDING_PX,
    zoomedBounds.height + RECEIPT_CAPTURE_PADDING_PX
  );
  const fittedBounds = await measureReceiptBounds(webContents);
  if (fittedBounds === null) {
    throw new Error('小票版面尺寸无效');
  }

  // 步骤 3：只截小票元素，不带窗口留白
  const receiptImage = await webContents.capturePage({
    x: fittedBounds.x,
    y: fittedBounds.y,
    width: fittedBounds.width,
    height: fittedBounds.height
  });
  if (receiptImage.isEmpty()) {
    throw new Error('小票截图为空');
  }

  // 步骤 4：收到 80mm 通用宽度。高度按比例，保持版面不拉变形
  const resizedImage = receiptImage.resize({
    width: RECEIPT_RASTER_WIDTH_DOTS,
    quality: 'best'
  });
  const resizedSize = resizedImage.getSize();
  if (resizedSize.width !== RECEIPT_RASTER_WIDTH_DOTS || resizedSize.height < 1) {
    throw new Error('小票位图缩放失败');
  }
  if (resizedSize.height > RECEIPT_RASTER_HEIGHT_MAX) {
    throw new Error('小票内容超过光栅高度上限');
  }
  return resizedImage;
}

/**
 * BGRA 位图转成一张 ESC/POS 作业：初始化、GS v 0 光栅、走纸、半切。
 * 1 为黑点。透明像素先铺到白纸上再取亮度，避免透明黑底被打成一条黑。
 * @param {Buffer} bgraBuffer
 * @param {number} width 须为 8 的倍数
 * @param {number} height
 * @returns {Buffer}
 */
function buildEscPosJobFromBgra(bgraBuffer, width, height) {
  if (width % 8 !== 0 || width < 8 || height < 1 || height > RECEIPT_RASTER_HEIGHT_MAX) {
    throw new Error('光栅尺寸无效');
  }
  const expectedLength = width * height * 4;
  if (!Buffer.isBuffer(bgraBuffer) || bgraBuffer.length < expectedLength) {
    throw new Error('位图数据无效');
  }

  // 步骤 1：逐点二值化，一行的点数打包成 width/8 个字节，高位在左
  const bytesPerRow = width / 8;
  const raster = Buffer.alloc(bytesPerRow * height);
  const luminanceThreshold = RECEIPT_MONOCHROME_LUMINANCE_MAX * RECEIPT_LUMA_SCALE * 255;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const pixelOffset = (y * width + x) * 4;
      const blue = bgraBuffer[pixelOffset];
      const green = bgraBuffer[pixelOffset + 1];
      const red = bgraBuffer[pixelOffset + 2];
      const alpha = bgraBuffer[pixelOffset + 3];
      const redOnWhite = red * alpha + 255 * (255 - alpha);
      const greenOnWhite = green * alpha + 255 * (255 - alpha);
      const blueOnWhite = blue * alpha + 255 * (255 - alpha);
      const luminanceScaled =
        redOnWhite * RECEIPT_LUMA_RED_WEIGHT +
        greenOnWhite * RECEIPT_LUMA_GREEN_WEIGHT +
        blueOnWhite * RECEIPT_LUMA_BLUE_WEIGHT;
      if (luminanceScaled >= luminanceThreshold) continue;
      const byteIndex = y * bytesPerRow + (x >> 3);
      const bitIndex = 7 - (x & 7);
      raster[byteIndex] |= 1 << bitIndex;
    }
  }

  // 步骤 2：ESC @ 初始化；GS v 0 的 x 是每行字节数，不是点数
  const xL = bytesPerRow & 0xff;
  const xH = (bytesPerRow >> 8) & 0xff;
  const yL = height & 0xff;
  const yH = (height >> 8) & 0xff;
  const header = Buffer.from([0x1b, 0x40, 0x1d, 0x76, 0x30, 0x00, xL, xH, yL, yH]);

  // 步骤 3：走纸后半切。没有切刀的机子通常会忽略 GS V
  const footer = Buffer.from([0x1b, 0x64, ESC_POS_FEED_LINE_COUNT, 0x1d, 0x56, 0x42, 0x00]);
  return Buffer.concat([header, raster, footer]);
}

/**
 * 同一张作业重复多份。每一份都自带初始化和切纸。
 * @param {Buffer} jobBytes
 * @param {number} copies
 * @returns {Buffer}
 */
function repeatEscPosJob(jobBytes, copies) {
  if (copies === 1) return jobBytes;
  const parts = [];
  for (let copyIndex = 0; copyIndex < copies; copyIndex += 1) {
    parts.push(jobBytes);
  }
  return Buffer.concat(parts);
}

/**
 * 绑定 winspool.drv 的 RAW 写入函数。失败时抛给调用方，由打印入口收成 failureReason。
 * @returns {object}
 */
function ensureWinspoolLoaded() {
  if (winspoolApi) return winspoolApi;

  const koffi = require('koffi');
  const winspool = koffi.load('winspool.drv');
  const kernel32 = koffi.load('kernel32.dll');
  koffi.struct('DOC_INFO_1W', {
    pDocName: 'char16_t *',
    pOutputFile: 'char16_t *',
    pDatatype: 'char16_t *'
  });

  winspoolApi = {
    OpenPrinterW: winspool.func(
      'int32_t __stdcall OpenPrinterW(const char16_t *pPrinterName, _Out_ void **phPrinter, void *pDefault)'
    ),
    ClosePrinter: winspool.func('int32_t __stdcall ClosePrinter(void *hPrinter)'),
    StartDocPrinterW: winspool.func(
      'uint32_t __stdcall StartDocPrinterW(void *hPrinter, uint32_t Level, DOC_INFO_1W *pDocInfo)'
    ),
    EndDocPrinter: winspool.func('int32_t __stdcall EndDocPrinter(void *hPrinter)'),
    StartPagePrinter: winspool.func('int32_t __stdcall StartPagePrinter(void *hPrinter)'),
    EndPagePrinter: winspool.func('int32_t __stdcall EndPagePrinter(void *hPrinter)'),
    WritePrinter: winspool.func(
      'int32_t __stdcall WritePrinter(void *hPrinter, const uint8_t *pBuf, uint32_t cbBuf, _Out_ uint32_t *pcWritten)'
    ),
    GetLastError: kernel32.func('uint32_t __stdcall GetLastError()')
  };
  return winspoolApi;
}

/**
 * 把已经编码好的 ESC/POS 字节按 RAW 写入指定打印机。调用方保证 payload 非空。
 * @param {string} printerName
 * @param {Buffer} payload
 */
function writeEscPosRawToPrinter(printerName, payload) {
  const api = ensureWinspoolLoaded();
  const printerHandleSlot = [null];

  // 步骤 1：按 Windows 打印机名打开句柄。打不开就带上系统错误码返回
  const opened = api.OpenPrinterW(printerName, printerHandleSlot, null);
  const printerHandle = printerHandleSlot[0];
  if (opened === 0 || printerHandle === null || printerHandle === undefined) {
    throw new Error('打开打印机失败: ' + String(api.GetLastError()));
  }

  let documentStarted = false;
  let pageStarted = false;
  try {
    // 步骤 2：数据类型必须是 RAW。写成 EMF 会回到小票机认不出的那条路
    const jobId = api.StartDocPrinterW(printerHandle, 1, {
      pDocName: RAW_DOCUMENT_NAME,
      pOutputFile: null,
      pDatatype: RAW_DATATYPE
    });
    if (jobId === 0) {
      throw new Error('开始打印作业失败: ' + String(api.GetLastError()));
    }
    documentStarted = true;

    // 步骤 3：一页里把全部字节写完。WritePrinter 可能只吃进一部分，按返回长度续写
    if (api.StartPagePrinter(printerHandle) === 0) {
      throw new Error('开始打印页失败: ' + String(api.GetLastError()));
    }
    pageStarted = true;

    let offset = 0;
    while (offset < payload.length) {
      // 拷贝剩余字节。koffi 若忽略 Buffer 的 byteOffset，直接传 subarray 会把前面的字节再写一遍
      const remaining = Buffer.from(payload.subarray(offset));
      const writtenSlot = [0];
      const wrote = api.WritePrinter(printerHandle, remaining, remaining.length, writtenSlot);
      const writtenByteCount = writtenSlot[0];
      if (wrote === 0 || typeof writtenByteCount !== 'number' || writtenByteCount <= 0) {
        throw new Error('写入打印数据失败: ' + String(api.GetLastError()));
      }
      offset += writtenByteCount;
    }

    if (api.EndPagePrinter(printerHandle) === 0) {
      throw new Error('结束打印页失败: ' + String(api.GetLastError()));
    }
    pageStarted = false;
    if (api.EndDocPrinter(printerHandle) === 0) {
      throw new Error('结束打印作业失败: ' + String(api.GetLastError()));
    }
    documentStarted = false;
  } catch (err) {
    // 步骤 4：中途失败时把已经开始的页和作业关掉，避免打印机一直占着这份 RAW
    if (pageStarted) {
      try {
        api.EndPagePrinter(printerHandle);
      } catch (endPageError) {
        console.error('[escpos-raw-print] EndPagePrinter failed:', endPageError);
      }
    }
    if (documentStarted) {
      try {
        api.EndDocPrinter(printerHandle);
      } catch (endDocError) {
        console.error('[escpos-raw-print] EndDocPrinter failed:', endDocError);
      }
    }
    throw err;
  } finally {
    api.ClosePrinter(printerHandle);
  }
}

/**
 * Windows 小票打印入口：HTML → 576 点光栅 → RAW。
 * 失败只返回 success: false，调用方不要再改走 webContents.print。
 * @param {{ htmlDocument?: string, deviceName?: string, copies?: number }} options
 * @returns {Promise<{ success: boolean, failureReason: string }>}
 */
async function printHtmlAsEscposRaw(options) {
  const printerName = resolveReceiptPrinterName(options?.deviceName);
  if (printerName === '') {
    return { success: false, failureReason: 'no-printer' };
  }

  const copies = resolveReceiptPrintCopies(options?.copies);
  const htmlDocument = typeof options?.htmlDocument === 'string' ? options.htmlDocument : '';
  let receiptCaptureWindow = null;
  let htmlTempPath = '';

  try {
    // 步骤 1：隐藏窗口加载与原来相同的 HTML
    receiptCaptureSerial += 1;
    htmlTempPath = path.join(
      os.tmpdir(),
      RECEIPT_CAPTURE_HTML_PREFIX + Date.now() + '-' + String(receiptCaptureSerial) + '.html'
    );
    fs.writeFileSync(htmlTempPath, htmlDocument, 'utf8');
    receiptCaptureWindow = createReceiptCaptureWindow();
    await receiptCaptureWindow.loadFile(htmlTempPath);

    // 步骤 2：截图并编成 ESC/POS，多份就重复整段指令
    const receiptImage = await captureReceiptNativeImage(receiptCaptureWindow);
    const imageSize = receiptImage.getSize();
    const jobBytes = buildEscPosJobFromBgra(receiptImage.toBitmap(), imageSize.width, imageSize.height);
    const payload = repeatEscPosJob(jobBytes, copies);

    // 步骤 3：RAW 写入当前打印机。这里失败不能再退回 EMF
    writeEscPosRawToPrinter(printerName, payload);
    return { success: true, failureReason: '' };
  } catch (err) {
    return {
      success: false,
      failureReason: err instanceof Error ? err.message : String(err)
    };
  } finally {
    if (receiptCaptureWindow !== null && !receiptCaptureWindow.isDestroyed()) {
      receiptCaptureWindow.close();
    }
    removeReceiptCaptureTempFile(htmlTempPath);
  }
}

module.exports = {
  printHtmlAsEscposRaw,
  buildEscPosJobFromBgra
};
