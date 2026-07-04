const { readBillingData } = require("./plans");

function subscriptions(input = {}) {
  const data = readBillingData(input);
  const planMap = data.plans.reduce((acc, plan) => {
    acc[plan.id] = plan;
    return acc;
  }, {});
  const items = data.subscriptions.map((subscription) => {
    const plan = planMap[subscription.planId] || {};
    return {
      id: subscription.id,
      organizationId: subscription.organizationId || subscription.organization_id || "org_comphelp_service",
      planId: subscription.planId || "starter",
      planName: plan.name || subscription.planName || "Starter",
      status: subscription.status || "trialing",
      billingCycle: subscription.billingCycle || "monthly",
      seats: Number(subscription.seats || 1),
      monthlyPrice: Number(plan.monthlyPrice || subscription.monthlyPrice || 0),
      currentPeriodEnd: subscription.currentPeriodEnd || subscription.current_period_end || "",
      paymentProvider: "none"
    };
  });
  return {
    ok: true,
    data: {
      subscriptions: items,
      activeSubscriptions: items.filter((item) => /active|trialing/i.test(item.status)).length,
      demoMode: data.demoMode,
      generatedAt: new Date().toISOString()
    }
  };
}

module.exports = { subscriptions };
