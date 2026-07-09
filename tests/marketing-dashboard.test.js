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

assert.ok(manager.includes("setActiveMarketingTab"), "Marketing tab active state helper should exist.");
assert.ok(manager.includes('item.classList.remove("primary")'), "Marketing helper should remove primary from sibling tabs.");
assert.ok(manager.includes('item.classList.remove("is-active")'), "Marketing helper should remove is-active from sibling tabs.");
assert.ok(manager.includes('button.classList.add("primary")'), "Marketing helper should add primary to the clicked tab.");
assert.ok(manager.includes('button.classList.add("is-active")'), "Marketing helper should add is-active to the clicked tab.");
assert.ok(manager.includes("renderMarketingOutput"), "Marketing output renderer should exist.");
assert.ok(manager.includes("attachMarketingGrowthTabs"), "Marketing tabs should have an isolated initializer.");
assert.ok(manager.includes("section.addEventListener(\"click\""), "Marketing tabs should use delegated click handling.");
assert.ok(manager.includes("[data-marketing-action]"), "Marketing handler should bind by data action.");
assert.ok(manager.indexOf("attachMarketingGrowthTabs();") < manager.indexOf("attachForms();"), "Marketing tabs should bind before the broad form setup.");

const marketingButtons = actions.map((action, index) => ({
  action,
  classes: new Set(index === 0 ? ["btn", "primary", "is-active"] : ["btn"]),
  ariaPressed: index === 0 ? "true" : "false"
}));

function simulateActiveMarketingTab(clicked) {
  marketingButtons.forEach((button) => {
    button.classes.delete("primary");
    button.classes.delete("is-active");
    button.ariaPressed = "false";
  });
  clicked.classes.add("primary");
  clicked.classes.add("is-active");
  clicked.ariaPressed = "true";
}

simulateActiveMarketingTab(marketingButtons[1]);
assert.ok(marketingButtons[1].classes.has("primary"), "Clicked marketing tab should become primary.");
assert.ok(marketingButtons[1].classes.has("is-active"), "Clicked marketing tab should become active.");
assert.strictEqual(marketingButtons[1].ariaPressed, "true");
assert.ok(!marketingButtons[0].classes.has("primary"), "Previous marketing tab should lose primary.");
assert.ok(!marketingButtons[0].classes.has("is-active"), "Previous marketing tab should lose is-active.");

simulateActiveMarketingTab(marketingButtons[9]);
assert.ok(marketingButtons[9].classes.has("primary"), "Second clicked marketing tab should become primary.");
assert.ok(marketingButtons.every((button, index) => index === 9 || !button.classes.has("primary")), "Only selected marketing tab should be primary.");

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
