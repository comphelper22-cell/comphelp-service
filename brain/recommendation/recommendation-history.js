const path = require("path");
const safeStorage = require("../../storage/safe-storage");

const ROOT = path.resolve(__dirname, "..", "..");
const HISTORY_FILE = path.join(ROOT, "data", "recommendation-history.json");
const DEFAULT_HISTORY = { version: 1, recommendations: [], outcomes: [] };

function ensureFile() {
  return safeStorage.ensureJsonFile(HISTORY_FILE, DEFAULT_HISTORY);
}

function readHistory() {
  return safeStorage.readJson(HISTORY_FILE, DEFAULT_HISTORY);
}

function writeHistory(data) {
  return safeStorage.writeJson(HISTORY_FILE, { ...data, updatedAt: new Date().toISOString() });
}

function recordRecommendation(recommendation) {
  const data = readHistory();
  data.recommendations = Array.isArray(data.recommendations) ? data.recommendations : [];
  data.recommendations.unshift(recommendation);
  data.recommendations = data.recommendations.slice(0, 200);
  const written = writeHistory(data);
  return { ok: true, data: recommendation, warnings: written.warnings || [] };
}

function recordMany(recommendations = []) {
  recommendations.forEach(recordRecommendation);
  return { ok: true, data: recommendations };
}

function history(limit = 20) {
  const data = readHistory();
  return { ok: true, data: (data.recommendations || []).slice(0, limit), warnings: [] };
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
  const written = writeHistory(data);
  return { ok: true, warnings: written.warnings || [] };
}

module.exports = {
  HISTORY_FILE,
  history,
  recordMany,
  recordRecommendation,
  trackOutcome
};
