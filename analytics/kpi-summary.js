const executiveKpi = require("../brain/executive/executive-kpi");

function kpis(input = {}) {
  const data = executiveKpi.readMarketplaceData(input);
  const executive = executiveKpi.calculateKpis(input).data;
  const leads = data.leads.length;
  const estimates = data.estimates.length;
  const wonEstimates = data.estimates.filter((estimate) => /won|approved|accepted|converted|paid/i.test(String(estimate.status || ""))).length;
  const workItems = data.projects.concat(data.jobs || []);
  const openJobs = workItems.filter((project) => !/complete|completed|closed|paid|cancel/i.test(String(project.status || ""))).length;
  const completedJobs = workItems.filter((project) => /complete|completed|closed|paid/i.test(String(project.status || ""))).length;
  const revenue = executive.revenueThisMonth;
  const marketingLeads = data.leads.filter((lead) => /website|google|seo|instagram|facebook|tiktok|social/i.test(String(lead.source || ""))).length;

  return {
    ok: true,
    data: {
      revenue,
      leads,
      estimates,
      wonEstimates,
      conversionRate: estimates ? Math.round((wonEstimates / estimates) * 100) : 0,
      openJobs,
      completedJobs,
      customers: data.customers.length,
      vendors: data.vendors.length,
      marketingLeads,
      customerRetentionSignals: data.customers.filter((customer) => /vip|repeat|active/i.test(String(customer.status || ""))).length,
      generatedAt: new Date().toISOString()
    }
  };
}

function money(value) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number : 0;
}

function isBillableInvoice(invoice = {}) {
  if (invoice.placeholder || invoice.paymentStatus === "not_applicable" || invoice.status === "placeholder") return false;
  return money(invoice.amount || invoice.total) > 0;
}

module.exports = { kpis };
