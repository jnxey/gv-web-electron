# 编译 TX 原生侧车（Win32 / 32 位，与厂商 Demo 相同）

原生侧车用 `LoadLibrary` 直接加载 SDK，与可正常扫码的 `tx_windows_fdata.exe` 一致。  
Node+koffi 侧车在部分环境下会出现 `dev no find`，因此 **优先使用本 exe**。

## 方式 A：Visual Studio（推荐）

1. 打开厂商工程目录下的 Visual Studio Developer Command Prompt（**x86**）
2. 执行：

```bat
cd /d D:\Work\gv-web-electron\resources\app\tx-scanner-native-sidecar
cl /nologo /EHsc /O2 /MT native-sidecar.cpp /Fe:native-sidecar.exe
```

3. 确认生成 `native-sidecar.exe`（PE 为 32 位）
4. **完全重启 Electron**，在消费柜台设置页重新测试

## 方式 B：npm 脚本（自动查找 MSBuild / cl）

在 `gv-web-electron` 根目录：

```powershell
npm run build:tx-scanner-native-sidecar
```

## 验证

```powershell
$env:TX_SCANNER_DLL_DIR = "D:\Work\gv-web-electron\resources\app\lib"
cd $env:TX_SCANNER_DLL_DIR
echo '{"cmd":"start","requestId":"t1"}' | D:\Work\gv-web-electron\resources\app\tx-scanner-native-sidecar\native-sidecar.exe
```

应看到 `"ok":true` 且扫码时有 `"type":"decode"` 行。

## 文件位置

```
resources/app/tx-scanner-native-sidecar/
  native-sidecar.cpp
  native-sidecar.exe   ← 编译产物（需自行生成）
```

Electron 启动时会 **优先 spawn native-sidecar.exe**，不存在时才回退 node-x86 + sidecar.js。
