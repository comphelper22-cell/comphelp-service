const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const HISTORY_FILE = path.join(ROOT, "data", "decision-history.json");

function ensureFile() {
  fs.mkdirSync(path.dirname(HISTORY_FILE), { recursive: true });
  if (!fs.existsSync(HISTORY_FILE)) {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify({ version: 1, decisions: [] }, null, 2) + "\n", "utf8");
  }
}

function readHistory() {
  ensureFile();
  try {
    return JSON.parse(fs.readFileSync(HISTORY_FILE, "utf8").replace(/^\uFEFF/, ""));
  } catch (_) {
    return { version: 1, decisions: [] };
  }
}

function writeHistory(data) {
  ensureFile();
  fs.writeFileSync(HISTORY_FILE, JSON.stringify({ ...data, updatedAt: new Date().toISOString() }, null, 2) + "\n", "utf8");
}

function recordDecision(decision) {
  const data = readHistory();
  data.decisions = Array.isArray(data.decisions) ? data.decisions : [];
  data.decisions.unshift(decision);
  data.decisions = data.decisions.slice(0, 100);
  writeHistory(data);
  return { ok: true, data: decision };
}

function history(limit = 20) {
  const data = readHistory();
  return { ok: true, data: (data.decisions || []).slice(0, limit) };
}

module.exports = { HISTORY_FILE, history, recordDecision };
