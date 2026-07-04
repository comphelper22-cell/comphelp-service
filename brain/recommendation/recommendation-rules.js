function selectTemplates(registry, input = {}) {
  const requested = input.type || input.recommendationType;
  if (requested) return [registry.find(requested)];

  const category = normalize(input.category);
  const templates = registry.list();
  if (category) return templates.filter((template) => normalize(template.category) === category);

  return [
    registry.find("dailyPriorities"),
    registry.find("callCustomerNext"),
    registry.find("highestProbabilityEstimate"),
    registry.find("upsellOpportunity"),
    registry.find("followUpOverdue"),
    registry.find("scheduleOptimization"),
    registry.find("revenueOpportunity"),
    registry.find("vipFollowUp"),
    registry.find("businessRisks"),
    registry.find("growthOpportunities")
  ];
}

function estimateRevenue(template, input = {}) {
  const projectValue = Number(input.projectValue || input.estimateValue || input.estimatedRevenue || 0);
  if (projectValue > 0) return Math.round(projectValue);
  const defaults = {
    upsellOpportunity: 250,
    highestProbabilityEstimate: 899,
    revenueOpportunity: 750,
    maintenanceReminder: 149,
    highValueInvoice: 1200,
    bestPromotion: 500,
    growthOpportunities: 1000
  };
  return defaults[template.type] || 0;
}

function reasoningFor(template, input = {}) {
  const service = input.service || "service work";
  const city = input.city || "Los Angeles";
  return [
    `${template.title} maps to the current ${template.category.toLowerCase()} priority.`,
    `The recommendation is relevant for ${service} in ${city}.`,
    "No external AI provider was used; this is rule-based and explainable.",
    "Owner approval is required before any customer, vendor, or marketing action."
  ];
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

module.exports = {
  estimateRevenue,
  reasoningFor,
  selectTemplates
};
