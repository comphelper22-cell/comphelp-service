const { calculateKpis } = require("./executive-kpi");

function forecast(input = {}) {
  const kpis = calculateKpis(input).data;
  const pipelineRevenue = Math.round((kpis.openEstimates || 0) * Math.max(kpis.averageJobValue || 399, 399) * 0.35);
  const monthlyBase = kpis.revenueThisMonth || pipelineRevenue;
  return {
    ok: true,
    data: {
      revenueForecast: {
        next7Days: Math.round((monthlyBase / 4) + pipelineRevenue),
        next30Days: Math.round(monthlyBase + pipelineRevenue),
        confidence: kpis.openEstimates || kpis.completedJobs ? 0.72 : 0.48
      },
      workloadForecast: {
        openJobs: kpis.openJobs,
        expectedNewJobs: Math.max(1, Math.round((kpis.openEstimates || 1) * 0.35)),
        status: kpis.openJobs > 5 ? "busy" : "available_capacity"
      },
      customerGrowth: {
        currentCustomers: kpis.customerCount,
        expectedNewCustomers: Math.max(1, Math.round((kpis.leadCount || 1) * 0.25))
      },
      marketingPerformance: {
        status: kpis.marketingPerformance.status,
        expectedLeadTrend: kpis.marketingPerformance.marketingLeads ? "steady" : "needs_campaigns"
      },
      cashFlowTrend: {
        status: kpis.outstandingInvoices > 0 ? "watch_collections" : "stable",
        outstandingInvoices: kpis.outstandingInvoices
      },
      technicianCapacity: {
        utilization: kpis.technicianUtilization,
        status: kpis.technicianUtilization > 80 ? "tight" : "available"
      },
      generatedAt: new Date().toISOString()
    }
  };
}

module.exports = {
  forecast
};
