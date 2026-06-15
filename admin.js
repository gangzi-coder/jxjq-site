let data = {
  title: "惊喜进球",
  rows: []
};
let loginPassword = "";

const loginBox = document.getElementById("loginBox");
const editBox = document.getElementById("editBox");
const loginMsg = document.getElementById("loginMsg");
const passwordInput = document.getElementById("password");
const titleInput = document.getElementById("titleInput");
const editRows = document.getElementById("editRows");
const saveMsg = document.getElementById("saveMsg");

document.getElementById("loginBtn").addEventListener("click", login);
passwordInput.addEventListener("keydown", event => {
  if (event.key === "Enter") login();
});
document.getElementById("addBtn").addEventListener("click", addRow);
document.getElementById("clearBtn").addEventListener("click", clearRows);
document.getElementById("saveBtn").addEventListener("click", saveData);

async function login() {
  loginMsg.textContent = "";
  loginPassword = passwordInput.value;

  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: loginPassword })
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "密码错误");
  } catch (error) {
    loginMsg.textContent = error.message || "密码错误";
    return;
  }

  await loadData();
  loginBox.classList.add("hidden");
  editBox.classList.remove("hidden");
  renderForm();
}

async function loadData() {
  try {
    const response = await fetch("/api/data", { cache: "no-store" });
    if (response.ok) {
      data = await response.json();
      return;
    }
  } catch (error) {
    // Fall back below for direct file/static use.
  }

  try {
    const response = await fetch("data.json", { cache: "no-store" });
    if (response.ok) data = await response.json();
  } catch (error) {
    const cached = localStorage.getItem("jxjq-data");
    if (cached) {
      data = JSON.parse(cached);
    } else {
      data = { title: "惊喜进球", rows: [] };
    }
  }
}

function renderForm() {
  titleInput.value = data.title || "";
  editRows.innerHTML = "";

  (data.rows || []).forEach((row, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input value="${escapeAttr(row.date)}" data-field="date" data-index="${index}"></td>
      <td><input value="${escapeAttr(row.plan)}" data-field="plan" data-index="${index}"></td>
      <td><input value="${escapeAttr(row.selfBuy)}" data-field="selfBuy" data-index="${index}"></td>
      <td><input value="${escapeAttr(row.bonus)}" data-field="bonus" data-index="${index}"></td>
      <td><input value="${escapeAttr(row.result)}" data-field="result" data-index="${index}"></td>
      <td><button type="button" data-delete="${index}">删除</button></td>
    `;
    editRows.appendChild(tr);
  });

  editRows.querySelectorAll("input").forEach(input => {
    input.addEventListener("input", event => {
      const index = Number(event.target.dataset.index);
      const field = event.target.dataset.field;
      data.rows[index][field] = event.target.value;
    });
  });

  editRows.querySelectorAll("button").forEach(button => {
    button.addEventListener("click", event => {
      const index = Number(event.target.dataset.delete);
      data.rows.splice(index, 1);
      renderForm();
    });
  });
}

function addRow() {
  data.rows = data.rows || [];
  data.rows.unshift({
    date: "",
    plan: "",
    selfBuy: "",
    bonus: "",
    result: ""
  });
  renderForm();
}

function clearRows() {
  const rows = data.rows || [];
  if (!rows.length) {
    saveMsg.textContent = "当前没有可清空的数据。";
    return;
  }

  if (!confirm("确定要清空全部数据吗？清空后需要点击保存才会生效。")) {
    return;
  }

  data.rows = [];
  saveMsg.textContent = "已清空当前列表，点击保存后生效。";
  renderForm();
}

async function saveData() {
  data.title = titleInput.value.trim() || "惊喜进球";
  localStorage.setItem("jxjq-data", JSON.stringify(data));

  try {
    const response = await fetch("/api/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: loginPassword, data })
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "保存失败");

    saveMsg.textContent = "已保存到 data.json。";
    localStorage.removeItem("jxjq-data");
    return;
  } catch (error) {
    saveMsg.textContent = "保存失败，请确认服务已启动，或 Cloudflare KV 绑定已配置。";
  }
}

function escapeAttr(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
