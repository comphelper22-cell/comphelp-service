function createDecision(input = {}) {
  return {
    confidence: Number(input.confidence || 0.72),
    reason: input.reason || "Architecture-first recommendation based on current internal context.",
    priority: input.priority || "medium",
    risk: input.risk || "low",
    recommendedAction: input.recommendedAction || "Review with owner before execution.",
    requiresApproval: input.requiresApproval !== false
  };
}

function decisionStatus() {
  return {
    ok: true,
    status: "architecture_ready",
    policy: "Every important decision includes confidence, reason, priority, risk, and recommendedAction.",
    automationEnabled: false
  };
}

module.exports = { createDecision, decisionStatus };
