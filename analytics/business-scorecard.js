const { kpis } = require("./kpi-summary");

function scorecard(input = {}) {
  const summary = kpis(input).data;
  const sales = score(summary.conversionRate, 75);
  const operations = score(summary.completedJobs + summary.openJobs, 8);
  const finance = score(summary.revenue, 5000);
  const customers = score(summary.customers + summary.customerRetentionSignals, 8);
  const marketing = score(summary.marketingLeads, 10);
  const overall = Math.round((sales + operations + finance + customers + marketing) / 5);

  return {
    ok: true,
    data: {
      overall,
      sales,
      operations,
      finance,
      customers,
      marketing,
      status: overall >= 80 ? "strong" : overall >= 60 ? "stable" : "needs_attention",
      generatedAt: new Date().toISOString()
    }
  };
}

function score(value, target) {
  return Math.max(0, Math.min(100, Math.round((Number(value || 0) / target) * 100)));
}

module.exports = { scorecard };
