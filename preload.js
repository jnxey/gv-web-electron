const { contextBridge, ipcRenderer } = require('electron');

// 安全地暴露功能到渲染进程
contextBridge.exposeInMainWorld('electron', {
  // 获取版本信息
  getVersion: () => console.log('Hello from Electron!'),
  // 获取Mac地址
  getMacAddress: () => {
    return ipcRenderer.invoke('get-mac-address');
  },
  // 获取IP地址
  getIPAddress: () => {
    return ipcRenderer.invoke('get-ip-address');
  },
  // 获取设备基础信息
  getDevice: () => {
    return ipcRenderer.invoke('get-device-info');
  },
  // 获取屏幕大小
  getScreenSize: () => {
    return ipcRenderer.invoke('get-screen-size');
  },
  // 获取本地配置
  getLocalConfig: () => {
    return ipcRenderer.invoke('get-local-config');
  },
  // 设置本地配置
  setLocalConfig: (options) => {
    return ipcRenderer.invoke('set-local-config', options);
  },
  // 退出应用
  appQuit() {
    return ipcRenderer.invoke('app-quit');
  },
  // 获取打印机
  getPrinters: async (content) => {
    return ipcRenderer.invoke('get-printers', content);
  },
  // 打印html
  printHtml: async (options) => {
    return ipcRenderer.invoke('print-html', options);
  },
  // KP-80A 热敏打印机缺纸检测（虚拟 COM + ESC/POS DLE EOT）
  queryThermalPrinterPaperStatus: async () => {
    return ipcRenderer.invoke('query-thermal-printer-paper-status');
  },
  // 获取本机串口列表
  getSerialPorts: async () => {
    return ipcRenderer.invoke('get-serial-ports');
  },
  // 获取是否是全屏
  getFullscreen: async () => {
    return ipcRenderer.invoke('get-fullscreen');
  },
  // 设置全屏与否
  setFullscreen: async (options) => {
    return ipcRenderer.invoke('set-fullscreen', options);
  },
  // 离线页重试：再次加载 config.root_url
  retryRootUrl: () => {
    return ipcRenderer.invoke('retry-root-url');
  },
  // 设置桌面快捷方式图标（传入可访问的 .ico 地址）
  setShortcutIcon: (imageUrl) => {
    return ipcRenderer.invoke('set-shortcut-icon', imageUrl);
  },
  // 修改桌面快捷方式名称
  setShortcutName: (name) => {
    return ipcRenderer.invoke('set-shortcut-name', name);
  }
});
