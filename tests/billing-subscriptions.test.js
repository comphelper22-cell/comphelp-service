const assert = require("assert");
const billingEngine = require("../billing/billing-engine");

function run() {
  const input = { data: sampleData() };
  const status = billingEngine.status();
  const plans = billingEngine.plans(input);
  const subscriptions = billingEngine.subscriptions(input);
  const invoices = billingEngine.invoices(input);
  const usage = billingEngine.usage(input);
  const dashboard = billingEngine.dashboard(input);
  const payment = billingEngine.paymentStatus(input);

  assert.strictEqual(status.ok, true, "Billing status should return ok.");
  assert.strictEqual(status.stripeConnected, false, "Stripe must not be connected in Sprint 16.");
  assert.strictEqual(status.paymentProcessingEnabled, false, "Payment processing must be disabled.");
  assert.strictEqual(status.cardDataStored, false, "Card data must not be stored.");
  assert.strictEqual(plans.ok, true, "Plans should return ok.");
  assert.strictEqual(subscriptions.ok, true, "Subscriptions should return ok.");
  assert.strictEqual(invoices.ok, true, "Invoices should return ok.");
  assert.strictEqual(usage.ok, true, "Usage should return ok.");
  assert.strictEqual(dashboard.ok, true, "Billing dashboard should return ok.");
  assert.strictEqual(payment.ok, true, "Payment status should return ok.");
  assert.ok(Array.isArray(dashboard.data.plans), "Dashboard plans should exist.");
  assert.ok(Array.isArray(dashboard.data.upgradeRecommendations), "Upgrade recommendations should exist.");
  assert.strictEqual(dashboard.data.billingSafety.cardDataStored, false, "Dashboard must confirm no card data.");

  return {
    ok: true,
    plans: plans.data.plans.length,
    subscriptions: subscriptions.data.subscriptions.length,
    invoices: invoices.data.invoices.length,
    usageMetrics: Object.keys(usage.data.totals).length,
    paymentStatus: payment.data.status
  };
}

function sampleData() {
  return {
    billingPlans: [
      { id: "starter", name: "Starter", monthlyPrice: 49, leadLimit: 100, userLimit: 2, status: "draft" },
      { id: "growth", name: "Growth", monthlyPrice: 149, leadLimit: 500, userLimit: 8, status: "draft" }
    ],
    subscriptions: [
      { id: "sub_1", organizationId: "org_1", planId: "starter", status: "trialing", billingCycle: "monthly", seats: 2 }
    ],
    billingInvoices: [
      { id: "inv_1", organizationId: "org_1", amount: 49, status: "draft", dueDate: "2026-08-01" }
    ],
    usageEvents: [
      { id: "usage_1", organizationId: "org_1", metric: "leads", quantity: 25 },
      { id: "usage_2", organizationId: "org_1", metric: "users", quantity: 2 }
    ]
  };
}

if (require.main === module) {
  console.log(JSON.stringify(run(), null, 2));
}

module.exports = { run };
