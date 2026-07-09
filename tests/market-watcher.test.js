const assert = require("assert");
const { marketWatcher } = require("../marketing/market-watcher");

const result = marketWatcher({ city: "Los Angeles" });

assert.strictEqual(result.ok, true);
assert.strictEqual(result.data.externalFetchEnabled, false);
assert.ok(Array.isArray(result.data.competitorAlerts));
assert.ok(Array.isArray(result.data.popularServices));
assert.ok(Array.isArray(result.data.localDemand));
assert.ok(result.data.localDemand.length > 0);
assert.ok(result.data.localDemand.every((signal) => signal.source.includes("placeholder")));

console.log(JSON.stringify({
  ok: true,
  signals: result.data.localDemand.length,
  popularServices: result.data.popularServices.length
}, null, 2));
