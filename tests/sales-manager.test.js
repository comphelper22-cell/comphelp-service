const assert = require("assert");
const salesEngine = require("../sales/sales-engine");

function run() {
  const result = salesEngine.dashboard({ data: sampleData() });

  assert.strictEqual(result.ok, true, "Sales dashboard should return ok.");
  assert.ok(result.data.salesOverview, "Sales overview should exist.");
  assert.ok(result.data.salesOverview.bestNextCustomer, "Best next customer should exist.");
  assert.ok(result.data.salesOverview.recommendedAction, "Recommended action should exist.");
  assert.ok(result.data.kpis.openEstimates >= 0, "Open estimates KPI should exist.");
  assert.ok(Array.isArray(result.data.highPriorityDeals), "High priority deals should exist.");
  assert.ok(Array.isArray(result.data.todaysFollowups), "Follow-up queue should exist.");
  assert.ok(Array.isArray(result.data.revenueOpportunities), "Revenue opportunities should exist.");

  return {
    ok: true,
    bestNextCustomer: result.data.salesOverview.bestNextCustomer,
    expectedRevenue: result.data.salesOverview.expectedRevenue,
    probability: result.data.salesOverview.probability,
    priority: result.data.salesOverview.priority,
    openEstimates: result.data.kpis.openEstimates
  };
}

function sampleData() {
  return {
    leads: [
      { id: "lead-1", name: "Maria Camera Lead", service: "Security Camera Installation", status: "New Lead", source: "website" }
    ],
    estimates: [
      {
        id: "estimate-1",
        customerName: "Maria Camera Lead",
        service: "Security Camera Installation",
        status: "open",
        recommendedPrice: 1299,
        createdAt: new Date().toISOString()
      },
      {
        id: "estimate-2",
        customerName: "Won Customer",
        service: "WiFi & Network Installation",
        status: "approved",
        recommendedPrice: 650,
        createdAt: new Date().toISOString()
      }
    ],
    customers: [{ id: "customer-1", name: "Won Customer", status: "vip" }],
    tasks: [{ title: "Follow up with Maria", type: "followup", status: "open" }]
  };
}

if (require.main === module) {
  console.log(JSON.stringify(run(), null, 2));
}

module.exports = { run };
