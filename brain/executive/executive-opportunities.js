const recommendationEngine = require("../recommendation/recommendation-engine");
const { calculateKpis } = require("./executive-kpi");

function opportunities(input = {}) {
  const kpis = calculateKpis(input).data;
  const recommendations = recommendationEngine.generate({ ...input, record: false }).data;
  const items = [
    opportunity("revenue", "Convert open estimates", kpis.openEstimates ? "Follow up with open estimates that have booking potential." : "Create more qualified estimates from recent leads.", kpis.openEstimates * Math.max(kpis.averageJobValue || 399, 399)),
    opportunity("sales", "Book more security camera jobs", "Prioritize Security Camera Installation Los Angeles leads and free estimates.", 899),
    opportunity("customer", "Create maintenance reminders", "Offer camera, WiFi, and computer maintenance reminders for past customers.", 149),
    opportunity("marketing", "Publish local proof posts", "Use completed job media to create Instagram, Facebook, and Google Business drafts.", 0)
  ];
  return {
    ok: true,
    data: {
      opportunities: items,
      recommendationSummary: recommendations.recommendations.slice(0, 5),
      generatedAt: new Date().toISOString()
    }
  };
}

function opportunity(category, title, description, estimatedRevenue) {
  return {
    category,
    title,
    description,
    estimatedRevenue,
    confidence: estimatedRevenue > 0 ? 0.74 : 0.62
  };
}

module.exports = {
  opportunities
};
