const { dashboard } = require("./reporting-dashboard");
const { kpis } = require("./kpi-summary");
const { trends } = require("./trend-analysis");
const { reports } = require("./performance-reports");
const { scorecard } = require("./business-scorecard");
const { exportReports } = require("./export-reports");
const { insights } = require("./ai-insights-report");

function status() {
  return {
    ok: true,
    status: "ready",
    engine: "Analytics & Reporting Center",
    modules: ["dashboard", "kpis", "trends", "reports", "scorecard", "export", "insights"],
    externalApisConnected: false,
    jsonCompatible: true,
    generatedAt: new Date().toISOString()
  };
}

module.exports = {
  dashboard,
  export: exportReports,
  insights,
  kpis,
  reports,
  scorecard,
  status,
  trends
};
