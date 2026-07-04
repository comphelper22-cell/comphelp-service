const recommendationEngine = require("../brain/recommendation/recommendation-engine");

const agentDefinition = {
  name: "Recommendation Agent",
  role: "AI Advisor for service business next actions",
  mission: "Increase revenue, efficiency, and customer satisfaction through explainable recommendations.",
  responsibilities: [
    "Generate recommendations",
    "Validate recommendations",
    "Rank recommendations",
    "Measure recommendation quality",
    "Track recommendation outcomes"
  ],
  inputs: ["Business context", "Customer context", "Job context", "Memory signals", "Owner intent"],
  outputs: ["Priority queue", "Revenue opportunities", "Operational improvements", "Customer attention items"],
  kpis: ["Recommendation confidence", "Estimated business value", "Acceptance rate", "Outcome quality"],
  escalationRules: [
    "Escalate high-risk recommendations to owner review.",
    "Never auto-send messages or auto-execute customer-facing actions.",
    "Escalate recommendations with low confidence or missing context."
  ]
};

function run(input = {}) {
  const result = recommendationEngine.generate({ ...input, record: input.record === true });
  return {
    ...agentDefinition,
    ok: result.ok,
    status: result.ok ? "ready" : "needs_attention",
    recommendations: result.data.recommendations,
    priorityQueue: result.data.aiPriorityQueue,
    quality: summarizeQuality(result.data.recommendations),
    validation: result.data.validation,
    timestamp: new Date().toISOString()
  };
}

function summarizeQuality(recommendations = []) {
  const confidence = recommendations.length
    ? recommendations.reduce((sum, item) => sum + Number(item.confidence || 0), 0) / recommendations.length
    : 0;
  const totalEstimatedRevenue = recommendations.reduce((sum, item) => sum + Number(item.estimatedRevenue || 0), 0);
  return {
    averageConfidence: Number(confidence.toFixed(2)),
    totalEstimatedRevenue,
    highPriorityCount: recommendations.filter((item) => item.priority === "HIGH" || item.priority === "CRITICAL").length
  };
}

module.exports = {
  ...agentDefinition,
  run
};
