const assert = require("assert");
const { scoreLead, rankLeads } = require("../marketing/lead-scoring");

const lead = {
  businessName: "Test Dental Office",
  businessType: "dental offices",
  possibleServiceNeed: "Security camera installation",
  urgency: "high",
  likelyBudget: "high",
  serviceFit: 95,
  distanceMiles: 4,
  reviewSignals: "Needs better security cameras",
  websiteQuality: "basic",
  phoneAvailable: true
};

const scored = scoreLead(lead);
assert.strictEqual(scored.ok, true);
assert.ok(scored.data.score >= 80);
assert.strictEqual(scored.data.priority, "high");
assert.ok(scored.data.reasoning.length >= 2);

const ranked = rankLeads([lead, { businessName: "Low Fit", serviceFit: 30, likelyBudget: "low", urgency: "low" }]);
assert.ok(ranked[0].score >= ranked[1].score);

console.log(JSON.stringify({ ok: true, score: scored.data.score, priority: scored.data.priority }, null, 2));

