const path = require("path");
const safeStorage = require("../../storage/safe-storage");

const ROOT = path.resolve(__dirname, "..", "..");
const HISTORY_FILE = path.join(ROOT, "data", "decision-history.json");
const DEFAULT_HISTORY = { version: 1, decisions: [] };

function ensureFile() {
  return safeStorage.ensureJsonFile(HISTORY_FILE, DEFAULT_HISTORY);
}

function readHistory() {
  return safeStorage.readJson(HISTORY_FILE, DEFAULT_HISTORY);
}

function writeHistory(data) {
  return safeStorage.writeJson(HISTORY_FILE, { ...data, updatedAt: new Date().toISOString() });
}

function recordDecision(decision) {
  const data = readHistory();
  data.decisions = Array.isArray(data.decisions) ? data.decisions : [];
  data.decisions.unshift(decision);
  data.decisions = data.decisions.slice(0, 100);
  const written = writeHistory(data);
  return { ok: true, data: decision, warnings: written.warnings || [] };
}

function history(limit = 20) {
  const data = readHistory();
  return { ok: true, data: (data.decisions || []).slice(0, limit), warnings: [] };
}

module.exports = { HISTORY_FILE, history, recordDecision };
