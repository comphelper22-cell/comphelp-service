const { dashboard } = require("./marketing-dashboard");
const { leadSources } = require("./lead-sources");
const { campaigns } = require("./campaigns");
const { localSeo } = require("./local-seo");
const { reviews } = require("./reviews-engine");
const { social } = require("./social-performance");
const { email } = require("./email-campaigns");
const { roi } = require("./marketing-roi");
const { recommendations } = require("./growth-recommendations");
const { leadIntelligence, saveLeadToCrm } = require("./lead-intelligence-engine");
const { marketWatcher } = require("./market-watcher");
const { scoreLead } = require("./lead-scoring");
const { marketingStrategy } = require("./marketing-strategy-engine");
const { evaluateOutreachPolicy } = require("./outreach-policy");

function status() {
  return {
    ok: true,
    status: "ready",
    engine: "Marketing & Growth Center",
    modules: [
      "dashboard",
      "leads",
      "campaigns",
      "localSeo",
      "reviews",
      "social",
      "email",
      "roi",
      "recommendations",
      "leadIntelligence",
      "marketWatcher",
      "leadScoring",
      "marketingStrategy",
      "outreachPolicy"
    ],
    externalApisConnected: false,
    paidServicesConnected: false,
    autoOutreachEnabled: false,
    ownerApprovalRequired: true,
    jsonCompatible: true,
    generatedAt: new Date().toISOString()
  };
}

module.exports = {
  campaigns,
  dashboard,
  email,
  leadIntelligence,
  leads: leadSources,
  localSeo,
  marketWatcher,
  recommendations,
  reviews,
  roi,
  saveLeadToCrm,
  scoreLead,
  social,
  strategy: marketingStrategy,
  outreachPolicy: evaluateOutreachPolicy,
  status
};
