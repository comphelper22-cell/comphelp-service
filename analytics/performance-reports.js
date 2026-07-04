const { kpis } = require("./kpi-summary");
const { trends } = require("./trend-analysis");
const { scorecard } = require("./business-scorecard");

function reports(input = {}) {
  const summary = kpis(input).data;
  const trendData = trends(input).data;
  const score = scorecard(input).data;

  return {
    ok: true,
    data: {
      weeklyReport: {
        title: "Weekly Business Performance",
        summary: `Revenue ${summary.revenue}, ${summary.leads} leads, ${summary.openJobs} open jobs, ${summary.conversionRate}% estimate conversion.`,
        focus: ["Follow up open estimates", "Review marketing lead sources", "Keep job schedule current"]
      },
      monthlyReport: {
        title: "Monthly Business Performance",
        summary: `Business score ${score.overall}/100 with ${summary.customers} customers and ${summary.marketingLeads} marketing-sourced leads.`,
        focus: ["Improve local SEO coverage", "Increase review requests", "Track channel ROI"]
      },
      trends: trendData,
      scorecard: score,
      generatedAt: new Date().toISOString()
    }
  };
}

module.exports = { reports };
