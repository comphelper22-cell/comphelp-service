const contextEngine = require("../brain/context/context-engine");

const agent = {
  name: "CompHelp Context Agent",
  role: "Context diagnostics and scoring agent",
  mission: "Ensure CompHelp AI understands the current operating context before recommendations or decisions.",
  responsibilities: ["Context diagnostics", "Context validation", "Missing context detection", "Context scoring", "Context health report"],
  inputs: ["customer", "organization", "user", "session", "job", "task", "conversation", "memory", "knowledge", "preferences", "permissions"],
  outputs: ["context status", "context package", "validation report", "score report", "registry report"],
  KPIs: ["overall context score", "missing context count", "provider coverage", "context package completeness"],
  escalationRules: ["Escalate customer privacy gaps, missing permissions, low context score, and requests for external AI integration."]
};

function status(input = {}) {
  const inspection = contextEngine.inspect(input);
  return {
    ok: true,
    agent: agent.name,
    status: inspection.validation.status,
    overallContextScore: inspection.score.overallContextScore,
    missing: inspection.validation.missing,
    registry: contextEngine.registry()
  };
}

function run(context = {}) {
  return {
    ok: true,
    agent: agent.name,
    role: agent.role,
    diagnostics: status(context),
    context: contextEngine.build(context),
    validation: contextEngine.validate(context),
    score: contextEngine.score(context),
    registry: contextEngine.registry()
  };
}

module.exports = { ...agent, run, status };
