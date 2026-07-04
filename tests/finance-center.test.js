const assert = require("assert");
const financeEngine = require("../finance/finance-engine");

function run() {
  const result = financeEngine.dashboard({ data: sampleData() });

  assert.strictEqual(result.ok, true, "Finance dashboard should return ok.");
  assert.ok(result.data.revenueToday >= 0, "Revenue today should exist.");
  assert.ok(result.data.revenueThisWeek >= 0, "Revenue this week should exist.");
  assert.ok(result.data.revenueThisMonth >= 0, "Revenue this month should exist.");
  assert.ok(result.data.outstandingInvoices >= 0, "Outstanding invoices should exist.");
  assert.ok(result.data.cashFlow !== undefined, "Cash flow should exist.");
  assert.ok(result.data.profitEstimate !== undefined, "Profit estimate should exist.");
  assert.ok(result.data.financialHealthScore >= 0, "Financial health score should exist.");
  assert.ok(Array.isArray(result.data.topCustomersByRevenue), "Top customers should exist.");
  assert.ok(Array.isArray(result.data.aiFinancialRecommendations), "AI finance recommendations should exist.");

  return {
    ok: true,
    revenueThisMonth: result.data.revenueThisMonth,
    outstandingInvoices: result.data.outstandingInvoices,
    cashFlow: result.data.cashFlow,
    profitEstimate: result.data.profitEstimate,
    financialHealthScore: result.data.financialHealthScore
  };
}

function sampleData() {
  return {
    projects: [
      { customerName: "Camera Customer", status: "completed", value: 1200, completionDate: new Date().toISOString() }
    ],
    estimates: [
      { customerName: "WiFi Customer", status: "approved", recommendedPrice: 650, createdAt: new Date().toISOString() }
    ],
    invoices: [
      { customerName: "Camera Customer", status: "paid", amount: 1200, paidAt: new Date().toISOString() },
      { customerName: "Office Customer", status: "overdue", amount: 400, dueDate: "2026-01-01" }
    ],
    expenses: [
      { category: "materials", amount: 250 },
      { category: "fuel", amount: 60 }
    ],
    customers: [{ name: "Camera Customer" }, { name: "WiFi Customer" }]
  };
}

if (require.main === module) {
  console.log(JSON.stringify(run(), null, 2));
}

module.exports = { run };
