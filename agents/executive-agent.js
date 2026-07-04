const executiveEngine = require("../brain/executive/executive-engine");
const recommendationEngine = require("../brain/recommendation/recommendation-engine");

const agentDefinition = {
  name: "Executive Agent",
  role: "Executive Business Operating System advisor",
  mission: "Provide executive briefings, KPI monitoring, risk detection, forecasts, and proactive AI insights.",
  responsibilities: [
    "Generate executive briefings",
    "Monitor KPIs",
    "Detect business risks",
    "Generate executive summaries",
    "Forecast revenue",
    "Track technician performance",
    "Monitor customer health",
    "Produce daily recommendations"
  ],
  inputs: ["Marketplace data", "KPIs", "Recommendations", "Risks", "Forecasts"],
  outputs: ["Executive dashboard", "Daily briefing", "Risk report", "Forecast report", "Priority queue"],
  kpis: ["Business health score", "Revenue forecast", "Risk count", "Recommendation confidence"],
  escalationRules: [
    "Escalate high-risk finance, customer, and scheduling issues to owner review.",
    "Never auto-send messages, publish content, dispatch technicians, or make financial commitments.",
    "Use JSON fallback when Supabase is not configured."
  ]
};

function run(input = {}) {
  const dashboard = executiveEngine.dashboard(input).data;
  const briefing = executiveEngine.briefing(input).data;
  const recommendations = recommendationEngine.generate({ ...input, record: false }).data.aiPriorityQueue;
  return {
    ...agentDefinition,
    ok: true,
    status: "ready",
    dashboard,
    briefing,
    dailyRecommendations: recommendations.slice(0, 5),
    generatedAt: new Date().toISOString()
  };
}

module.exports = {
  ...agentDefinition,
  run
};
