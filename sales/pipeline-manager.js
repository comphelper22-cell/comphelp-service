const { scoreEstimates } = require("./estimate-scoring");
const { prioritizeDeals } = require("./deal-priority");
const { analyzeCustomers } = require("./customer-intelligence");

const stages = ["Lead", "Qualification", "Estimate", "Follow-up", "Negotiation", "Won", "Lost"];

function buildPipeline(data = {}) {
  const leads = Array.isArray(data.leads) ? data.leads : [];
  const estimates = Array.isArray(data.estimates) ? data.estimates : [];
  const customerIntel = analyzeCustomers(data);
  const scoredEstimates = scoreEstimates(data);
  const activeEstimates = scoredEstimates.filter((estimate) => !/won|approved|accepted|lost|rejected|cancel/i.test(String(estimate.status || "")));
  const prioritizedDeals = prioritizeDeals(activeEstimates, customerIntel);
  const stageCounts = stages.reduce((acc, stage) => ({ ...acc, [stage]: 0 }), {});
  leads.forEach((lead) => {
    stageCounts[normalizeLeadStage(lead.status)] += 1;
  });
  estimates.forEach((estimate) => {
    stageCounts[normalizeEstimateStage(estimate.status)] += 1;
  });
  return {
    stages,
    stageCounts,
    leads,
    scoredEstimates,
    prioritizedDeals,
    customerIntel
  };
}

function normalizeLeadStage(status) {
  const value = String(status || "").toLowerCase();
  if (/contact|qualified/.test(value)) return "Qualification";
  if (/quote|estimate/.test(value)) return "Estimate";
  if (/follow/.test(value)) return "Follow-up";
  if (/won/.test(value)) return "Won";
  if (/lost/.test(value)) return "Lost";
  return "Lead";
}

function normalizeEstimateStage(status) {
  const value = String(status || "").toLowerCase();
  if (/won|approved|accepted/.test(value)) return "Won";
  if (/lost|rejected|cancel/.test(value)) return "Lost";
  if (/negotiat/.test(value)) return "Negotiation";
  if (/follow/.test(value)) return "Follow-up";
  return "Estimate";
}

module.exports = {
  buildPipeline,
  stages
};
