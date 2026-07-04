const { readMarketingData } = require("./lead-sources");

function social(input = {}) {
  const data = readMarketingData(input);
  const drafts = data.socialPosts.filter((post) => /draft|planned|queued/i.test(String(post.status || ""))).length;
  const published = data.socialPosts.filter((post) => /published|posted/i.test(String(post.status || ""))).length;
  const reach = data.socialPosts.reduce((sum, post) => sum + Number(post.reach || post.views || 0), 0);
  return {
    ok: true,
    data: {
      demoMode: data.demoMode,
      drafts,
      published,
      reach,
      performanceStatus: published || reach ? "tracked" : "draft_mode",
      recommendedAction: "Create weekly local proof posts and before/after project posts.",
      generatedAt: new Date().toISOString()
    }
  };
}

module.exports = { social };
