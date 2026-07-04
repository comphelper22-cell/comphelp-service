const registry = require("./recommendation-registry");
const { buildRecommendation } = require("./recommendation-builder");
const { validateMany, validateRecommendation } = require("./recommendation-validator");
const historyStore = require("./recommendation-history");
const { scoreRecommendation } = require("./recommendation-score");
const { prioritize } = require("./recommendation-priority");
const { explainRecommendation } = require("./recommendation-explainer");
const rules = require("./recommendation-rules");

function status() {
  return {
    ok: true,
    status: "ready",
    engine: "Recommendation Intelligence Engine",
    registry: registry.status(),
    history: historyStore.history(1).ok ? "available" : "unavailable",
    externalAiConnected: false,
    autoExecutionEnabled: false
  };
}

function generate(input = {}) {
  const selected = rules.selectTemplates(registry, input);
  const recommendations = prioritize(selected.map((template) => buildRecommendation(template, input)));
  const validation = validateMany(recommendations);
  if (input.record !== false) historyStore.recordMany(recommendations);
  return {
    ok: validation.ok,
    data: {
      recommendations,
      validation,
      topRecommendation: recommendations[0] || null,
      today: recommendations.filter((item) => ["HIGH", "CRITICAL"].includes(item.priority)).slice(0, 5),
      revenueOpportunities: recommendations.filter((item) => Number(item.estimatedRevenue || 0) > 0),
      operationalImprovements: recommendations.filter((item) => item.category === "Operations"),
      salesOpportunities: recommendations.filter((item) => item.category === "Sales"),
      customerAttention: recommendations.filter((item) => item.category === "Customer"),
      aiPriorityQueue: recommendations.slice(0, 10),
      generatedBy: "CompHelp Recommendation Intelligence Engine",
      generatedAt: new Date().toISOString()
    }
  };
}

function history(limit = 20) {
  return historyStore.history(limit);
}

function score(input = {}) {
  return { ok: true, data: scoreRecommendation(input.recommendation || input) };
}

function priority(input = {}) {
  const generated = generate({ ...input, record: false });
  return {
    ok: generated.ok,
    data: {
      aiPriorityQueue: generated.data.aiPriorityQueue,
      topRecommendation: generated.data.topRecommendation
    }
  };
}

function explain(input = {}) {
  if (input.recommendation) return explainRecommendation(input);
  const generated = generate({ ...input, record: false });
  return explainRecommendation({ recommendation: generated.data.topRecommendation || {} });
}

function validate(input = {}) {
  return { ok: true, data: validateRecommendation(input.recommendation || input) };
}

module.exports = {
  explain,
  generate,
  history,
  priority,
  registry,
  score,
  status,
  validate
};
