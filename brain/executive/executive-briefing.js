const recommendationEngine = require("../recommendation/recommendation-engine");
const { summary } = require("./executive-summary");
const { forecast } = require("./executive-forecast");
const { insights } = require("./executive-insights");

function briefing(input = {}) {
  const executiveSummary = summary(input).data;
  const forecasts = forecast(input).data;
  const insightReport = insights(input).data.insights;
  const aiRecommendations = recommendationEngine.generate({ ...input, record: false }).data.aiPriorityQueue;
  return {
    ok: true,
    data: {
      title: "Daily Executive Briefing",
      executiveSummary: executiveSummary.executiveSummary,
      businessHealthScore: executiveSummary.businessHealthScore,
      kpis: executiveSummary.kpis,
      forecasts,
      risks: executiveSummary.risks,
      opportunities: executiveSummary.opportunities,
      insights: insightReport,
      aiRecommendations,
      generatedAt: new Date().toISOString()
    }
  };
}

module.exports = {
  briefing
};
