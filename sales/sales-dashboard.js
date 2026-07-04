const executiveKpi = require("../brain/executive/executive-kpi");
const recommendationEngine = require("../brain/recommendation/recommendation-engine");
const { buildPipeline } = require("./pipeline-manager");
const { buildFollowups } = require("./followup-engine");
const { conversionMetrics } = require("./conversion-engine");
const { findRevenueOpportunities } = require("./revenue-opportunities");

function dashboard(input = {}) {
  const data = executiveKpi.readMarketplaceData(input);
  const pipeline = buildPipeline(data);
  const followups = buildFollowups(data, pipeline.prioritizedDeals);
  const conversion = conversionMetrics(data, pipeline.prioritizedDeals, followups);
  const opportunities = findRevenueOpportunities(pipeline.prioritizedDeals, pipeline.customerIntel);
  const recommendations = recommendationEngine.generate({ category: "Sales", record: false }).data.recommendations;
  const bestDeal = pipeline.prioritizedDeals[0] || null;
  return {
    ok: true,
    data: {
      salesOverview: {
        pipelineStages: pipeline.stageCounts,
        openDeals: pipeline.prioritizedDeals.length,
        bestNextCustomer: bestDeal ? bestDeal.customerName : pipeline.customerIntel.bestCustomerToCall.name,
        expectedRevenue: bestDeal ? bestDeal.expectedRevenue : 0,
        probability: bestDeal ? bestDeal.probability : 0,
        priority: bestDeal ? bestDeal.priority : "MEDIUM",
        recommendedAction: bestDeal ? bestDeal.recommendedAction : "Qualify the next lead and offer a free estimate.",
        reasoning: bestDeal ? [
          "This deal has the highest combined probability, value, urgency, and follow-up score.",
          "Owner approval is required before contacting the customer."
        ] : ["No open estimate is available yet; focus on qualifying new leads."]
      },
      revenuePipeline: conversion.revenuePipeline,
      highPriorityDeals: pipeline.prioritizedDeals.filter((deal) => deal.priority === "HIGH"),
      todaysCalls: followups.todaysCalls,
      todaysFollowups: followups.todaysFollowups,
      revenueForecast: {
        expectedRevenue: conversion.revenuePipeline,
        confidence: pipeline.prioritizedDeals.length ? 0.7 : 0.42
      },
      aiRecommendations: recommendations,
      kpis: conversion,
      customerIntelligence: pipeline.customerIntel,
      revenueOpportunities: opportunities,
      generatedAt: new Date().toISOString()
    }
  };
}

module.exports = {
  dashboard
};
