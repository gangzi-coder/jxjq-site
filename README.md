# 惊喜进球

一个简单的静态页面 + 管理页。数据本地开发时写入 `data.json`，部署到 Cloudflare Pages 后写入 KV。

## 本地运行

```bash
node server.js
```

打开：

```text
http://localhost:3000/
http://localhost:3000/admin.html
```

默认维护密码：

```text
jxjq456
```

也可以用环境变量覆盖：

```bash
ADMIN_PASSWORD=你的密码 node server.js
```

## Cloudflare Pages 部署

1. 把代码推到 GitHub 仓库。
2. Cloudflare Dashboard 里创建 Pages 项目并连接该仓库。
3. 构建设置选择 `None`，无需构建命令。
4. 创建 KV namespace，例如 `JXJQ_DATA`。
5. 在 Pages 项目 Settings -> Bindings 添加 KV 绑定：

```text
Variable name: JXJQ
KV namespace: JXJQ_DATA
```

6. 在 Pages 项目 Settings -> Environment variables 添加：

```text
ADMIN_PASSWORD = jxjq456
```

7. 重新部署。

部署后访问：

```text
https://你的项目.pages.dev/
https://你的项目.pages.dev/admin.html
```
