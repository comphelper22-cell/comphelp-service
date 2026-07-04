const requiredFields = [
  "recommendationId",
  "title",
  "description",
  "category",
  "priority",
  "confidence",
  "estimatedBusinessImpact",
  "estimatedRevenue",
  "reasoning",
  "relatedCustomers",
  "relatedJobs",
  "relatedMemory",
  "relatedContext",
  "generatedAt"
];

function validateRecommendation(recommendation = {}) {
  const missing = requiredFields.filter((field) => recommendation[field] === undefined || recommendation[field] === null);
  const errors = [];
  if (missing.length) errors.push(`Missing fields: ${missing.join(", ")}`);
  if (!Array.isArray(recommendation.reasoning)) errors.push("Reasoning must be an array.");
  if (Number(recommendation.confidence) < 0 || Number(recommendation.confidence) > 1) errors.push("Confidence must be between 0 and 1.");
  return {
    ok: errors.length === 0,
    missing,
    errors
  };
}

function validateMany(recommendations = []) {
  const validations = recommendations.map(validateRecommendation);
  return {
    ok: validations.every((item) => item.ok),
    validations
  };
}

module.exports = {
  validateMany,
  validateRecommendation
};
