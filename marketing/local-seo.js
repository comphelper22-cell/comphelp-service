const { readMarketingData } = require("./lead-sources");

function localSeo(input = {}) {
  const data = readMarketingData(input);
  const seoIdeas = data.marketingIdeas.filter((idea) => /seo|page|keyword/i.test(String(idea.type || idea.source || "")));
  const cityCoverage = new Set(data.leads.map((lead) => lead.city).filter(Boolean));
  const score = Math.min(100, 55 + seoIdeas.length * 8 + cityCoverage.size * 5);
  return {
    ok: true,
    data: {
      demoMode: data.demoMode,
      localSeoHealth: score,
      status: score >= 80 ? "healthy" : score >= 60 ? "watch" : "needs_attention",
      cityCoverage: Array.from(cityCoverage),
      keywordIdeas: [
        "Security Camera Installation Los Angeles",
        "WiFi Installation Los Angeles",
        "Computer Repair Los Angeles",
        "Data Recovery Los Angeles"
      ],
      recommendedAction: "Create or refresh one local service page and one Google Business post each week.",
      generatedAt: new Date().toISOString()
    }
  };
}

module.exports = { localSeo };
