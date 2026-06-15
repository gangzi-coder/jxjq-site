const http = require("http");
const fs = require("fs/promises");
const path = require("path");

const PORT = 3000;
const PASSWORD = process.env.ADMIN_PASSWORD || "jxjq456";
const ROOT = __dirname;
const DATA_FILE = path.join(ROOT, "data.json");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

const server = http.createServer(async (req, res) => {
  try {
    if (req.url === "/api/login" && req.method === "POST") {
      const body = await readBody(req);
      const payload = JSON.parse(body);

      if (payload.password !== PASSWORD) {
        sendJson(res, 403, { message: "密码错误" });
        return;
      }

      sendJson(res, 200, { ok: true });
      return;
    }

    if (req.url === "/api/data" && req.method === "GET") {
      const json = await fs.readFile(DATA_FILE, "utf8");
      send(res, 200, json, "application/json; charset=utf-8");
      return;
    }

    if (req.url === "/api/data" && req.method === "POST") {
      const body = await readBody(req);
      const payload = JSON.parse(body);

      if (payload.password !== PASSWORD) {
        sendJson(res, 403, { message: "密码错误" });
        return;
      }

      const data = normalizeData(payload.data);
      await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2) + "\n", "utf8");
      sendJson(res, 200, { ok: true });
      return;
    }

    if (req.method !== "GET") {
      send(res, 405, "Method Not Allowed", "text/plain; charset=utf-8");
      return;
    }

    await serveStatic(req, res);
  } catch (error) {
    sendJson(res, 500, { message: "服务器错误" });
  }
});

server.listen(PORT, () => {
  console.log(`惊喜进球已启动: http://localhost:${PORT}`);
  console.log(`数据维护: http://localhost:${PORT}/admin.html`);
});

async function serveStatic(req, res) {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = decodeURIComponent(url.pathname);
  const relative = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const filePath = path.resolve(ROOT, relative);

  if (!filePath.startsWith(ROOT + path.sep)) {
    send(res, 403, "Forbidden", "text/plain; charset=utf-8");
    return;
  }

  try {
    const content = await fs.readFile(filePath);
    const type = MIME[path.extname(filePath)] || "application/octet-stream";
    send(res, 200, content, type);
  } catch (error) {
    send(res, 404, "Not Found", "text/plain; charset=utf-8");
  }
}

function normalizeData(value) {
  if (!value || typeof value !== "object") {
    throw new Error("Invalid data");
  }

  return {
    title: String(value.title || "惊喜进球"),
    rows: Array.isArray(value.rows)
      ? value.rows.map(row => ({
          date: String(row.date || ""),
          plan: String(row.plan || ""),
          selfBuy: String(row.selfBuy || ""),
          bonus: String(row.bonus || ""),
          result: String(row.result || "")
        }))
      : []
  };
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        req.destroy();
        reject(new Error("Body too large"));
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function sendJson(res, status, data) {
  send(res, status, JSON.stringify(data), "application/json; charset=utf-8");
}

function send(res, status, body, contentType) {
  res.writeHead(status, {
    "Content-Type": contentType,
    "Cache-Control": "no-store"
  });
  res.end(body);
}
