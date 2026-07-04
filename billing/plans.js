const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const MARKETPLACE_FILE = path.join(ROOT, "data", "marketplace.json");

function readBillingData(input = {}) {
  if (input.data) return normalize(input.data, false);
  try {
    const parsed = JSON.parse(fs.readFileSync(MARKETPLACE_FILE, "utf8").replace(/^\uFEFF/, ""));
    return normalize(parsed, false);
  } catch (_) {
    return normalize({}, true);
  }
}

function normalize(data = {}, forcedDemo = false) {
  const plans = arr(data.billingPlans);
  const subscriptions = arr(data.subscriptions);
  const invoices = arr(data.billingInvoices || data.invoices);
  const usage = arr(data.usageEvents || data.usage);
  const hasBillingData = plans.length || subscriptions.length || invoices.length || usage.length;
  return {
    plans: plans.length ? plans : defaultPlans(),
    subscriptions: subscriptions.length ? subscriptions : defaultSubscriptions(),
    invoices,
    usage,
    demoMode: forcedDemo || !hasBillingData
  };
}

function plans(input = {}) {
  const data = readBillingData(input);
  return {
    ok: true,
    data: {
      plans: data.plans,
      demoMode: data.demoMode,
      stripeConnected: false,
      paymentProcessingEnabled: false,
      generatedAt: new Date().toISOString()
    }
  };
}

function defaultPlans() {
  return [
    { id: "starter", name: "Starter", monthlyPrice: 49, leadLimit: 100, userLimit: 2, features: ["CRM", "Lead forms", "Basic dashboard"], status: "draft" },
    { id: "growth", name: "Growth", monthlyPrice: 149, leadLimit: 500, userLimit: 8, features: ["AI dashboards", "Dispatch AI", "Marketing reports"], status: "draft" },
    { id: "pro", name: "Pro", monthlyPrice: 299, leadLimit: 2000, userLimit: 25, features: ["Multi-location", "Advanced agents", "Approval workflows"], status: "draft" }
  ];
}

function defaultSubscriptions() {
  return [
    { id: "sub_demo", organizationId: "org_comphelp_service", planId: "growth", status: "trialing", billingCycle: "monthly", seats: 3, currentPeriodEnd: "" }
  ];
}

function arr(value) {
  return Array.isArray(value) ? value : [];
}

module.exports = {
  defaultPlans,
  plans,
  readBillingData
};
