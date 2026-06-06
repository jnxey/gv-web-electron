# 本地 HTTPS 开发证书

开发环境使用 `localhost` 自签名证书，由脚本生成，**勿提交** `*.pem` 到 Git。

## 生成证书

```sh
npm run cert:generate
```

会在本目录生成：

- `localhost.pem` — 证书
- `localhost-key.pem` — 私钥

## 启动 HTTPS 开发服务

```sh
npm run dev
```

访问 `https://localhost:5173`（端口以终端为准）。首次自签名证书浏览器会提示不安全，可点「继续访问」；若需系统信任，请在本机安装 [mkcert](https://github.com/FiloSottile/mkcert) 后执行：

```sh
mkcert -install
mkcert -key-file certs/localhost-key.pem -cert-file certs/localhost.pem localhost 127.0.0.1 ::1
```

未生成 `certs/*.pem` 时，Vite 会回退使用 `@vitejs/plugin-basic-ssl` 临时证书。
