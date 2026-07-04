const registry = require("./workflow-registry");
const triggers = require("./workflow-triggers");
const validator = require("./workflow-validator");
const builder = require("./workflow-builder");
const runner = require("./workflow-runner");
const historyStore = require("./workflow-history");
const events = require("./workflow-events");

function status() {
  return {
    ok: true,
    status: "ready",
    engine: "Workflow & Automation Engine",
    features: [
      "event_based_execution",
      "approval_workflows",
      "task_queues",
      "automation_rules",
      "retry_policies",
      "notifications",
      "execution_history",
      "audit_trail"
    ],
    registry: registry.status(),
    triggers: triggers.status(),
    externalAiConnected: false,
    autoExecutionEnabled: false
  };
}

function execute(input = {}) {
  const validation = validator.validateExecution(input);
  if (!validation.ok) return { ok: false, error: "invalid_workflow_execution", data: validation };
  const triggerResult = triggers.trigger(input.event, input);
  if (!triggerResult.ok) return { ok: false, error: "no_workflows_for_event", data: triggerResult };
  const executions = triggerResult.workflows.map((workflow) => {
    const workflowValidation = validator.validateWorkflow(workflow);
    if (!workflowValidation.ok) {
      return { ok: false, error: "invalid_workflow", data: workflowValidation };
    }
    const built = builder.build(workflow, input).data;
    return runner.run(built);
  });
  return {
    ok: executions.every((execution) => execution.ok),
    data: {
      event: input.event,
      executionStatus: executions.some((execution) => execution.data && execution.data.status === "needs_approval") ? "needs_approval" : "completed",
      executions,
      errors: executions.filter((execution) => !execution.ok).map((execution) => execution.error || "workflow_failed"),
      warnings: executions.flatMap((execution) => execution.data ? execution.data.warnings : []),
      generatedAt: new Date().toISOString()
    }
  };
}

function build(input = {}) {
  const workflows = registry.findByEvent(input.event);
  return {
    ok: workflows.length > 0,
    data: workflows.map((workflow) => builder.build(workflow, input).data)
  };
}

module.exports = {
  build,
  events: events.list,
  history: historyStore.history,
  registry: registry.list,
  status,
  trigger: execute,
  validate: validator.validateExecution
};
