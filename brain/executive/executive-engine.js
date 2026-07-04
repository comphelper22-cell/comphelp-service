const { dashboard } = require("./executive-dashboard");
const { briefing } = require("./executive-briefing");
const { calculateKpis } = require("./executive-kpi");
const { businessHealth } = require("./executive-health");
const { detectRisks } = require("./executive-risk");
const { forecast } = require("./executive-forecast");
const { opportunities } = require("./executive-opportunities");
const { insights } = require("./executive-insights");
const { summary } = require("./executive-summary");

function status() {
  return {
    ok: true,
    status: "ready",
    engine: "Executive Intelligence Engine",
    modules: [
      "dashboard",
      "briefing",
      "kpi",
      "health",
      "risk",
      "forecast",
      "opportunities",
      "insights",
      "summary"
    ],
    externalAiConnected: false,
    supabaseRequired: false,
    jsonCompatible: true,
    generatedAt: new Date().toISOString()
  };
}

module.exports = {
  briefing,
  dashboard,
  forecast,
  health: businessHealth,
  insights,
  kpi: calculateKpis,
  opportunities,
  risks: detectRisks,
  status,
  summary
};
