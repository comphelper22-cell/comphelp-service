const { calculateKpis } = require("./executive-kpi");
const { detectRisks } = require("./executive-risk");
const { opportunities } = require("./executive-opportunities");

function insights(input = {}) {
  const kpis = calculateKpis(input).data;
  const risks = detectRisks(input).data.risks;
  const opportunityItems = opportunities(input).data.opportunities;
  return {
    ok: true,
    data: {
      insights: [
        {
          title: "Revenue visibility",
          detail: kpis.revenueThisMonth > 0 ? "Revenue is being tracked through completed work." : "Revenue tracking will improve as completed projects and paid invoices are added."
        },
        {
          title: "Owner focus",
          detail: risks[0] ? risks[0].recommendedAction : "No urgent risk requires owner attention right now."
        },
        {
          title: "Growth lever",
          detail: opportunityItems[0] ? opportunityItems[0].description : "Add more lead and project data to identify stronger growth levers."
        }
      ],
      generatedAt: new Date().toISOString()
    }
  };
}

module.exports = {
  insights
};
