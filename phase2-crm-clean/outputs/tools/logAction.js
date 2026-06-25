const fs = require("fs");
const path = require("path");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const LOG_DIR = path.join(PROJECT_ROOT, "logs");
const LOG_FILE = path.join(LOG_DIR, "actions.jsonl");

function clean(value, max = 2000) {
  return String(value || "").trim().slice(0, max);
}

function redact(value) {
  if (!value || typeof value !== "object") return value;
  const copy = Array.isArray(value) ? [] : {};
  for (const [key, item] of Object.entries(value)) {
    if (/token|secret|password|api[_-]?key|authorization/i.test(key)) {
      copy[key] = "[redacted]";
    } else if (item && typeof item === "object") {
      copy[key] = redact(item);
    } else {
      copy[key] = item;
    }
  }
  return copy;
}

function logAction(action, payload = {}) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
  const entry = {
    timestamp: new Date().toISOString(),
    action: clean(action, 120),
    payload: redact(payload)
  };
  fs.appendFileSync(LOG_FILE, `${JSON.stringify(entry)}\n`, "utf8");
  return entry;
}

module.exports = {
  logAction,
  LOG_FILE
};
