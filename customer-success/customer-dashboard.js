const { health } = require("./customer-health");
const { ltv } = require("./customer-ltv");
const { risks } = require("./customer-risk");
const { vip } = require("./vip-customers");
const { lost } = require("./lost-customers");
const { timeline } = require("./customer-timeline");
const { segments } = require("./customer-segments");
const { recommendations } = require("./customer-recommendations");

function dashboard(input = {}) {
  const healthData = health(input).data;
  const ltvData = ltv(input).data;
  const riskData = risks(input).data;
  const vipData = vip(input).data;
  const lostData = lost(input).data;
  const timelineData = timeline(input).data;
  const segmentData = segments(input).data;
  const recommendationData = recommendations(input).data;
  return {
    ok: true,
    data: {
      customerHealthScore: healthData.overallScore,
      customerHealthStatus: healthData.status,
      vipCustomers: vipData,
      atRiskCustomers: riskData,
      lostCustomers: lostData,
      customerLifetimeValue: ltvData,
      customerTimeline: timelineData,
      repeatRevenueOpportunities: ltvData.filter((customer) => customer.repeatPotential === "high").slice(0, 5),
      followupNeeded: riskData.filter((customer) => customer.priority === "HIGH" || customer.priority === "MEDIUM"),
      reviewsNeeded: healthData.customers.filter((customer) => customer.completedJobs > 0).slice(0, 5).map((customer) => ({
        customerName: customer.customerName,
        service: customer.service,
        recommendedAction: "Ask for a review only after owner approval."
      })),
      customerSegments: segmentData,
      aiCustomerRecommendations: recommendationData,
      generatedAt: new Date().toISOString()
    }
  };
}

module.exports = { dashboard };
