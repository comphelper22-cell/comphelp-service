const { evaluate } = require("./decision-evaluator");
const { history } = require("./decision-history");
const { policies } = require("./decision-policy");
const { status: registryStatus } = require("./decision-registry");
const { scoreDecision } = require("./decision-score");
const { validateDecision } = require("./decision-validator");

function status() {
  return {
    ok: true,
    status: "ready",
    engine: "Business Decision Engine",
    registry: registryStatus(),
    policies: policies(),
    externalAiConnected: false
  };
}

function score(input = {}) {
  return { ok: true, data: scoreDecision(input) };
}

function validate(input = {}) {
  return { ok: true, data: validateDecision(input.decision || input) };
}

function explain(input = {}) {
  const result = evaluate({ ...input, record: false });
  return {
    ok: true,
    data: {
      explanation: result.data.decision.reasoning,
      decision: result.data.decision,
      validation: result.data.validation
    }
  };
}

module.exports = {
  evaluate,
  explain,
  history,
  policies,
  registryStatus,
  score,
  status,
  validate
};
