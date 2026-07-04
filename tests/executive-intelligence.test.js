const assert = require("assert");
const executiveEngine = require("../brain/executive/executive-engine");

function run() {
  const dashboard = executiveEngine.dashboard({ data: sampleData() });
  const briefing = executiveEngine.briefing({ data: sampleData() });

  assert.strictEqual(dashboard.ok, true, "Executive dashboard should return ok.");
  assert.strictEqual(briefing.ok, true, "Executive briefing should return ok.");
  assert.ok(dashboard.data.businessHealth.overallScore >= 0, "Business health score should exist.");
  assert.ok(dashboard.data.forecasts.revenueForecast, "Revenue forecast should exist.");
  assert.ok(Array.isArray(dashboard.data.businessRisks), "Risk list should exist.");
  assert.ok(Array.isArray(dashboard.data.growthOpportunities), "Opportunity list should exist.");
  assert.ok(Array.isArray(dashboard.data.aiPriorityQueue), "AI priority queue should exist.");
  assert.ok(briefing.data.executiveSummary, "Executive summary text should exist.");

  return {
    ok: true,
    businessHealth: dashboard.data.businessHealth.overallScore,
    risks: dashboard.data.businessRisks.length,
    opportunities: dashboard.data.growthOpportunities.length,
    aiPriorityQueue: dashboard.data.aiPriorityQueue.length
  };
}

function sampleData() {
  return {
    leads: [{ source: "website", service: "Security Camera Installation", status: "New Lead" }],
    vendors: [{ name: "Installer", status: "active", rating: 4.8 }],
    projects: [{ status: "completed", value: 899, reviewRating: 5 }],
    estimates: [{ status: "approved", recommendedPrice: 899 }],
    customers: [{ name: "Test Customer", status: "active" }],
    tasks: [],
    invoices: [],
    inventory: []
  };
}

if (require.main === module) {
  console.log(JSON.stringify(run(), null, 2));
}

module.exports = { run };
