const { app, BrowserWindow, screen, ipcMain, globalShortcut, Menu, session, net } = require('electron');
const path = require('node:path');
const fs = require('fs');
const os = require('os');
const { fork, execFile } = require('child_process');
const { promisify } = require('util');

const { queryThermalPrinterPaperStatus } = require('./thermal-printer-paper');
const {
  listAutoreplyprintPorts,
  queryConfiguredPaperStatus,
  queryPaperStatusOnPort,
  verifyPrintJobOnConfiguredPort
} = require('./autoreplyprint-bridge');
const { SerialPort } = require('serialport');

const execFileAsync = promisify(execFile);

/**************************************tools*************************************************/
const tools = {
  // 获取配置
  getConfig: function () {
    const configPath = tools.getResourcesPath('app/config.json');
    return tools.getJSON(fs.readFileSync(configPath, 'utf8'));
  },
  setConfig: function (options) {
    const config = tools.getConfig();
    Object.keys(options ?? {}).forEach((name) => {
      config[name] = options[name];
    });
    const configPath = tools.getResourcesPath('app/config.json');
    return fs.writeFileSync(configPath, JSON.stringify(config), 'utf8');
  },
  // 获取json
  getJSON: function (value, def) {
    if (!value) return def;
    try {
      return JSON.parse(value);
    } catch (e) {
      return def;
    }
  },
  // 获取json
  getResourcesPath: function (url) {
    return app.isPackaged ? path.join(process.resourcesPath, url) : path.join(__dirname, 'resources/' + url);
  }
};

/**************************************shortcutIcon*************************************************/
// 快捷方式图标本地文件名（前端传入 .ico 地址）
const SHORTCUT_ICON_FILE_NAME = 'shortcut.ico';

/** @returns {string} 快捷方式图标本地路径 */
function getShortcutIconPath() {
  return path.join(app.getPath('userData'), 'icons', SHORTCUT_ICON_FILE_NAME);
}

/** 确保图标目录存在 */
function ensureShortcutIconDir() {
  const dir = path.dirname(getShortcutIconPath());
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

/** @param {string} url */
async function downloadIcoBuffer(url) {
  const response = await net.fetch(url);
  if (!response.ok) {
    throw new Error(`下载图标失败: ${response.status} ${response.statusText}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

/** @param {Buffer} buffer */
function isIcoBuffer(buffer) {
  return buffer.length >= 4 && buffer[0] === 0 && buffer[1] === 0 && buffer[2] === 1 && buffer[3] === 0;
}

/**
 * 将 .ico buffer 写入本地，供快捷方式 IconLocation 引用
 * @param {Buffer} buffer
 * @returns {string}
 */
function saveIcoFromBuffer(buffer) {
  if (!isIcoBuffer(buffer)) throw new Error('无效的图片格式，请传入 .ico 地址');

  ensureShortcutIconDir();
  const icoPath = getShortcutIconPath();
  fs.writeFileSync(icoPath, buffer);
  return icoPath;
}

/**
 * Windows：通知 Shell 刷新桌面/图标缓存（避免需手动 F5 刷新桌面）
 */
async function notifyWindowsShellRefresh() {
  const script = [
    'Add-Type -MemberDefinition \'[DllImport("shell32.dll")] public static extern void SHChangeNotify(uint wEventId, uint uFlags, IntPtr dwItem1, IntPtr dwItem2);\' -Name ShellNotify -Namespace Win32',
    '[Win32.ShellNotify]::SHChangeNotify(0x8000000, 0, [IntPtr]::Zero, [IntPtr]::Zero)' // SHCNE_ASSOCCHANGED
  ].join('; ');
  await execFileAsync('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', script], {
    windowsHide: true
  });
}

/**
 * Windows：更新桌面与开始菜单中指向本 exe 的快捷方式图标
 * @param {string} icoPath
 * @returns {Promise<number>} 更新的快捷方式数量
 */
async function updateWindowsShortcutIcons(icoPath) {
  const exePath = process.execPath;
  const psExePath = exePath.replace(/'/g, "''");
  const psIcoPath = path.resolve(icoPath).replace(/'/g, "''");
  const searchDirs = [
    app.getPath('desktop'),
    path.join(app.getPath('appData'), 'Microsoft', 'Windows', 'Start Menu', 'Programs')
  ];
  const psSearchDirs = searchDirs.map((dir) => `'${dir.replace(/'/g, "''")}'`).join(', ');
  const script = [
    `$exePath = '${psExePath}'`,
    `$iconPath = '${psIcoPath}'`,
    `$searchDirs = @(${psSearchDirs})`,
    '$shell = New-Object -ComObject WScript.Shell',
    '$updated = 0',
    'foreach ($dir in $searchDirs) {',
    '  if (-not (Test-Path $dir)) { continue }',
    '  Get-ChildItem -Path $dir -Filter *.lnk -Recurse -ErrorAction SilentlyContinue | ForEach-Object {',
    '    try {',
    '      $shortcut = $shell.CreateShortcut($_.FullName)',
    '      if ($shortcut.TargetPath -ieq $exePath) {',
    '        $shortcut.IconLocation = "$iconPath,0"',
    '        $shortcut.Save()',
    '        $updated++',
    '      }',
    '    } catch {}',
    '  }',
    '}',
    'Write-Output $updated'
  ].join('\n');

  const { stdout } = await execFileAsync(
    'powershell.exe',
    ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', script],
    { windowsHide: true }
  );
  return parseInt(String(stdout).trim(), 10) || 0;
}

/**
 * 从 .ico URL 下载并更新快捷方式图标
 * @param {string} url
 */
async function applyShortcutIconFromUrl(url) {
  if (process.platform !== 'win32') throw new Error('仅支持 Windows');

  const buffer = await downloadIcoBuffer(url);
  const icoPath = saveIcoFromBuffer(buffer);
  const updated = await updateWindowsShortcutIcons(icoPath);
  if (updated > 0) await notifyWindowsShellRefresh();
  if (updated === 0) {
    console.warn('未找到指向本应用的快捷方式，图标已写入:', icoPath);
  }
  return { success: true, updated };
}

/** @param {string} name */
function validateShortcutName(name) {
  if (!name || typeof name !== 'string') throw new Error('无效的快捷方式名称');
  const trimmed = name.trim();
  if (!trimmed) throw new Error('无效的快捷方式名称');
  if (/[\\/:*?"<>|]/.test(trimmed)) throw new Error('快捷方式名称包含非法字符');
  return trimmed;
}

/**
 * Windows：重命名桌面指向本 exe 的快捷方式（修改 .lnk 文件名）
 * @param {string} name
 * @returns {Promise<number>}
 */
async function updateWindowsDesktopShortcutName(name) {
  const exePath = process.execPath;
  const psExePath = exePath.replace(/'/g, "''");
  const psName = name.replace(/'/g, "''");
  const psDesktopDir = app.getPath('desktop').replace(/'/g, "''");
  const script = [
    `$exePath = '${psExePath}'`,
    `$newName = '${psName}'`,
    `$desktopDir = '${psDesktopDir}'`,
    '$shell = New-Object -ComObject WScript.Shell',
    '$updated = 0',
    'if (-not (Test-Path $desktopDir)) { Write-Output 0; exit }',
    'Get-ChildItem -Path $desktopDir -Filter *.lnk -ErrorAction SilentlyContinue | ForEach-Object {',
    '  try {',
    '    $shortcut = $shell.CreateShortcut($_.FullName)',
    '    if ($shortcut.TargetPath -ieq $exePath) {',
    '      $newPath = Join-Path $desktopDir ($newName + \'.lnk\')',
    '      if ($_.FullName -ieq $newPath) { $updated++; return }',
    '      if (Test-Path $newPath) { Remove-Item -LiteralPath $newPath -Force }',
    '      Rename-Item -LiteralPath $_.FullName -NewName ($newName + \'.lnk\')',
    '      $updated++',
    '    }',
    '  } catch {}',
    '}',
    'Write-Output $updated'
  ].join('\n');

  const { stdout } = await execFileAsync(
    'powershell.exe',
    ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', script],
    { windowsHide: true }
  );
  return parseInt(String(stdout).trim(), 10) || 0;
}

/**
 * 修改桌面快捷方式显示名称
 * @param {string} name
 */
async function applyDesktopShortcutName(name) {
  if (process.platform !== 'win32') throw new Error('仅支持 Windows');

  const shortcutName = validateShortcutName(name);
  const updated = await updateWindowsDesktopShortcutName(shortcutName);
  if (updated > 0) await notifyWindowsShellRefresh();
  if (updated === 0) {
    console.warn('未找到桌面上的本应用快捷方式');
  }
  return { success: true, updated };
}

/**************************************print*************************************************/
// 打印 HTML 文档标题
const PRINT_HTML_DOCUMENT_TITLE = '打印';
// 打印临时 HTML 文件名前缀
const PRINT_TEMP_HTML_FILE_PREFIX = 'gv-print-html-';
// 打印默认份数
const PRINT_DEFAULT_COPIES = 1;
// 静默打印用隐藏窗口宽度（逻辑像素）
const PRINT_HIDDEN_WINDOW_WIDTH = 1;
// 静默打印用隐藏窗口高度（逻辑像素）
const PRINT_HIDDEN_WINDOW_HEIGHT = 1;

/**
 * 创建用于静默打印的隐藏 BrowserWindow（不可见、不出现在任务栏）
 * @returns {import('electron').BrowserWindow}
 */
function createHiddenPrintWindow() {
  return new BrowserWindow({
    show: false,
    skipTaskbar: true,
    width: PRINT_HIDDEN_WINDOW_WIDTH,
    height: PRINT_HIDDEN_WINDOW_HEIGHT
  });
}

/**
 * 生成打印用的完整 HTML 文档字符串
 * @param {string} contentHtml - 渲染进程传入的表格片段（含内联 style）
 * @returns {string}
 */
function buildPrintHtmlDocument(contentHtml) {
  return (
    '<!DOCTYPE html>' +
    '<html><head><meta charset="utf-8"><title>' +
    PRINT_HTML_DOCUMENT_TITLE +
    '</title>' +
    '<style>html,body{margin:0;padding:0;-webkit-print-color-adjust: exact;print-color-adjust: exact;}</style>' +
    '</head><body>' +
    (contentHtml ?? '') +
    '</body></html>'
  );
}

/**
 * 将前端 config 转为 webContents.print 合法参数（过滤 showHeaderFooter 等非 print 字段）
 * @param {Record<string, unknown>} config
 * @returns {Record<string, unknown>}
 */
function buildPrintOptionsFromConfig(config) {
  const printOptions = {
    silent: true,
    printBackground: true,
    deviceName: config?.deviceName || '',
    copies: config?.copies || PRINT_DEFAULT_COPIES
  };
  if (config?.pageSize) {
    printOptions.pageSize = config.pageSize;
  }
  if (config?.showHeaderFooter === false) {
    printOptions.header = '';
    printOptions.footer = '';
  }
  return printOptions;
}

/**
 * 删除打印临时文件
 * @param {string} filePath
 */
function removePrintTempFile(filePath) {
  if (!filePath) return;
  fs.unlink(filePath, (err) => {
    if (err) console.error('删除打印临时文件失败:', filePath, err);
  });
}

/**************************************ipc*************************************************/
function initIPC(mainWindow) {
  // 处理获取MAC地址的请求
  ipcMain.handle('get-mac-address', () => {
    const interfaces = os.networkInterfaces();
    for (const interfaceName of Object.keys(interfaces)) {
      const interfaceInfos = interfaces[interfaceName];
      for (const info of interfaceInfos) {
        if (info.mac && info.mac !== '00:00:00:00:00:00' && info.family === 'IPv4') {
          return info.mac; // 返回第一个有效的MAC地址
        }
      }
    }
    return null; // 未找到时返回null
  });

  // 处理获取IP地址的请求
  ipcMain.handle('get-ip-address', () => {
    const interfaces = os.networkInterfaces();
    for (const interfaceName of Object.keys(interfaces)) {
      const interfaceInfos = interfaces[interfaceName];
      for (const info of interfaceInfos) {
        // 过滤IPv4地址、排除本地回环及虚拟网卡
        if (info.family === 'IPv4' && !info.internal && info.mac !== '00:00:00:00:00:00') {
          return info.address;
        }
      }
    }
    return null;
  });

  // 处理获取设备信息
  ipcMain.handle('get-device-info', () => {
    return {
      osType: os.type(), // 操作系统类型（Linux/Darwin/Windows_NT）
      osArch: os.arch(), // 系统架构（x64/arm）
      hostname: os.hostname() // 主机名
    };
  });

  // 获取设备宽度
  ipcMain.handle('get-screen-size', () => {
    const primaryDisplay = screen.getPrimaryDisplay(); // 获取主显示器
    return {
      width: primaryDisplay.size.width, // 屏幕宽度（逻辑像素）
      height: primaryDisplay.size.height // 屏幕高度（逻辑像素）
    };
  });

  // 获取本地config
  ipcMain.handle('get-local-config', (event, options) => {
    return tools.getConfig();
  });

  // 设置本地config
  ipcMain.handle('set-local-config', (event, options) => {
    return tools.setConfig(options);
  });

  // 设置是否全屏
  ipcMain.handle('get-fullscreen', () => {
    return mainWindow.isFullScreen();
  });

  // 设置是否全屏
  ipcMain.handle('set-fullscreen', (event, isFullScreen) => {
    return mainWindow.setFullScreen(isFullScreen);
  });

  // 退出app
  ipcMain.handle('app-quit', (event, options) => {
    app.quit();
  });

  // 获取打印机信息
  ipcMain.handle('get-printers', async () => {
    const printWindow = createHiddenPrintWindow();
    const list = await printWindow.webContents.getPrintersAsync();
    printWindow.close();
    return [...list];
  });

  // autoreplyprint SDK：枚举 USB / COM 口（KP-80A 等，CP001 走 USB）
  ipcMain.handle('get-autoreplyprint-ports', async () => {
    return listAutoreplyprintPorts();
  });

  // autoreplyprint SDK：按 config 检测缺纸（优先 SDK，legacy COM 仅作兜底）
  ipcMain.handle('query-thermal-printer-paper-status', async () => {
    const localConfig = tools.getConfig();
    const sdkResult = await queryConfiguredPaperStatus(localConfig);
    if (sdkResult.error !== 'NOT_CONFIGURED' && sdkResult.error !== 'SDK_NOT_LOADED') {
      return sdkResult;
    }

    const comPort = String(localConfig?.thermal_printer_com_port ?? localConfig?.thermal_printer_port ?? '').trim();
    if (comPort === '' || !/^COM\d+$/i.test(comPort)) {
      return sdkResult;
    }

    const baudRate = Number(localConfig?.thermal_printer_baud_rate);
    return queryThermalPrinterPaperStatus({
      path: comPort,
      baudRate: Number.isFinite(baudRate) && baudRate > 0 ? baudRate : undefined
    });
  });

  // autoreplyprint SDK：测试页面临时端口检测
  ipcMain.handle('query-autoreplyprint-paper-status', async (event, options) => {
    const port = String(options?.port ?? '').trim();
    const type = options?.type === 'com' ? 'com' : 'usb';
    const baudRate = Number(options?.baudRate);
    if (port === '') {
      return { ok: false, error: 'NOT_CONFIGURED', paperOut: false };
    }
    return queryPaperStatusOnPort({
      port,
      type,
      baudRate: Number.isFinite(baudRate) && baudRate > 0 ? baudRate : 19200
    });
  });

  // autoreplyprint SDK：静默 HTML 打印提交后校验出纸/错误
  ipcMain.handle('verify-autoreplyprint-print-job', async () => {
    const localConfig = tools.getConfig();
    return verifyPrintJobOnConfiguredPort(localConfig);
  });

  // 获取本机串口列表（SerialPort.list，legacy）
  ipcMain.handle('get-serial-ports', async () => {
    try {
      const list = await SerialPort.list();
      return list
        .map((item) => ({
          path: item.path,
          manufacturer: item.manufacturer || '',
          friendlyName: item.friendlyName || '',
          serialNumber: item.serialNumber || ''
        }))
        .filter((item) => typeof item.path === 'string' && item.path.trim() !== '')
        .sort((a, b) => a.path.localeCompare(b.path, undefined, { numeric: true }));
    } catch (err) {
      console.error('[electron] get-serial-ports failed:', err);
      return [];
    }
  });

  // 离线页点击「重新连接」时，再次尝试加载 config.root_url
  ipcMain.handle('retry-root-url', () => {
    loadRootUrl(mainWindow);
  });

  // 前端设置桌面快捷方式图标（传入可访问的 .ico 地址）
  ipcMain.handle('set-shortcut-icon', async (event, imageUrl) => {
    if (process.platform !== 'win32') throw new Error('仅支持 Windows');
    if (!imageUrl || typeof imageUrl !== 'string') throw new Error('无效的图标地址');
    return applyShortcutIconFromUrl(imageUrl);
  });

  // 前端修改桌面快捷方式名称
  ipcMain.handle('set-shortcut-name', async (event, name) => {
    if (process.platform !== 'win32') throw new Error('仅支持 Windows');
    return applyDesktopShortcutName(name);
  });

  // 打印html：隐藏窗口加载 HTML 后 silent 静默直打（与前端 table-print-dialog 的 config 配套）
  ipcMain.handle('print-html', async (event, options) => {
    const htmlTempPath = path.join(os.tmpdir(), PRINT_TEMP_HTML_FILE_PREFIX + Date.now() + '.html');
    const printWindow = createHiddenPrintWindow();

    try {
      const htmlDocument = buildPrintHtmlDocument(options.content);
      fs.writeFileSync(htmlTempPath, htmlDocument, 'utf8');
      await printWindow.loadFile(htmlTempPath);
      const printOptions = buildPrintOptionsFromConfig(options.config ?? {});
      const printResult = await new Promise((resolve) => {
        printWindow.webContents.print(printOptions, (success, failureReason) => {
          if (!success) console.error('打印失败:', failureReason);
          resolve({ success: success === true, failureReason: failureReason ?? '' });
        });
      });
      return printResult;
    } catch (err) {
      console.error('打印 HTML 失败:', err);
      return { success: false, failureReason: err instanceof Error ? err.message : String(err) };
    } finally {
      if (!printWindow.isDestroyed()) printWindow.close();
      removePrintTempFile(htmlTempPath);
    }
  });
}

/**************************************main*************************************************/
let mainWindow;
const config = tools.getConfig();

// root_url 加载失败时展示离线提示页（见 offline.html）
const ERR_ABORTED = -3; // 导航被中断（如重试时切换页面），不应视为连接失败

// 加载远程 SPA；showLoading 为 true 时先展示 loading.html（仅首次启动使用）
function loadRootUrl(win, { showLoading = false } = {}) {
  if (!config.root_url) return;

  if (showLoading) {
    win.loadFile(path.join(__dirname, 'loading.html'));
    win.webContents.once('did-finish-load', () => {
      if (win.webContents.getURL().includes('loading.html')) {
        win.loadURL(config.root_url);
      }
    });
    return;
  }

  win.loadURL(config.root_url);
}

// 加载本地离线提示页
function showOfflinePage(win) {
  win.loadFile(path.join(__dirname, 'offline.html'));
}

// 监听 root_url 主框架加载失败，跳转离线页
function setupRootUrlLoadFailureHandler(win) {
  win.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL, isMainFrame) => {
    if (!isMainFrame) return; // 忽略子资源（图片、脚本等）失败
    if (errorCode === ERR_ABORTED) return; // 忽略主动取消的导航
    if (!config.root_url) return;
    if (validatedURL.includes('offline.html')) return;
    if (validatedURL.includes('loading.html')) return;
    showOfflinePage(win);
  });
}

const createWindow = () => {
  const primaryDisplay = screen.getPrimaryDisplay(); // 获取主显示器
  const width = Math.min(1920, primaryDisplay.size.width);
  const height = Math.min(1080, primaryDisplay.size.height);

  // 赋值给模块级变量，供 second-instance 聚焦及 IPC 重试使用
  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    autoHideMenuBar: true,
    fullscreen: !!config.fullscreen,
    icon: tools.getResourcesPath('app/icons/favicon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      // 远程 SPA 使用自签 HTTPS，webSecurity:true 会导致 cookie 重启后丢失
      webSecurity: false
    }
  });

  if (!!config.root_url) {
    setupRootUrlLoadFailureHandler(mainWindow); // 连接失败时显示离线页
    loadRootUrl(mainWindow, { showLoading: true }); // 首次启动先展示 loading 页
  } else {
    mainWindow.loadFile('./index.html');
  }

  // 打开开发工具
  // mainWindow.webContents.openDevTools();

  // 注册 F12 快捷键
  globalShortcut.register('CommandOrControl+Shift+I', () => {
    if (mainWindow) {
      if (mainWindow.webContents.isDevToolsOpened()) {
        mainWindow.webContents.closeDevTools();
      } else {
        mainWindow.webContents.openDevTools();
      }
    }
  });

  // 加载完成后最大化窗口
  mainWindow.on('ready-to-show', () => {
    if (width === primaryDisplay.size.width) mainWindow.maximize();
  });

  // ipc事件初始化
  initIPC(mainWindow);
};

// 禁用 Private Network Access 限制（公网 SPA 访问本地 127.0.0.1:9999）
app.commandLine.appendSwitch(
  'disable-features',
  [
    'BlockInsecurePrivateNetworkRequests',
    'PrivateNetworkAccessSendPreflights',
    'PrivateNetworkAccessRespectPreflightResults'
  ].join(',')
);

// 忽略 HTTPS 证书安全警告
app.commandLine.appendSwitch('ignore-certificate-errors', 'true');

app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  event.preventDefault();
  callback(true); // 强制通过证书
});

// 这段程序将会在 Electron 结束初始化
// 和创建浏览器窗口的时候调用
// 部分 API 在 ready 事件触发后才能使用。

const nodeProcess = {};

// session cookie 无 Expires/Max-Age，Electron 关闭后会被清除，需转为持久 cookie
const SESSION_COOKIE_TTL_SECONDS = 14 * 24 * 60 * 60;

function getCookieUrl(cookie) {
  const host = cookie.domain?.startsWith('.') ? cookie.domain.slice(1) : cookie.domain;
  return `${cookie.secure ? 'https' : 'http'}://${host}${cookie.path || '/'}`;
}

function getRootHost() {
  try {
    return new URL(config.root_url).hostname;
  } catch {
    return null;
  }
}

function isRootUrlCookie(cookie) {
  const rootHost = getRootHost();
  if (!rootHost || !cookie.domain) return true;
  const domain = cookie.domain.startsWith('.') ? cookie.domain.slice(1) : cookie.domain;
  return domain === rootHost || domain.endsWith('.' + rootHost);
}

function setupSessionCookiePersistence() {
  const cookies = session.defaultSession.cookies;

  cookies.on('changed', async (event, cookie, cause, removed) => {
    if (removed || !cookie.session || !isRootUrlCookie(cookie)) return;

    try {
      await cookies.set({
        url: getCookieUrl(cookie),
        name: cookie.name,
        value: cookie.value,
        domain: cookie.domain,
        path: cookie.path,
        secure: cookie.secure,
        httpOnly: cookie.httpOnly,
        sameSite: cookie.sameSite,
        expirationDate: Math.floor(Date.now() / 1000) + SESSION_COOKIE_TTL_SECONDS
      });
    } catch (err) {
      console.error('Failed to persist session cookie:', cookie.name, err);
    }
  });
}

function setupLocalServiceCorsHeaders() {
  session.defaultSession.webRequest.onHeadersReceived(
    { urls: ['https://127.0.0.1:9999/*', 'https://localhost:9999/*'] },
    (details, callback) => {
      const headers = { ...details.responseHeaders };
      headers['Access-Control-Allow-Origin'] = ['*'];
      headers['Access-Control-Allow-Private-Network'] = ['true'];
      callback({ responseHeaders: headers });
    }
  );
}

const gotTheLock = app.requestSingleInstanceLock(); // 必须在app.whenReady()前调用
if (!gotTheLock) {
  app.quit(); // 退出第二个实例
} else {
  // 监听第二个实例的启动事件
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore(); // 恢复最小化窗口
      mainWindow.focus(); // 聚焦到前台
    }
  });

  app.whenReady().then(() => {
    setupSessionCookiePersistence();
    setupLocalServiceCorsHeaders();
    createWindow();

    app.on('activate', () => {
      // 在 macOS 系统内, 如果没有已开启的应用窗口
      // 点击托盘图标时通常会重新创建一个新窗口
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });

    // 启动 Node 服务
    nodeProcess.serial = fork(path.join(__dirname, 'hk.http.js'), { windowsHide: true });
    nodeProcess.socket = fork(path.join(__dirname, 'socket-server.js'), { windowsHide: true });
  });
}

// 除了 macOS 外，当所有窗口都被关闭的时候退出程序。 因此, 通常
// 对应用程序和它们的菜单栏来说应该时刻保持激活状态,
// 直到用户使用 Cmd + Q 明确退出
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// 退出时强制将 cookie 写入磁盘并关闭 Node 服务
let isFlushingCookies = false;
app.on('before-quit', (event) => {
  if (isFlushingCookies) return;
  event.preventDefault();
  isFlushingCookies = true;
  session.defaultSession.cookies
    .flushStore()
    .catch((err) => console.error('Failed to flush cookies on quit:', err))
    .finally(() => {
      if (nodeProcess.serial) nodeProcess.serial.kill();
      if (nodeProcess.socket) nodeProcess.socket.kill();
      globalShortcut.unregisterAll();
      app.exit(0);
    });
});

// 在当前文件中你可以引入所有的主进程代码
// 也可以拆分成几个文件，然后用 require 导入。
