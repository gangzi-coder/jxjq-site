const DATA_KEY = "site-data";

const defaultData = {
  title: "惊喜进球",
  rows: []
};

export async function onRequestGet(context) {
  if (!context.env.JXJQ) {
    return Response.json({ message: "KV 绑定 JXJQ 未配置" }, { status: 500 });
  }

  const data = await context.env.JXJQ.get(DATA_KEY, "json");
  return Response.json(data || defaultData);
}

export async function onRequestPost(context) {
  try {
    if (!context.env.JXJQ) {
      return Response.json({ message: "KV 绑定 JXJQ 未配置" }, { status: 500 });
    }

    const payload = await context.request.json();
    const password = context.env.ADMIN_PASSWORD || "jxjq456";

    if (payload.password !== password) {
      return Response.json({ message: "密码错误" }, { status: 403 });
    }

    const data = normalizeData(payload.data);
    await context.env.JXJQ.put(DATA_KEY, JSON.stringify(data));

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ message: "保存失败" }, { status: 500 });
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
