const { priorityFor } = require("./recommendation-priority");
const { estimateRevenue, reasoningFor } = require("./recommendation-rules");
const { scoreRecommendation } = require("./recommendation-score");

function buildRecommendation(template, input = {}) {
  const priority = priorityFor(template, input);
  const estimatedRevenue = estimateRevenue(template, input);
  const confidence = confidenceFor(template, input);
  const score = scoreRecommendation({ priority, confidence, estimatedRevenue });
  const recommendation = {
    recommendationId: `rec_${Date.now()}_${template.type}`,
    title: template.title,
    description: descriptionFor(template, input),
    category: template.category,
    priority,
    confidence: score.confidence,
    priorityScore: score.priorityScore,
    businessValueScore: score.businessValueScore,
    estimatedBusinessImpact: template.estimatedBusinessImpact,
    estimatedRevenue,
    reasoning: reasoningFor(template, input),
    relatedCustomers: normalizeList(input.relatedCustomers || input.customers),
    relatedJobs: normalizeList(input.relatedJobs || input.jobs || input.projects),
    relatedMemory: normalizeList(input.relatedMemory || input.memoryScopes),
    relatedContext: normalizeList(input.relatedContext || input.contextKeys),
    requiresApproval: true,
    generatedAt: new Date().toISOString()
  };
  return recommendation;
}

function confidenceFor(template, input) {
  if (input.confidence) return Number(input.confidence);
  if (["dailyPriorities", "businessRisks", "growthOpportunities"].includes(template.type)) return 0.82;
  if (["highestProbabilityEstimate", "callCustomerNext", "followUpOverdue"].includes(template.type)) return 0.78;
  return 0.72;
}

function descriptionFor(template, input) {
  if (input.description) return input.description;
  const city = input.city || "Los Angeles";
  const service = input.service || "CompHelp Service work";
  return `${template.description} Focus: ${service} in ${city}.`;
}

function normalizeList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.slice(0, 10);
  return [value].filter(Boolean);
}

module.exports = {
  buildRecommendation
};
