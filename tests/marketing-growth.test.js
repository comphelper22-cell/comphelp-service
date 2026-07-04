const assert = require("assert");
const marketingEngine = require("../marketing/marketing-engine");

function run() {
  const result = marketingEngine.dashboard({ data: sampleData() });

  assert.strictEqual(result.ok, true, "Marketing dashboard should return ok.");
  assert.ok(result.data.leadsToday >= 0, "Leads today should exist.");
  assert.ok(result.data.leadSources, "Lead sources should exist.");
  assert.ok(result.data.campaignPerformance, "Campaign performance should exist.");
  assert.ok(result.data.marketingRoi, "Marketing ROI should exist.");
  assert.ok(result.data.localSeoHealth, "Local SEO health should exist.");
  assert.ok(result.data.reviewsReputation, "Reviews and reputation should exist.");
  assert.ok(result.data.socialMediaPerformance, "Social performance should exist.");
  assert.ok(result.data.emailCampaigns, "Email campaigns should exist.");
  assert.ok(Array.isArray(result.data.aiMarketingRecommendations), "AI marketing recommendations should exist.");

  return {
    ok: true,
    leadsToday: result.data.leadsToday,
    leadSourceCount: Object.keys(result.data.leadSources).length,
    campaignCount: result.data.campaignPerformance.campaigns.length,
    roiPercent: result.data.marketingRoi.roiPercent,
    recommendations: result.data.aiMarketingRecommendations.length
  };
}

function sampleData() {
  return {
    leads: [
      { name: "Camera Lead", source: "website", city: "Los Angeles", service: "Security Camera Installation", createdAt: new Date().toISOString() },
      { name: "WiFi Lead", source: "instagram", city: "Burbank", service: "WiFi & Network Installation", createdAt: new Date().toISOString() }
    ],
    campaigns: [
      { name: "Local Camera SEO", channel: "SEO", spend: 250, leads: 6, revenue: 2400 },
      { name: "Review Request Push", channel: "Email", spend: 80, leads: 2, revenue: 700 }
    ],
    marketingIdeas: [
      { title: "Create Glendale camera installation page", city: "Glendale", keyword: "security camera installation Glendale" }
    ],
    reviews: [
      { rating: 5, source: "Google", customerName: "Local Customer" }
    ],
    socialPosts: [
      { title: "Before and after camera install", status: "draft", platform: "Instagram", reach: 450 }
    ],
    emailCampaigns: [
      { title: "Camera maintenance reminder", status: "draft", leads: 1 }
    ]
  };
}

if (require.main === module) {
  console.log(JSON.stringify(run(), null, 2));
}

module.exports = { run };
