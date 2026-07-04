const priorityWeights = {
  CRITICAL: 100,
  HIGH: 82,
  MEDIUM: 58,
  LOW: 32
};

function scoreRecommendation(input = {}) {
  const confidence = clamp(Number(input.confidence || 0.75), 0, 1);
  const priority = String(input.priority || "MEDIUM").toUpperCase();
  const revenue = Number(input.estimatedRevenue || 0);
  const revenueScore = revenue > 5000 ? 100 : Math.min(100, Math.round(revenue / 50));
  const urgencyScore = priorityWeights[priority] || priorityWeights.MEDIUM;
  const businessValueScore = Math.round((confidence * 45) + (urgencyScore * 0.35) + (revenueScore * 0.2));
  return {
    confidence,
    priority,
    priorityScore: urgencyScore,
    estimatedRevenue: revenue,
    businessValueScore,
    quality: businessValueScore >= 80 ? "high" : businessValueScore >= 55 ? "medium" : "low"
  };
}

function clamp(value, min, max) {
  if (Number.isNaN(value)) return min;
  return Math.max(min, Math.min(max, value));
}

module.exports = {
  scoreRecommendation
};
