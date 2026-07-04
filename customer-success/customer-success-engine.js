const { dashboard } = require("./customer-dashboard");
const { health } = require("./customer-health");
const { timeline } = require("./customer-timeline");
const { ltv } = require("./customer-ltv");
const { risks } = require("./customer-risk");
const { vip } = require("./vip-customers");
const { lost } = require("./lost-customers");
const { recommendations } = require("./customer-recommendations");

function status() {
  return {
    ok: true,
    status: "ready",
    engine: "Customer Success Center",
    modules: ["dashboard", "health", "timeline", "ltv", "risks", "vip", "lost", "recommendations"],
    externalAiConnected: false,
    jsonCompatible: true,
    generatedAt: new Date().toISOString()
  };
}

module.exports = {
  dashboard,
  health,
  timeline,
  ltv,
  risks,
  vip,
  lost,
  recommendations,
  status
};
