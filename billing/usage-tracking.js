const { readBillingData } = require("./plans");

function usage(input = {}) {
  const data = readBillingData(input);
  const events = data.usage.map((event, index) => ({
    id: event.id || `usage_${index + 1}`,
    organizationId: event.organizationId || event.organization_id || "org_comphelp_service",
    metric: event.metric || "lead",
    quantity: Number(event.quantity || event.count || 1),
    createdAt: event.createdAt || event.created_at || new Date().toISOString()
  }));
  const totals = events.reduce((acc, event) => {
    acc[event.metric] = (acc[event.metric] || 0) + event.quantity;
    return acc;
  }, {});
  if (!Object.keys(totals).length) {
    totals.leads = 0;
    totals.users = 0;
    totals.projects = 0;
    totals.aiReports = 0;
  }
  return {
    ok: true,
    data: {
      usage: events,
      totals,
      meteringReady: true,
      billingProviderConnected: false,
      generatedAt: new Date().toISOString()
    }
  };
}

module.exports = { usage };
