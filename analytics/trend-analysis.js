const executiveKpi = require("../brain/executive/executive-kpi");

function trends(input = {}) {
  const data = executiveKpi.readMarketplaceData(input);
  const leadTrend = trendFromDates(data.leads, "createdAt");
  const revenueTrend = trendFromValues([...data.projects, ...data.estimates]);
  const salesTrend = trendFromStatuses(data.estimates);
  const operationsTrend = data.projects.length ? "tracked" : "needs_more_jobs";
  const customerTrend = data.customers.length ? "tracked" : "needs_customer_history";
  const marketingTrend = data.leads.some((lead) => /website|google|seo|instagram|facebook|tiktok|social/i.test(String(lead.source || ""))) ? "active" : "needs_source_tracking";

  return {
    ok: true,
    data: {
      revenueTrend,
      salesTrend,
      operationsTrend,
      customerTrend,
      marketingTrend,
      leadTrend,
      windows: ["today", "week", "month"],
      generatedAt: new Date().toISOString()
    }
  };
}

function trendFromDates(items, field) {
  if (!items.length) return "needs_more_data";
  const recent = items.filter((item) => withinDays(item[field] || item.timestamp || item.date, 7)).length;
  return recent >= Math.max(1, Math.ceil(items.length / 2)) ? "increasing" : "steady";
}

function trendFromValues(items) {
  const values = items.map((item) => Number(item.value || item.projectValue || item.revenue || item.recommended || item.recommendedPrice || item.total || 0)).filter(Boolean);
  if (values.length < 2) return "needs_more_data";
  return values[values.length - 1] >= values[0] ? "up" : "down";
}

function trendFromStatuses(estimates) {
  if (!estimates.length) return "needs_more_estimates";
  const won = estimates.filter((estimate) => /won|approved|accepted|paid/i.test(String(estimate.status || ""))).length;
  return won / estimates.length >= 0.4 ? "healthy" : "needs_followup";
}

function withinDays(value, days) {
  if (!value) return false;
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return false;
  return Date.now() - date.getTime() <= days * 86400000;
}

module.exports = { trends };
