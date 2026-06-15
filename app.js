const fallbackData = {
  title: "惊喜进球",
  rows: []
};

async function loadData() {
  try {
    const response = await fetch("/api/data", { cache: "no-store" });
    if (!response.ok) throw new Error("api load failed");
    return await response.json();
  } catch (error) {
    return loadJsonFile();
  }
}

async function loadJsonFile() {
  try {
    const response = await fetch("data.json", { cache: "no-store" });
    if (!response.ok) throw new Error("data.json load failed");
    return await response.json();
  } catch (error) {
    const cached = localStorage.getItem("jxjq-data");
    if (cached) return JSON.parse(cached);
    return fallbackData;
  }
}

function render(data) {
  document.title = data.title || "惊喜进球";
  document.getElementById("pageTitle").textContent = data.title || "惊喜进球";

  const rows = Array.isArray(data.rows) ? data.rows : [];
  const tbody = document.getElementById("rows");

  if (!rows.length) {
    tbody.innerHTML = '<tr><td colspan="5">暂无数据</td></tr>';
    return;
  }

  tbody.innerHTML = rows.map(row => `
    <tr>
      <td>${escapeHtml(row.date)}</td>
      <td>${escapeHtml(row.plan)}</td>
      <td>${escapeHtml(row.selfBuy)}</td>
      <td>${escapeHtml(row.bonus)}</td>
      <td><span class="result ${resultClass(row.result)}">${escapeHtml(row.result)}</span></td>
    </tr>
  `).join("");
}

function resultClass(value) {
  const text = String(value || "");
  if (text.includes("中") || text.includes("红") || text.includes("赢")) return "is-win";
  if (text.includes("黑") || text.includes("未中") || text.includes("输")) return "is-lose";
  return "is-pending";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

loadData().then(render);
