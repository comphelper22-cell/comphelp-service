const executiveKpi = require("../brain/executive/executive-kpi");

function kpis(input = {}) {
  const data = executiveKpi.readMarketplaceData(input);
  const leads = data.leads.length;
  const estimates = data.estimates.length;
  const wonEstimates = data.estimates.filter((estimate) => /won|approved|accepted|paid/i.test(String(estimate.status || ""))).length;
  const openJobs = data.projects.filter((project) => !/complete|completed|closed|paid/i.test(String(project.status || ""))).length;
  const completedJobs = data.projects.filter((project) => /complete|completed|closed|paid/i.test(String(project.status || ""))).length;
  const revenue = data.projects.reduce((sum, project) => sum + money(project.value || project.projectValue || project.revenue), 0)
    + data.estimates.filter((estimate) => /won|approved|accepted|paid/i.test(String(estimate.status || ""))).reduce((sum, estimate) => sum + money(estimate.recommended || estimate.recommendedPrice || estimate.total), 0);
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

module.exports = { kpis };
