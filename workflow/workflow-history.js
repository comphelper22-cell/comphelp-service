const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const HISTORY_FILE = path.join(ROOT, "data", "workflow-history.json");

function ensureFile() {
  fs.mkdirSync(path.dirname(HISTORY_FILE), { recursive: true });
  if (!fs.existsSync(HISTORY_FILE)) {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify({ version: 1, executions: [] }, null, 2) + "\n", "utf8");
  }
}

function readHistory() {
  ensureFile();
  try {
    return JSON.parse(fs.readFileSync(HISTORY_FILE, "utf8").replace(/^\uFEFF/, ""));
  } catch (_) {
    return { version: 1, executions: [] };
  }
}

function writeHistory(data) {
  ensureFile();
  fs.writeFileSync(HISTORY_FILE, JSON.stringify({ ...data, updatedAt: new Date().toISOString() }, null, 2) + "\n", "utf8");
}

function record(execution) {
  const data = readHistory();
  data.executions = Array.isArray(data.executions) ? data.executions : [];
  data.executions.unshift(execution);
  data.executions = data.executions.slice(0, 250);
  writeHistory(data);
  return { ok: true, data: execution };
}

function history(limit = 20) {
  const data = readHistory();
  return { ok: true, data: (data.executions || []).slice(0, limit) };
}

module.exports = {
  HISTORY_FILE,
  history,
  record
};
