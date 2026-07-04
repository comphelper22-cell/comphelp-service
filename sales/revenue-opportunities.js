function findRevenueOpportunities(prioritizedDeals = [], customerIntel = {}) {
  const opportunities = [];
  const topDeal = prioritizedDeals[0];
  if (topDeal) {
    opportunities.push({
      type: "estimate_conversion",
      title: "Close highest priority estimate",
      expectedRevenue: topDeal.expectedRevenue,
      probability: topDeal.probability,
      recommendedAction: topDeal.recommendedAction
    });
  }
  opportunities.push({
    type: "upsell",
    title: "Offer maintenance or add-on service",
    expectedRevenue: 149,
    probability: 0.58,
    recommendedAction: "Offer camera, WiFi, computer, or backup maintenance during the next customer conversation."
  });
  opportunities.push({
    type: "cross_sell",
    title: "Cross-sell connected services",
    expectedRevenue: 249,
    probability: 0.52,
    recommendedAction: "For camera customers, ask about WiFi reliability; for computer customers, ask about backup and data protection."
  });
  if (customerIntel.vipCustomers && customerIntel.vipCustomers.length) {
    opportunities.push({
      type: "vip_customer",
      title: "VIP customer follow-up",
      expectedRevenue: 399,
      probability: 0.68,
      recommendedAction: "Follow up personally with a VIP or repeat customer."
    });
  }
  return opportunities;
}

module.exports = {
  findRevenueOpportunities
};
