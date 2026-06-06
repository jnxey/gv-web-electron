const { app, BrowserWindow, screen, ipcMain, globalShortcut, Menu } = require('electron');
const path = require('node:path');
const fs = require('fs');
const os = require('os');
const { fork } = require('child_process');

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
    // 创建隐藏窗口
    const printWindow = new BrowserWindow({ show: false });
    const list = await printWindow.webContents.getPrintersAsync();
    printWindow.close();
    return [...list];
  });

  // 打印html
  ipcMain.handle('print-html', (event, options) => {
    // 创建隐藏窗口
    const printWindow = new BrowserWindow({ show: false });

    // 加载 HTML 字符串（需编码）
    printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURI(options.content)}`);

    printWindow.webContents.openDevTools();

    // 监听页面加载完成
    printWindow.webContents.on('did-finish-load', () => {
      // 触发打印
      printWindow.webContents.print(options.config, (success) => {
        if (success) console.log('打印成功');
        printWindow.close(); // 关闭窗口
      });
    });
  });
}

/**************************************main*************************************************/
let mainWindow;
const config = tools.getConfig();

const createWindow = () => {
  const primaryDisplay = screen.getPrimaryDisplay(); // 获取主显示器
  const width = Math.min(1920, primaryDisplay.size.width);
  const height = Math.min(1080, primaryDisplay.size.height);

  const mainWindow = new BrowserWindow({
    width: width,
    height: height,
    autoHideMenuBar: true,
    fullscreen: !!config.fullscreen,
    icon: tools.getResourcesPath('app/icons/favicon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      webSecurity: false
    }
  });

  if (!!config.root_url) {
    mainWindow.loadURL(config.root_url);
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

// 退出时关闭 Node 服务
app.on('will-quit', () => {
  if (nodeProcess.serial) nodeProcess.serial.kill();
  if (nodeProcess.socket) nodeProcess.socket.kill();
  globalShortcut.unregisterAll();
});

// 在当前文件中你可以引入所有的主进程代码
// 也可以拆分成几个文件，然后用 require 导入。
