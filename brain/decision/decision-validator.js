const { DECISION_TYPES } = require("./decision-registry");

function validateDecision(decision = {}) {
  const missing = ["decisionId", "type", "recommendedAction", "confidence", "priority", "risk", "reasoning", "usedMemory", "usedContext", "alternatives", "timestamp"].filter((key) => decision[key] === undefined);
  const errors = [];
  if (!DECISION_TYPES[decision.type]) errors.push("unknown_decision_type");
  if (Number(decision.confidence) < 0 || Number(decision.confidence) > 1) errors.push("confidence_out_of_range");
  if (!Array.isArray(decision.reasoning)) errors.push("reasoning_must_be_array");
  return {
    ok: missing.length === 0 && errors.length === 0,
    missing,
    errors,
    status: missing.length || errors.length ? "needs_review" : "valid"
  };
}

module.exports = { validateDecision };
