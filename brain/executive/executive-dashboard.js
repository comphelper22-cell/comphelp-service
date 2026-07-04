const recommendationEngine = require("../recommendation/recommendation-engine");
const { calculateKpis } = require("./executive-kpi");
const { businessHealth } = require("./executive-health");
const { forecast } = require("./executive-forecast");
const { detectRisks } = require("./executive-risk");
const { opportunities } = require("./executive-opportunities");

function dashboard(input = {}) {
  const kpis = calculateKpis(input).data;
  const health = businessHealth(input).data;
  const forecasts = forecast(input).data;
  const risks = detectRisks(input).data.risks;
  const growth = opportunities(input).data.opportunities;
  const recommendationSummary = recommendationEngine.generate({ ...input, record: false }).data;
  return {
    ok: true,
    data: {
      businessHealth: health,
      revenueToday: kpis.revenueToday,
      revenueYesterday: kpis.revenueYesterday,
      revenueThisWeek: kpis.revenueThisWeek,
      revenueThisMonth: kpis.revenueThisMonth,
      openJobs: kpis.openJobs,
      completedJobs: kpis.completedJobs,
      openEstimates: kpis.openEstimates,
      estimateConversionRate: kpis.estimateConversionRate,
      averageJobValue: kpis.averageJobValue,
      outstandingInvoices: kpis.outstandingInvoices,
      collections: kpis.collections,
      technicianUtilization: kpis.technicianUtilization,
      technicianPerformance: kpis.technicianPerformance,
      customerSatisfaction: kpis.customerSatisfaction,
      recommendationSummary: recommendationSummary.recommendations.slice(0, 5),
      businessRisks: risks,
      growthOpportunities: growth,
      marketingPerformance: kpis.marketingPerformance,
      inventoryStatus: kpis.inventoryStatus,
      aiPriorityQueue: recommendationSummary.aiPriorityQueue,
      forecasts,
      generatedAt: new Date().toISOString()
    }
  };
}

module.exports = {
  dashboard
};
