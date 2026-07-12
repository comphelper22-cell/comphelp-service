const assert = require("assert");
const fs = require("fs");
const path = require("path");

const source = fs.readFileSync(path.join(__dirname, "..", "assets", "marketplace-manager.js"), "utf8");

assert.match(source, /function attachFunctionTabs\(\)/, "Marketplace must initialize shared function-tab state.");
assert.match(source, /function setActiveFunctionTab\(group, button\)/, "Marketplace must use one reusable active-state controller.");
assert.match(source, /attachFunctionTabs\(\);/, "Shared function tabs must be attached during boot.");
assert.match(source, /aria-pressed/, "Function tabs must expose selected state to assistive technology.");
assert.ok(!source.includes("!group.contains(button) || button.disabled"), "A handler-disabled button must still receive selected-state feedback during click bubbling.");
assert.match(source, /section\.querySelectorAll\("\.actions"\)/, "Every action group in each center must receive independent selected-state handling.");
assert.ok(!source.includes('section.querySelector(".actions")'), "Function-tab handling must not depend on only the first action group.");
assert.match(source, /functionTabsAttached/, "Function-tab handlers must be attached only once per group.");
[
  "betaCenter", "releaseCenter", "executiveDashboard", "salesManager",
  "operationsCenter", "financeCenter", "customerSuccessCenter",
  "marketingGrowthCenter", "analyticsReports", "dispatchAICenter",
  "saasAdminCenter", "billingCenter", "integrationsCenter",
  "recommendations", "comphelpBrain"
].forEach((view) => {
  assert.ok(source.includes(`"${view}"`), `${view} must participate in shared function-tab feedback.`);
});

console.log(JSON.stringify({ ok: true, sharedFunctionTabFeedback: "validated" }, null, 2));
