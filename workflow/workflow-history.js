const path = require("path");
const safeStorage = require("../storage/safe-storage");

const ROOT = path.resolve(__dirname, "..");
const HISTORY_FILE = path.join(ROOT, "data", "workflow-history.json");
const DEFAULT_HISTORY = { version: 1, executions: [] };

function ensureFile() {
  return safeStorage.ensureJsonFile(HISTORY_FILE, DEFAULT_HISTORY);
}

function readHistory() {
  return safeStorage.readJson(HISTORY_FILE, DEFAULT_HISTORY);
}

function writeHistory(data) {
  return safeStorage.writeJson(HISTORY_FILE, { ...data, updatedAt: new Date().toISOString() });
}

function record(execution) {
  const data = readHistory();
  data.executions = Array.isArray(data.executions) ? data.executions : [];
  data.executions.unshift(execution);
  data.executions = data.executions.slice(0, 250);
  const written = writeHistory(data);
  return { ok: true, data: execution, warnings: written.warnings || [] };
}

function history(limit = 20) {
  const data = readHistory();
  return { ok: true, data: (data.executions || []).slice(0, limit), warnings: [] };
}

module.exports = {
  HISTORY_FILE,
  history,
  record
};
