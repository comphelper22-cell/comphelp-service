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
    "Rank public-source lead intelligence placeholders",
    "Prepare owner-approved outreach drafts",
    "Monitor market signals and competitor offer patterns",
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
    "Never auto-contact leads; draft outreach only.",
    "Never scrape sources that prohibit scraping.",
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
    topLead: dashboard.topLeadsToday && dashboard.topLeadsToday[0] ? dashboard.topLeadsToday[0] : null,
    marketOpportunityScore: dashboard.marketOpportunityScore,
    recommendedAction: dashboard.aiMarketingRecommendations[0] ? dashboard.aiMarketingRecommendations[0].description : "Review Marketing & Growth Center.",
    generatedAt: new Date().toISOString()
  };
}

module.exports = {
  ...agentDefinition,
  run
};
