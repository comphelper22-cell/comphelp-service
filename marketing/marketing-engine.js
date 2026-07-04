const { dashboard } = require("./marketing-dashboard");
const { leadSources } = require("./lead-sources");
const { campaigns } = require("./campaigns");
const { localSeo } = require("./local-seo");
const { reviews } = require("./reviews-engine");
const { social } = require("./social-performance");
const { email } = require("./email-campaigns");
const { roi } = require("./marketing-roi");
const { recommendations } = require("./growth-recommendations");

function status() {
  return {
    ok: true,
    status: "ready",
    engine: "Marketing & Growth Center",
    modules: ["dashboard", "leads", "campaigns", "localSeo", "reviews", "social", "email", "roi", "recommendations"],
    externalApisConnected: false,
    paidServicesConnected: false,
    jsonCompatible: true,
    generatedAt: new Date().toISOString()
  };
}

module.exports = {
  campaigns,
  dashboard,
  email,
  leads: leadSources,
  localSeo,
  recommendations,
  reviews,
  roi,
  social,
  status
};
