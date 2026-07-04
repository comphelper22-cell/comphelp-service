const { leadSources } = require("./lead-sources");
const { campaigns } = require("./campaigns");
const { localSeo } = require("./local-seo");
const { reviews } = require("./reviews-engine");
const { social } = require("./social-performance");
const { email } = require("./email-campaigns");
const { roi } = require("./marketing-roi");
const { recommendations } = require("./growth-recommendations");

function dashboard(input = {}) {
  const leads = leadSources(input).data;
  const campaignData = campaigns(input).data;
  const seoData = localSeo(input).data;
  const reviewData = reviews(input).data;
  const socialData = social(input).data;
  const emailData = email(input).data;
  const roiData = roi(input).data;
  const recs = recommendations(input).data;
  return {
    ok: true,
    data: {
      demoMode: leads.demoMode,
      leadsToday: leads.leadsToday,
      leadSources: leads.bySource,
      topLeadSource: leads.topSource,
      campaignPerformance: campaignData,
      marketingRoi: roiData,
      localSeoHealth: seoData,
      reviewsReputation: reviewData,
      socialMediaPerformance: socialData,
      emailCampaigns: emailData,
      growthOpportunities: recs.slice(0, 5),
      aiMarketingRecommendations: recs,
      generatedAt: new Date().toISOString()
    }
  };
}

module.exports = { dashboard };
