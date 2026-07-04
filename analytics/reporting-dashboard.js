const { kpis } = require("./kpi-summary");
const { trends } = require("./trend-analysis");
const { reports } = require("./performance-reports");
const { scorecard } = require("./business-scorecard");
const { insights } = require("./ai-insights-report");

function dashboard(input = {}) {
  const kpiData = kpis(input).data;
  const trendData = trends(input).data;
  const reportData = reports(input).data;
  const scoreData = scorecard(input).data;
  const insightData = insights(input).data;

  return {
    ok: true,
    data: {
      businessScorecard: scoreData,
      revenueTrends: trendData.revenueTrend,
      salesTrends: trendData.salesTrend,
      operationsTrends: trendData.operationsTrend,
      customerTrends: trendData.customerTrend,
      marketingTrends: trendData.marketingTrend,
      kpis: kpiData,
      aiInsightsReport: insightData.insights,
      weeklyReport: reportData.weeklyReport,
      monthlyReport: reportData.monthlyReport,
      generatedAt: new Date().toISOString()
    }
  };
}

module.exports = { dashboard };
