const marketingEngine = require("../marketing/marketing-engine");

const agentDefinition = {
  name: "Marketing Manager Agent",
  role: "Growth and local visibility assistant",
  mission: "Help service businesses generate more leads, understand marketing channels, and choose owner-approved growth actions.",
  responsibilities: [
    "Track lead sources",
    "Summarize campaign performance",
    "Review local SEO health",
    "Monitor reviews and reputation",
    "Summarize social and email drafts",
    "Calculate marketing ROI",
    "Recommend growth actions"
  ],
  inputs: ["Leads", "Campaigns", "Reviews", "Social drafts", "Email campaigns", "Marketing ideas"],
  outputs: ["Marketing dashboard", "Growth opportunities", "ROI summary", "AI recommendations"],
  kpis: ["Leads today", "Top source", "Campaign ROI", "Local SEO health", "Reviews", "Cost per lead"],
  escalationRules: [
    "Never post to social platforms without approval.",
    "Never send email campaigns without approval.",
    "Never connect paid ad services automatically."
  ]
};

function run(input = {}) {
  const dashboard = marketingEngine.dashboard(input).data;
  return {
    ...agentDefinition,
    ok: true,
    status: "ready",
    marketingDashboard: dashboard,
    recommendedAction: dashboard.aiMarketingRecommendations[0] ? dashboard.aiMarketingRecommendations[0].description : "Review Marketing & Growth Center.",
    generatedAt: new Date().toISOString()
  };
}

module.exports = {
  ...agentDefinition,
  run
};
