const analyticsEngine = require("../analytics/analytics-engine");

const agent = {
  name: "Analytics Agent",
  role: "Unified reporting and business analytics manager",
  mission: "Turn sales, operations, finance, customer success, and marketing signals into clear owner-ready reports.",
  responsibilities: [
    "Generate business scorecards",
    "Summarize KPI performance",
    "Detect trends across departments",
    "Produce weekly and monthly report drafts",
    "Create AI insight reports for owner review"
  ],
  inputs: ["leads", "estimates", "projects", "customers", "vendors", "invoices", "marketing data"],
  outputs: ["dashboard", "kpis", "trends", "reports", "scorecard", "insights"],
  KPIs: ["report completeness", "decision usefulness", "trend coverage", "data freshness"],
  escalationRules: [
    "Escalate missing revenue data to Finance Center",
    "Escalate low conversion to Sales Manager",
    "Escalate low customer health to Customer Success Center",
    "Escalate weak marketing attribution to Marketing & Growth Center"
  ],
  run(input = {}) {
    const dashboard = analyticsEngine.dashboard(input);
    const insights = analyticsEngine.insights(input);
    return {
      ok: true,
      agent: this.name,
      report: dashboard.data,
      insights: insights.data.insights,
      recommendedAction: "Review scorecard, then act on the highest priority insight.",
      generatedAt: new Date().toISOString()
    };
  }
};

module.exports = agent;
