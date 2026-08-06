/**
 * TX FData SDK 原生 32 位侧车（与厂商 Demo 相同 LoadLibrary 方式，JSON stdin/stdout）。
 * 编译：Win32 Release，见 build-native-sidecar.ps1
 */
#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>
#include <stdarg.h>

typedef int32_t int32;
typedef uint8_t uint8;
typedef uint16_t uint16;
typedef uint32_t uint32;

static const int32 SUCC = 0;

typedef int32(__cdecl* tx_scanner_decode_data_cb_fun)(uint8 ucCodeType, uint8* pBuf, uint32 uiBufLen);
typedef void(__cdecl* tx_scanner_comm_state_cb_fun)(uint8 ucState);

typedef int32(__cdecl* ptx_scanner_init)(void);
typedef int32(__cdecl* ptx_scanner_deinit)(void);
typedef int32(__cdecl* ptx_scanner_get_version)(uint8* pVer, uint8 ucVerLen);
typedef int32(__cdecl* ptx_scanner_decode_data_fun_register)(tx_scanner_decode_data_cb_fun fDataFun);
typedef int32(__cdecl* ptx_scanner_comm_state_fun_register)(tx_scanner_comm_state_cb_fun fStateFun);
typedef int32(__cdecl* ptx_scanner_decode_start)(void);
typedef int32(__cdecl* ptx_scanner_decode_stop)(void);
typedef int32(__cdecl* ptx_scanner_set_trigger_mode)(uint8 eMode, uint8 isSaveParam);
typedef int32(__cdecl* ptx_scanner_get_trigger_mode)(void);
typedef int32(__cdecl* ptx_scanner_get_version_info)(uint8* pucVerInfo, uint16 usLen);
typedef int32(__cdecl* ptx_scanner_get_all_product_info)(uint8* pucProInfo, uint16 usLen);

static HINSTANCE g_hLib = NULL;
static ptx_scanner_init tx_scanner_init = NULL;
static ptx_scanner_deinit tx_scanner_deinit = NULL;
static ptx_scanner_get_version tx_scanner_get_version = NULL;
static ptx_scanner_decode_data_fun_register tx_scanner_decode_data_fun_register = NULL;
static ptx_scanner_comm_state_fun_register tx_scanner_comm_state_fun_register = NULL;
static ptx_scanner_decode_start tx_scanner_decode_start = NULL;
static ptx_scanner_decode_stop tx_scanner_decode_stop = NULL;
static ptx_scanner_set_trigger_mode tx_scanner_set_trigger_mode = NULL;
static ptx_scanner_get_trigger_mode tx_scanner_get_trigger_mode = NULL;
static ptx_scanner_get_version_info tx_scanner_get_version_info = NULL;
static ptx_scanner_get_all_product_info tx_scanner_get_all_product_info = NULL;

static FILE* g_logFile = NULL;

static int g_initialized = 0;
static int g_decoding = 0;
static int g_connected = -1; /* -1 unknown, 0 off, 1 on */

static void log_open(void) {
  if (g_logFile) return;
  const char* path = getenv("TX_SCANNER_LOG_FILE");
  if (path && path[0]) {
    g_logFile = fopen(path, "a");
  }
}

static void log_msg(const char* fmt, ...) {
  char buf[1024];
  va_list ap;
  va_start(ap, fmt);
  vsnprintf(buf, sizeof(buf), fmt, ap);
  va_end(ap);

  log_open();
  if (g_logFile) {
    SYSTEMTIME st;
    GetLocalTime(&st);
    fprintf(
        g_logFile, "%04u-%02u-%02u %02u:%02u:%02u %s\n", st.wYear, st.wMonth, st.wDay, st.wHour, st.wMinute,
        st.wSecond, buf);
    fflush(g_logFile);
  }
  fprintf(stderr, "[native-sidecar] %s\n", buf);
  fflush(stderr);
}

static void json_escape_string(const char* src, char* out, size_t outCap) {
  size_t j = 0;
  if (!src) {
    out[0] = '\0';
    return;
  }
  for (size_t i = 0; src[i] && j + 2 < outCap; i++) {
    char c = src[i];
    if (c == '\\' || c == '"') {
      out[j++] = '\\';
      out[j++] = c;
    } else if ((unsigned char)c < 32) {
      out[j++] = ' ';
    } else {
      out[j++] = c;
    }
  }
  out[j] = '\0';
}

static void emit_ready(int ok, const char* sdkVersion, const char* dllPath, const char* errorDetail) {
  char verEsc[128];
  char pathEsc[MAX_PATH * 2];
  char errEsc[256];
  json_escape_string(sdkVersion, verEsc, sizeof(verEsc));
  json_escape_string(dllPath, pathEsc, sizeof(pathEsc));
  json_escape_string(errorDetail, errEsc, sizeof(errEsc));
  if (ok) {
    printf("{\"type\":\"ready\",\"ok\":true,\"sdkVersion\":\"%s\",\"processArch\":\"ia32\",\"dllPath\":\"%s\",\"sidecarKind\":\"native\"}\n",
           verEsc, pathEsc);
  } else {
    printf("{\"type\":\"ready\",\"ok\":false,\"errorDetail\":\"%s\",\"processArch\":\"ia32\",\"dllPath\":\"%s\",\"sidecarKind\":\"native\"}\n",
           errEsc[0] ? errEsc : "load failed", pathEsc);
  }
  fflush(stdout);
}

static void json_escape_and_emit_decode(uint8 codeType, uint8* pBuf, uint32 uiBufLen) {
  char data[4096];
  size_t n = (size_t)uiBufLen;
  if (n >= sizeof(data)) n = sizeof(data) - 1;
  memcpy(data, pBuf, n);
  data[n] = '\0';
  for (size_t i = 0; i < n; i++) {
    if (data[i] == '\\' || data[i] == '"') data[i] = ' ';
    if ((unsigned char)data[i] < 32) data[i] = ' ';
  }
  printf("{\"type\":\"decode\",\"codeType\":%u,\"data\":\"%s\",\"length\":%u}\n", (unsigned)codeType, data, (unsigned)uiBufLen);
  fflush(stdout);
}

static int32 __cdecl on_decode_data(uint8 ucCodeType, uint8* pBuf, uint32 uiBufLen) {
  json_escape_and_emit_decode(ucCodeType, pBuf, uiBufLen);
  return SUCC;
}

static void __cdecl on_comm_state(uint8 ucState) {
  g_connected = (int)ucState;
  log_msg("comm_state callback state=%u connected=%s", (unsigned)ucState, ucState == 1 ? "true" : "false");
  printf("{\"type\":\"comm\",\"connected\":%s}\n", ucState == 1 ? "true" : "false");
  fflush(stdout);
}

static int read_sdk_version(char* out, size_t outLen) {
  uint8 buf[64];
  if (!tx_scanner_get_version) return 0;
  int32 len = tx_scanner_get_version(buf, (uint8)sizeof(buf));
  if (len <= 0) {
    out[0] = '\0';
    return 0;
  }
  if ((size_t)len >= outLen) len = (int32)outLen - 1;
  memcpy(out, buf, (size_t)len);
  out[len] = '\0';
  return 1;
}

static int bind_sdk_functions(void) {
  tx_scanner_init = (ptx_scanner_init)GetProcAddress(g_hLib, "tx_scanner_init");
  tx_scanner_deinit = (ptx_scanner_deinit)GetProcAddress(g_hLib, "tx_scanner_deinit");
  tx_scanner_get_version = (ptx_scanner_get_version)GetProcAddress(g_hLib, "tx_scanner_get_version");
  tx_scanner_decode_data_fun_register =
      (ptx_scanner_decode_data_fun_register)GetProcAddress(g_hLib, "tx_scanner_decode_data_fun_register");
  tx_scanner_comm_state_fun_register =
      (ptx_scanner_comm_state_fun_register)GetProcAddress(g_hLib, "tx_scanner_comm_state_fun_register");
  tx_scanner_decode_start = (ptx_scanner_decode_start)GetProcAddress(g_hLib, "tx_scanner_decode_start");
  tx_scanner_decode_stop = (ptx_scanner_decode_stop)GetProcAddress(g_hLib, "tx_scanner_decode_stop");
  tx_scanner_set_trigger_mode = (ptx_scanner_set_trigger_mode)GetProcAddress(g_hLib, "tx_scanner_set_trigger_mode");
  tx_scanner_get_trigger_mode = (ptx_scanner_get_trigger_mode)GetProcAddress(g_hLib, "tx_scanner_get_trigger_mode");
  tx_scanner_get_version_info = (ptx_scanner_get_version_info)GetProcAddress(g_hLib, "tx_scanner_get_version_info");
  tx_scanner_get_all_product_info =
      (ptx_scanner_get_all_product_info)GetProcAddress(g_hLib, "tx_scanner_get_all_product_info");
  return tx_scanner_init && tx_scanner_deinit && tx_scanner_decode_data_fun_register && tx_scanner_comm_state_fun_register &&
         tx_scanner_decode_start && tx_scanner_decode_stop;
}

static void probe_device_info(char* versionInfo, size_t versionCap, char* productInfo, size_t productCap, int32* versionRet,
                              int32* productRet) {
  versionInfo[0] = '\0';
  productInfo[0] = '\0';
  *versionRet = -1;
  *productRet = -1;

  if (tx_scanner_get_version_info) {
    uint8 infoBuf[256];
    *versionRet = tx_scanner_get_version_info(infoBuf, (uint16)sizeof(infoBuf));
    if (*versionRet >= SUCC) {
      size_t n = (size_t)*versionRet;
      if (n >= versionCap) n = versionCap - 1;
      memcpy(versionInfo, infoBuf, n);
      versionInfo[n] = '\0';
    }
  }

  if (tx_scanner_get_all_product_info) {
    uint8 prodBuf[256];
    *productRet = tx_scanner_get_all_product_info(prodBuf, (uint16)sizeof(prodBuf));
    if (*productRet >= SUCC) {
      size_t n = (size_t)*productRet;
      if (n >= productCap) n = productCap - 1;
      memcpy(productInfo, prodBuf, n);
      productInfo[n] = '\0';
    }
  }
}

static void set_cwd_to_exe_dir(void) {
  char path[MAX_PATH];
  if (GetModuleFileNameA(NULL, path, MAX_PATH) == 0) return;
  char* slash = strrchr(path, '\\');
  if (slash) *slash = '\0';
  SetCurrentDirectoryA(path);
  log_msg("set_cwd_to_exe_dir cwd=%s", path);
}

static int ensure_lib_loaded(char* dllPath, size_t dllPathCap) {
  if (g_hLib) return 1;

  const char* libDir = getenv("TX_SCANNER_DLL_DIR");
  if (!libDir || !libDir[0]) libDir = ".";

  set_cwd_to_exe_dir();
  SetDllDirectoryA(libDir);
  _snprintf_s(dllPath, dllPathCap, _TRUNCATE, "%s\\tx_windows_fdata.dll", libDir);
  log_msg("ensure_lib_loaded libDir=%s dllPath=%s", libDir, dllPath);

  g_hLib = LoadLibraryA("tx_windows_fdata.dll");
  if (!g_hLib) {
    DWORD err = GetLastError();
    log_msg("LoadLibrary(tx_windows_fdata.dll) failed winerr=%lu", (unsigned long)err);
    g_hLib = LoadLibraryA(dllPath);
  }
  if (!g_hLib) {
    log_msg("LoadLibrary(full path) failed winerr=%lu", (unsigned long)GetLastError());
    return 0;
  }
  log_msg("LoadLibrary ok handle=%p", (void*)g_hLib);
  return bind_sdk_functions();
}

static const char* find_json_string(const char* line, const char* key, char* out, size_t outCap) {
  char pattern[64];
  _snprintf_s(pattern, sizeof(pattern), _TRUNCATE, "\"%s\":\"", key);
  const char* p = strstr(line, pattern);
  if (!p) return NULL;
  p += strlen(pattern);
  size_t i = 0;
  while (*p && *p != '"' && i + 1 < outCap) {
    out[i++] = *p++;
  }
  out[i] = '\0';
  return out;
}

static int find_json_bool(const char* line, const char* key) {
  char pattern[64];
  _snprintf_s(pattern, sizeof(pattern), _TRUNCATE, "\"%s\":true", key);
  return strstr(line, pattern) != NULL;
}

static int ensure_sdk_initialized(void) {
  if (g_initialized) return 1;
  if (!g_hLib) return 0;

  int32 ret = tx_scanner_decode_data_fun_register(on_decode_data);
  log_msg("tx_scanner_decode_data_fun_register ret=%d", (int)ret);
  if (ret < SUCC) return 0;
  ret = tx_scanner_comm_state_fun_register(on_comm_state);
  log_msg("tx_scanner_comm_state_fun_register ret=%d", (int)ret);
  if (ret < SUCC) return 0;
  ret = tx_scanner_init();
  log_msg("tx_scanner_init ret=%d", (int)ret);
  if (ret < SUCC) return 0;
  g_initialized = 1;
  log_msg("tx_scanner_init done connected=%d", g_connected);
  return 1;
}

static void handle_diagnose(const char* requestId) {
  char ver[64] = "";
  char versionInfo[256];
  char productInfo[256];
  int32 versionRet;
  int32 productRet;
  char cwd[MAX_PATH] = "";

  GetCurrentDirectoryA((DWORD)sizeof(cwd), cwd);
  if (g_hLib) read_sdk_version(ver, sizeof(ver));
  if (g_connected == 1) {
    probe_device_info(versionInfo, sizeof(versionInfo), productInfo, sizeof(productInfo), &versionRet, &productRet);
  } else {
    versionRet = -1;
    productRet = -1;
  }
  log_msg("diagnose cwd=%s initialized=%d decoding=%d connected=%d versionRet=%d productRet=%d", cwd, g_initialized,
          g_decoding, g_connected, (int)versionRet, (int)productRet);

  char verEsc[128];
  char versionEsc[512];
  char productEsc[512];
  char cwdEsc[MAX_PATH * 2];
  json_escape_string(ver, verEsc, sizeof(verEsc));
  json_escape_string(versionInfo, versionEsc, sizeof(versionEsc));
  json_escape_string(productInfo, productEsc, sizeof(productEsc));
  json_escape_string(cwd, cwdEsc, sizeof(cwdEsc));

  printf(
      "{\"type\":\"result\",\"cmd\":\"diagnose\",\"requestId\":\"%s\",\"ok\":true,\"sdkLoaded\":%s,\"initialized\":%s,"
      "\"decoding\":%s,\"connected\":%s,\"sdkVersion\":\"%s\",\"versionInfoRet\":%d,\"versionInfo\":\"%s\","
      "\"productInfoRet\":%d,\"productInfo\":\"%s\",\"cwd\":\"%s\",\"sidecarKind\":\"native\"}\n",
      requestId, g_hLib ? "true" : "false", g_initialized ? "true" : "false", g_decoding ? "true" : "false",
      g_connected == 1 ? "true" : (g_connected == 0 ? "false" : "null"), verEsc, (int)versionRet, versionEsc,
      (int)productRet, productEsc, cwdEsc);
  fflush(stdout);
}

static int probe_device_ready(void) {
  if (g_connected == 1) return 1;
  if (!tx_scanner_get_version_info) return 0;

  uint8 buf[256];
  int32 ret = tx_scanner_get_version_info(buf, (uint16)sizeof(buf));
  log_msg("probe_device_ready get_version_info ret=%d", (int)ret);
  if (ret >= SUCC) {
    if (g_connected != 1) {
      g_connected = 1;
      printf("{\"type\":\"comm\",\"connected\":true}\n");
      fflush(stdout);
    }
    return 1;
  }
  return 0;
}

static void handle_start(const char* requestId, const char* line) {
  char ver[64] = "";

  log_msg("handle_start requestId=%s line=%s", requestId, line);

  if (!g_hLib) {
    log_msg("handle_start rejected: lib not loaded");
    printf("{\"type\":\"result\",\"cmd\":\"start\",\"requestId\":\"%s\",\"ok\":false,\"error\":\"SDK_NOT_LOADED\"}\n", requestId);
    fflush(stdout);
    return;
  }

  if (!g_initialized && !ensure_sdk_initialized()) {
    log_msg("handle_start rejected: init failed");
    printf("{\"type\":\"result\",\"cmd\":\"start\",\"requestId\":\"%s\",\"ok\":false,\"error\":\"SDK_NOT_LOADED\"}\n", requestId);
    fflush(stdout);
    return;
  }

  int applyTriggerMode = find_json_bool(line, "applyTriggerMode");
  int saveTriggerMode = find_json_bool(line, "saveTriggerMode") ? 1 : 0;
  int triggerMode = 3;
  const char* tm = strstr(line, "\"triggerMode\":");
  if (tm) triggerMode = atoi(tm + 14);

  if (!g_decoding) {
    int deviceReady = 0;
    for (int waitAttempt = 0; waitAttempt < 24; waitAttempt++) {
      if (probe_device_ready()) {
        deviceReady = 1;
        break;
      }
      Sleep(500);
    }

    if (!deviceReady) {
      log_msg("handle_start aborted: FData device not ready connected=%d", g_connected);
      printf("{\"type\":\"result\",\"cmd\":\"start\",\"requestId\":\"%s\",\"ok\":false,\"error\":\"DEVICE_NOT_CONNECTED\","
             "\"detail\":-1,\"connected\":%s,\"deviceProbeReason\":\"version_info_failed\"}\n",
             requestId, g_connected == 1 ? "true" : (g_connected == 0 ? "false" : "null"));
      fflush(stdout);
      return;
    }

    int32 startRet = tx_scanner_decode_start();
    log_msg("tx_scanner_decode_start ret=%d", (int)startRet);
    if (startRet < SUCC) {
      const char* err = (g_connected == 1) ? "DECODE_START_FAILED" : "DEVICE_NOT_CONNECTED";
      log_msg("handle_start failed error=%s detail=%d connected=%d", err, (int)startRet, g_connected);
      printf("{\"type\":\"result\",\"cmd\":\"start\",\"requestId\":\"%s\",\"ok\":false,\"error\":\"%s\",\"detail\":%d,\"connected\":%s}\n",
             requestId, err, (int)startRet, g_connected == 1 ? "true" : (g_connected == 0 ? "false" : "null"));
      fflush(stdout);
      return;
    }
    g_decoding = 1;
  }

  const char* triggerWarning = NULL;
  int triggerApplied = 0;
  if (applyTriggerMode && tx_scanner_set_trigger_mode) {
    int32 modeRet = tx_scanner_set_trigger_mode((uint8)triggerMode, (uint8)saveTriggerMode);
    if (modeRet < SUCC) triggerWarning = "SET_TRIGGER_MODE_FAILED";
    else triggerApplied = 1;
  }

  read_sdk_version(ver, sizeof(ver));
  if (triggerWarning) {
    printf("{\"type\":\"result\",\"cmd\":\"start\",\"requestId\":\"%s\",\"ok\":true,\"initialized\":true,\"decoding\":true,"
           "\"triggerModeApplied\":%s,\"triggerModeWarning\":{\"error\":\"%s\"},\"sdkVersion\":\"%s\",\"sidecarKind\":\"native\"}\n",
           requestId, triggerApplied ? "true" : "false", triggerWarning, ver);
  } else {
    printf("{\"type\":\"result\",\"cmd\":\"start\",\"requestId\":\"%s\",\"ok\":true,\"initialized\":true,\"decoding\":true,"
           "\"triggerModeApplied\":%s,\"sdkVersion\":\"%s\",\"sidecarKind\":\"native\"}\n",
           requestId, triggerApplied ? "true" : "false", ver);
  }
  fflush(stdout);
}

static void handle_stop(const char* requestId) {
  if (!g_hLib || !g_initialized) {
    printf("{\"type\":\"result\",\"cmd\":\"stop\",\"requestId\":\"%s\",\"ok\":true,\"decoding\":false,\"skipped\":true}\n", requestId);
    fflush(stdout);
    return;
  }
  if (g_decoding) {
    int32 ret = tx_scanner_decode_stop();
    if (ret < SUCC) {
      printf("{\"type\":\"result\",\"cmd\":\"stop\",\"requestId\":\"%s\",\"ok\":false,\"error\":\"DECODE_STOP_FAILED\",\"detail\":%d}\n",
             requestId, (int)ret);
      fflush(stdout);
      return;
    }
    g_decoding = 0;
  }
  printf("{\"type\":\"result\",\"cmd\":\"stop\",\"requestId\":\"%s\",\"ok\":true,\"decoding\":false}\n", requestId);
  fflush(stdout);
}

static void handle_deinit(const char* requestId) {
  if (g_hLib && g_initialized && g_decoding) {
    tx_scanner_decode_stop();
    g_decoding = 0;
  }
  if (!g_hLib || !g_initialized) {
    printf("{\"type\":\"result\",\"cmd\":\"deinit\",\"requestId\":\"%s\",\"ok\":true,\"skipped\":true}\n", requestId);
    fflush(stdout);
    return;
  }
  int32 ret = tx_scanner_deinit();
  g_initialized = 0;
  g_decoding = 0;
  g_connected = -1;
  printf("{\"type\":\"result\",\"cmd\":\"deinit\",\"requestId\":\"%s\",\"ok\":%s,\"detail\":%d}\n",
         requestId, ret >= SUCC ? "true" : "false", (int)ret);
  fflush(stdout);
}

static void handle_status(const char* requestId) {
  char ver[64] = "";
  if (g_hLib) read_sdk_version(ver, sizeof(ver));
  const char* conn = g_connected == 1 ? "true" : (g_connected == 0 ? "false" : "null");
  printf("{\"type\":\"result\",\"cmd\":\"status\",\"requestId\":\"%s\",\"ok\":%s,\"sdkLoaded\":%s,\"initialized\":%s,\"decoding\":%s,"
         "\"connected\":%s,\"sdkVersion\":\"%s\",\"processArch\":\"ia32\",\"sidecarKind\":\"native\"}\n",
         requestId, g_hLib ? "true" : "false", g_hLib ? "true" : "false", g_initialized ? "true" : "false",
         g_decoding ? "true" : "false", conn, ver);
  fflush(stdout);
}

static int read_stdin_line(char* buf, size_t cap) {
  HANDLE hIn = GetStdHandle(STD_INPUT_HANDLE);
  if (!buf || cap < 2 || hIn == INVALID_HANDLE_VALUE) return 0;

  size_t i = 0;
  while (i + 1 < cap) {
    char ch = 0;
    DWORD nRead = 0;
    if (!ReadFile(hIn, &ch, 1, &nRead, NULL) || nRead == 0) {
      buf[i] = '\0';
      return i > 0 ? 1 : 0;
    }
    if (ch == '\n') break;
    if (ch != '\r') buf[i++] = ch;
  }
  buf[i] = '\0';
  return 1;
}

int main(void) {
  char dllPath[MAX_PATH] = "";
  char ver[64] = "";
  char line[4096];
  char cmd[32] = "";
  char requestId[128] = "";

  /* 管道 stdin 必须无缓冲，否则 fgets 会等满 4KB 才返回（Electron spawn 下命令永不触发） */
  setvbuf(stdin, NULL, _IONBF, 0);
  setvbuf(stdout, NULL, _IONBF, 0);
  setvbuf(stderr, NULL, _IONBF, 0);

  int loaded = ensure_lib_loaded(dllPath, sizeof(dllPath));
  log_msg("boot loaded=%d logFile=%s", loaded, getenv("TX_SCANNER_LOG_FILE") ? getenv("TX_SCANNER_LOG_FILE") : "(none)");
  if (loaded) read_sdk_version(ver, sizeof(ver));
  emit_ready(loaded, ver, dllPath, loaded ? NULL : "LoadLibrary failed");

  while (read_stdin_line(line, sizeof(line))) {
    cmd[0] = '\0';
    requestId[0] = '\0';
    find_json_string(line, "cmd", cmd, sizeof(cmd));
    find_json_string(line, "requestId", requestId, sizeof(requestId));
    if (!cmd[0]) continue;

    if (strcmp(cmd, "start") == 0) handle_start(requestId, line);
    else if (strcmp(cmd, "stop") == 0) handle_stop(requestId);
    else if (strcmp(cmd, "deinit") == 0) handle_deinit(requestId);
    else if (strcmp(cmd, "status") == 0) handle_status(requestId);
    else if (strcmp(cmd, "diagnose") == 0) handle_diagnose(requestId);
    else if (strcmp(cmd, "ping") == 0)
      printf("{\"type\":\"result\",\"cmd\":\"ping\",\"requestId\":\"%s\",\"ok\":true,\"processArch\":\"ia32\",\"sidecarKind\":\"native\"}\n",
             requestId);
    else
      printf("{\"type\":\"result\",\"cmd\":\"%s\",\"requestId\":\"%s\",\"ok\":false,\"error\":\"UNKNOWN_CMD\"}\n", cmd, requestId);
    fflush(stdout);
  }
  return 0;
}
