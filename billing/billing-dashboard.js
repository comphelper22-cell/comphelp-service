const { plans } = require("./plans");
const { subscriptions } = require("./subscriptions");
const { invoices } = require("./invoices");
const { usage } = require("./usage-tracking");
const { paymentStatus } = require("./payment-status");

function dashboard(input = {}) {
  const planData = plans(input).data;
  const subscriptionData = subscriptions(input).data;
  const invoiceData = invoices(input).data;
  const usageData = usage(input).data;
  const payment = paymentStatus(input).data;
  return {
    ok: true,
    data: {
      plans: planData.plans,
      subscriptionStatus: subscriptionData.subscriptions,
      usage: usageData,
      invoices: invoiceData.invoices,
      paymentStatus: payment,
      upgradeRecommendations: upgradeRecommendations(planData.plans, subscriptionData.subscriptions, usageData.totals),
      billingSafety: {
        stripeConnected: false,
        realPaymentProcessing: false,
        cardDataStored: false,
        architectureOnly: true
      },
      generatedAt: new Date().toISOString()
    }
  };
}

function upgradeRecommendations(plans, subscriptions, totals) {
  const current = subscriptions[0] || {};
  const plan = plans.find((item) => item.id === current.planId) || plans[0] || {};
  const leadUsage = Number(totals.leads || 0);
  const recommendations = [];
  if (plan.leadLimit && leadUsage >= plan.leadLimit * 0.8) {
    recommendations.push({
      title: "Review plan capacity",
      priority: "MEDIUM",
      reason: `Lead usage is near the ${plan.name} plan limit.`,
      recommendedAction: "Consider upgrading before usage limits are enforced."
    });
  }
  recommendations.push({
    title: "Prepare payment provider sprint",
    priority: "LOW",
    reason: "Billing architecture is ready but payment processing is intentionally disabled.",
    recommendedAction: "Approve a future Stripe integration sprint when pricing is final."
  });
  return recommendations;
}

module.exports = { dashboard };
