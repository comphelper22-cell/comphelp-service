const assert = require("assert");
const { marketingStrategy } = require("../marketing/marketing-strategy-engine");

const result = marketingStrategy({});

assert.strictEqual(result.ok, true);
assert.ok(result.data.recommendedServiceThisWeek);
assert.ok(result.data.bestCustomerSegment);
assert.ok(result.data.bestPriceOffer);
assert.ok(result.data.bestContentIdea);
assert.ok(result.data.bestOutreachMessage);
assert.strictEqual(result.data.recommendedCampaign.safety.includes("No sending"), true);

console.log(JSON.stringify({
  ok: true,
  service: result.data.recommendedServiceThisWeek,
  segment: result.data.bestCustomerSegment
}, null, 2));

