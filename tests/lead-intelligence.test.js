const assert = require("assert");
const { leadIntelligence } = require("../marketing/lead-intelligence-engine");

const result = leadIntelligence({ city: "Los Angeles" });

assert.strictEqual(result.ok, true);
assert.strictEqual(result.data.externalFetchEnabled, false);
assert.ok(Array.isArray(result.data.topLeadsToday));
assert.ok(result.data.topLeadsToday.length > 0);
assert.ok(result.data.topLeadsToday.every((lead) => lead.approvalRequired === true));
assert.ok(result.data.topLeadsToday.every((lead) => lead.outreachApproved === false));
assert.ok(result.data.topLeadsToday.every((lead) => lead.outreachPolicy.canSendAutomatically === false));
assert.ok(result.data.marketOpportunityScore > 0);

console.log(JSON.stringify({
  ok: true,
  leads: result.data.topLeadsToday.length,
  marketOpportunityScore: result.data.marketOpportunityScore
}, null, 2));
