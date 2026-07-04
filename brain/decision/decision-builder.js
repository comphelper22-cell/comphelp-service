const { activePolicies, POLICIES } = require("./decision-policy");
const { scoreDecision } = require("./decision-score");

function id(type) {
  return `decision_${type}_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
}

function toPriority(score) {
  if (score >= 88) return "HIGH";
  if (score >= 74) return "MEDIUM";
  return "LOW";
}

function inferAction(type) {
  const actions = {
    leadQualification: "Qualify lead and prepare next best question.",
    estimatePriority: "Prepare estimate review queue item.",
    jobScheduling: "Review schedule window and confirm availability.",
    technicianAssignment: "Assign technician only after availability confirmation.",
    warrantyDecision: "Review warranty status before charging customer.",
    upsellOpportunity: "Create owner-approved upsell suggestion draft.",
    followUpReminder: "Create follow-up reminder draft.",
    customerRisk: "Escalate customer risk for owner review.",
    vendorSelection: "Recommend top vendor options for owner approval."
  };
  return actions[type] || "Review decision with owner.";
}

function buildDecision(input = {}) {
  const type = input.type || "leadQualification";
  const policies = activePolicies(input);
  const policyBoost = policies.reduce((sum, key) => sum + Number(POLICIES[key].priorityBoost || 0), 0);
  const risk = input.risk || (policies.includes("lowInventory") || policies.includes("technicianBusy") || policies.includes("afterHours") ? "MEDIUM" : "LOW");
  const score = scoreDecision({ contextScore: input.contextScore, policyBoost, risk });
  return {
    decisionId: input.decisionId || id(type),
    type,
    recommendedAction: input.recommendedAction || inferAction(type),
    confidence: score.confidence,
    priority: input.priority || toPriority(score.score),
    risk,
    reasoning: [
      `Decision type ${type} is registered for business review.`,
      `Context score baseline is ${Number(input.contextScore || 78)}.`,
      policies.length ? `Active policies: ${policies.join(", ")}.` : "No special policies were activated.",
      "Owner approval remains required for external actions."
    ],
    usedMemory: input.usedMemory || [],
    usedContext: input.usedContext || [],
    alternatives: input.alternatives || [
      { action: "Defer", reason: "Wait for more context." },
      { action: "Escalate", reason: "Ask owner to review before action." }
    ],
    score: score.score,
    grade: score.grade,
    policies,
    timestamp: new Date().toISOString()
  };
}

module.exports = { buildDecision };
