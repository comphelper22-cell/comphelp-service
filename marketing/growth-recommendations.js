const recommendationEngine = require("../brain/recommendation/recommendation-engine");
const { leadSources } = require("./lead-sources");
const { localSeo } = require("./local-seo");
const { roi } = require("./marketing-roi");

function recommendations(input = {}) {
  const leads = leadSources(input).data;
  const seo = localSeo(input).data;
  const roiData = roi(input).data;
  const base = recommendationEngine.generate({ category: "Marketing", record: false }).data.recommendations;
  const custom = [
    {
      title: "Double down on top lead source",
      category: "Marketing",
      priority: "HIGH",
      description: `Current top source is ${leads.topSource}. Create one focused campaign for that source.`
    },
    {
      title: "Improve local SEO coverage",
      category: "Marketing",
      priority: seo.localSeoHealth < 80 ? "HIGH" : "MEDIUM",
      description: seo.recommendedAction
    },
    {
      title: "Track campaign ROI",
      category: "Marketing",
      priority: roiData.status === "needs_more_data" ? "MEDIUM" : "LOW",
      description: "Add spend, leads, and revenue for each campaign before scaling budget."
    }
  ];
  return {
    ok: true,
    data: [...custom, ...base].slice(0, 10)
  };
}

module.exports = { recommendations };
