const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const HISTORY_FILE = path.join(ROOT, "data", "recommendation-history.json");

function ensureFile() {
  fs.mkdirSync(path.dirname(HISTORY_FILE), { recursive: true });
  if (!fs.existsSync(HISTORY_FILE)) {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify({ version: 1, recommendations: [], outcomes: [] }, null, 2) + "\n", "utf8");
  }
}

function readHistory() {
  ensureFile();
  try {
    return JSON.parse(fs.readFileSync(HISTORY_FILE, "utf8").replace(/^\uFEFF/, ""));
  } catch (_) {
    return { version: 1, recommendations: [], outcomes: [] };
  }
}

function writeHistory(data) {
  ensureFile();
  fs.writeFileSync(HISTORY_FILE, JSON.stringify({ ...data, updatedAt: new Date().toISOString() }, null, 2) + "\n", "utf8");
}

function recordRecommendation(recommendation) {
  const data = readHistory();
  data.recommendations = Array.isArray(data.recommendations) ? data.recommendations : [];
  data.recommendations.unshift(recommendation);
  data.recommendations = data.recommendations.slice(0, 200);
  writeHistory(data);
  return { ok: true, data: recommendation };
}

function recordMany(recommendations = []) {
  recommendations.forEach(recordRecommendation);
  return { ok: true, data: recommendations };
}

function history(limit = 20) {
  const data = readHistory();
  return { ok: true, data: (data.recommendations || []).slice(0, limit) };
}

function trackOutcome(recommendationId, outcome = {}) {
  const data = readHistory();
  data.outcomes = Array.isArray(data.outcomes) ? data.outcomes : [];
  data.outcomes.unshift({
    recommendationId,
    ...outcome,
    recordedAt: new Date().toISOString()
  });
  data.outcomes = data.outcomes.slice(0, 200);
  writeHistory(data);
  return { ok: true };
}

module.exports = {
  HISTORY_FILE,
  history,
  recordMany,
  recordRecommendation,
  trackOutcome
};
