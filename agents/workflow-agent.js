const workflowEngine = require("../workflow/workflow-engine");

const agentDefinition = {
  name: "Workflow Agent",
  role: "Unified automation orchestration agent",
  mission: "Coordinate approval-aware workflows for every AI Employee through one shared engine.",
  responsibilities: [
    "Verify workflow registry health",
    "Build event-based workflows",
    "Validate approval requirements",
    "Run safe internal workflow actions",
    "Track execution history",
    "Report errors, warnings, and audit trail"
  ],
  inputs: ["Event name", "Business payload", "Approval state", "AI module recommendations"],
  outputs: ["Workflow execution status", "Execution history", "Errors", "Warnings", "Audit trail"],
  kpis: ["Workflow completion rate", "Pending approval count", "Execution error count", "Average execution time"],
  escalationRules: [
    "Escalate customer-facing actions for owner approval.",
    "Never connect external AI providers or messaging providers from the workflow layer.",
    "Never execute discounts, outreach, dispatch, publishing, push, or deploy without approval."
  ]
};

function run(input = {}) {
  const status = workflowEngine.status();
  const execution = input.event ? workflowEngine.trigger(input) : null;
  return {
    ...agentDefinition,
    ok: execution ? execution.ok : status.ok,
    status: status.status,
    engine: status,
    execution,
    history: workflowEngine.history(10),
    generatedAt: new Date().toISOString()
  };
}

module.exports = {
  ...agentDefinition,
  run
};
