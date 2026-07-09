const assert = require("assert");
const fs = require("fs");
const path = require("path");
const marketingEngine = require("../marketing/marketing-engine");

const ROOT = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(ROOT, "marketplace.html"), "utf8");
const manager = fs.readFileSync(path.join(ROOT, "assets", "marketplace-manager.js"), "utf8");
const api = fs.readFileSync(path.join(ROOT, "api", "system.js"), "utf8");

const actions = [
  "marketing.dashboard",
  "marketing.leads",
  "marketing.campaigns",
  "marketing.localSeo",
  "marketing.reviews",
  "marketing.social",
  "marketing.email",
  "marketing.roi",
  "marketing.recommendations",
  "marketing.leadIntelligence",
  "marketing.marketWatcher",
  "marketing.strategy",
  "marketing.outreachPolicy"
];

actions.forEach((action) => {
  assert.ok(html.includes(`data-marketing-action="${action}"`), `${action} button should be registered in marketplace.html.`);
  assert.ok(html.includes(`data-marketing-target="marketingGrowthResult" data-marketing-action="${action}"`), `${action} should target Marketing Output.`);
  assert.ok(api.includes(`"${action}"`), `${action} should be registered in api/system.js.`);
});

assert.ok(manager.includes("setMarketingActiveTab"), "Marketing tab active state handler should exist.");
assert.ok(manager.includes("renderMarketingOutput"), "Marketing output renderer should exist.");
assert.ok(manager.includes("attachMarketingGrowthTabs"), "Marketing tabs should have an isolated initializer.");
assert.ok(manager.includes("section.addEventListener(\"click\""), "Marketing tabs should use delegated click handling.");
assert.ok(manager.includes("[data-marketing-action]"), "Marketing handler should bind by data action.");
assert.ok(manager.indexOf("attachMarketingGrowthTabs();") < manager.indexOf("attachForms();"), "Marketing tabs should bind before the broad form setup.");

const dashboard = marketingEngine.dashboard({});
assert.strictEqual(dashboard.ok, true);
assert.ok(dashboard.data.aiMarketingManager, "Dashboard should include AI Marketing Manager data.");
assert.ok(Array.isArray(dashboard.data.topLeadsToday), "Dashboard should include top leads.");
assert.ok(Array.isArray(dashboard.data.competitorAlerts), "Dashboard should include competitor alerts.");
assert.ok(dashboard.data.recommendedCampaign, "Dashboard should include recommended campaign.");

console.log(JSON.stringify({
  ok: true,
  registeredActions: actions.length,
  topLeads: dashboard.data.topLeadsToday.length
}, null, 2));
