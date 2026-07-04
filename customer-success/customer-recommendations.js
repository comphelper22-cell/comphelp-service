const recommendationEngine = require("../brain/recommendation/recommendation-engine");
const { health } = require("./customer-health");
const { risks } = require("./customer-risk");
const { vip } = require("./vip-customers");

function recommendations(input = {}) {
  const healthData = health(input).data;
  const riskCustomers = risks(input).data;
  const vipCustomers = vip(input).data;
  const engineRecommendations = recommendationEngine.generate({ category: "Customer", record: false }).data.recommendations;
  const custom = [];
  if (riskCustomers[0]) custom.push({
    title: `Follow up with ${riskCustomers[0].customerName}`,
    category: "Customer",
    priority: "HIGH",
    description: riskCustomers[0].recommendedAction
  });
  if (vipCustomers[0]) custom.push({
    title: `VIP check-in: ${vipCustomers[0].customerName}`,
    category: "Customer",
    priority: "MEDIUM",
    description: vipCustomers[0].recommendedAction
  });
  if (healthData.overallScore < 70) custom.push({
    title: "Improve customer health",
    category: "Customer",
    priority: "HIGH",
    description: "Review at-risk customers and complete follow-up tasks."
  });
  return {
    ok: true,
    data: [...custom, ...engineRecommendations].slice(0, 10)
  };
}

module.exports = { recommendations };
