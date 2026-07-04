const decisionEngine = require("../brain/decision/decision-engine");

const agent = {
  name: "CompHelp Decision Agent",
  role: "Business decision diagnostics and validation agent",
  mission: "Create explainable business decisions from context, memory, policies, and registered decision types.",
  responsibilities: ["decision diagnostics", "decision validation", "confidence analysis", "conflict detection", "recommendation handoff"],
  inputs: ["context package", "memory stats", "decision type", "policies", "business flags"],
  outputs: ["decision report", "confidence analysis", "validation report", "policy report"],
  KPIs: ["decision confidence", "validation pass rate", "policy coverage", "missing context reduction"],
  escalationRules: ["Escalate high-risk decisions, low confidence, policy conflicts, customer privacy risk, and external action requests."]
};

function status() {
  return {
    ok: true,
    agent: agent.name,
    status: "ready",
    engine: decisionEngine.status()
  };
}

function diagnostics(input = {}) {
  const evaluation = decisionEngine.evaluate({ ...input, record: false });
  const decision = evaluation.data.decision;
  const conflicts = [];
  if (decision.policies.includes("emergencyCall") && decision.policies.includes("afterHours")) conflicts.push("Emergency after-hours action requires owner approval.");
  if (decision.policies.includes("lowInventory") && decision.type === "jobScheduling") conflicts.push("Low inventory may conflict with scheduling.");
  return {
    ok: true,
    confidence: decision.confidence,
    conflicts,
    validation: evaluation.data.validation,
    handoff: decision.recommendedAction
  };
}

function run(context = {}) {
  return {
    ok: true,
    agent: agent.name,
    role: agent.role,
    status: status(),
    diagnostics: diagnostics(context),
    policies: decisionEngine.policies(),
    recentDecisions: decisionEngine.history(5)
  };
}

module.exports = { ...agent, diagnostics, run, status };
