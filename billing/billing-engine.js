const { plans } = require("./plans");
const { subscriptions } = require("./subscriptions");
const { invoices } = require("./invoices");
const { usage } = require("./usage-tracking");
const { dashboard } = require("./billing-dashboard");
const { paymentStatus } = require("./payment-status");

function status() {
  return {
    ok: true,
    status: "ready",
    engine: "Billing & Subscriptions",
    modules: ["plans", "subscriptions", "invoices", "usage", "dashboard", "paymentStatus"],
    stripeConnected: false,
    paymentProcessingEnabled: false,
    cardDataStored: false,
    architectureOnly: true,
    generatedAt: new Date().toISOString()
  };
}

module.exports = {
  dashboard,
  invoices,
  paymentStatus,
  plans,
  status,
  subscriptions,
  usage
};
