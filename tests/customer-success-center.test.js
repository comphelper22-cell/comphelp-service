const assert = require("assert");
const customerSuccessEngine = require("../customer-success/customer-success-engine");

function run() {
  const result = customerSuccessEngine.dashboard({ data: sampleData() });

  assert.strictEqual(result.ok, true, "Customer Success dashboard should return ok.");
  assert.ok(result.data.customerHealthScore >= 0, "Customer health score should exist.");
  assert.ok(Array.isArray(result.data.vipCustomers), "VIP customers should exist.");
  assert.ok(Array.isArray(result.data.atRiskCustomers), "At-risk customers should exist.");
  assert.ok(Array.isArray(result.data.lostCustomers), "Lost customers should exist.");
  assert.ok(Array.isArray(result.data.customerLifetimeValue), "Customer LTV should exist.");
  assert.ok(Array.isArray(result.data.customerTimeline), "Customer timeline should exist.");
  assert.ok(Array.isArray(result.data.aiCustomerRecommendations), "AI recommendations should exist.");

  return {
    ok: true,
    healthScore: result.data.customerHealthScore,
    vipCustomers: result.data.vipCustomers.length,
    atRiskCustomers: result.data.atRiskCustomers.length,
    lifetimeValueRecords: result.data.customerLifetimeValue.length,
    recommendations: result.data.aiCustomerRecommendations.length
  };
}

function sampleData() {
  return {
    customers: [
      { id: "c1", name: "VIP Camera Customer", status: "vip", city: "Los Angeles", notes: "Repeat customer" },
      { id: "c2", name: "Waiting WiFi Customer", status: "at_risk", city: "Burbank", notes: "waiting for follow-up" }
    ],
    projects: [
      { customerName: "VIP Camera Customer", service: "Security Camera Installation", status: "completed", value: 1200 }
    ],
    estimates: [
      { customerName: "Waiting WiFi Customer", service: "WiFi & Network Installation", status: "open", recommendedPrice: 650 }
    ],
    invoices: [
      { customerName: "VIP Camera Customer", status: "paid", amount: 1200 }
    ],
    tasks: [
      { customerName: "Waiting WiFi Customer", title: "Follow up on WiFi estimate", status: "open" }
    ],
    leads: []
  };
}

if (require.main === module) {
  console.log(JSON.stringify(run(), null, 2));
}

module.exports = { run };
