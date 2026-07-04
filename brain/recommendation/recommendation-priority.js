function prioritize(recommendations = []) {
  return recommendations.slice().sort((a, b) => {
    const priorityDiff = Number(b.priorityScore || 0) - Number(a.priorityScore || 0);
    if (priorityDiff !== 0) return priorityDiff;
    const valueDiff = Number(b.businessValueScore || 0) - Number(a.businessValueScore || 0);
    if (valueDiff !== 0) return valueDiff;
    return Number(b.estimatedRevenue || 0) - Number(a.estimatedRevenue || 0);
  });
}

function priorityFor(template, input = {}) {
  const urgent = input.urgency === "urgent" || input.risk === "high";
  const highRevenue = Number(input.estimatedRevenue || input.projectValue || 0) >= 1000;
  if (urgent || template.type === "businessRisks" || template.type === "lowSatisfactionAlert") return "HIGH";
  if (highRevenue || ["revenueOpportunity", "highestProbabilityEstimate", "upsellOpportunity"].includes(template.type)) return "HIGH";
  if (["dailyPriorities", "weeklyGoals", "maintenanceReminder"].includes(template.type)) return "MEDIUM";
  return "MEDIUM";
}

module.exports = {
  prioritize,
  priorityFor
};
