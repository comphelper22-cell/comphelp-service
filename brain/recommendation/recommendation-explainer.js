function explainRecommendation(input = {}) {
  const recommendation = input.recommendation || input;
  return {
    ok: true,
    data: {
      recommendationId: recommendation.recommendationId,
      title: recommendation.title,
      explanation: [
        `Category: ${recommendation.category || "Management"}.`,
        `Priority: ${recommendation.priority || "MEDIUM"} with confidence ${recommendation.confidence || 0}.`,
        `Estimated business impact: ${recommendation.estimatedBusinessImpact || "business improvement"}.`,
        "This recommendation is rule-based, explainable, and requires owner approval before execution."
      ],
      reasoning: recommendation.reasoning || [],
      safeToAutoExecute: false
    }
  };
}

module.exports = {
  explainRecommendation
};
