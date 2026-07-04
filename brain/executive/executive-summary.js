const { calculateKpis } = require("./executive-kpi");
const { businessHealth } = require("./executive-health");
const { detectRisks } = require("./executive-risk");
const { opportunities } = require("./executive-opportunities");

function summary(input = {}) {
  const kpis = calculateKpis(input).data;
  const health = businessHealth(input).data;
  const risks = detectRisks(input).data.risks;
  const opportunityItems = opportunities(input).data.opportunities;
  return {
    ok: true,
    data: {
      executiveSummary: buildSummary(kpis, health, risks, opportunityItems),
      businessHealthScore: health,
      kpis,
      risks,
      opportunities: opportunityItems,
      generatedAt: new Date().toISOString()
    }
  };
}

function buildSummary(kpis, health, risks, opportunities) {
  return [
    `Business health is ${health.status} with an overall score of ${health.overallScore}.`,
    `Revenue this month is $${kpis.revenueThisMonth}; open estimates: ${kpis.openEstimates}; open jobs: ${kpis.openJobs}.`,
    risks.length ? `Top risk: ${risks[0].title}.` : "No major risks detected.",
    opportunities.length ? `Top opportunity: ${opportunities[0].title}.` : "Add more operating data to surface growth opportunities."
  ].join(" ");
}

module.exports = {
  summary
};
