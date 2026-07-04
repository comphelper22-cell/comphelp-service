const actions = require("./workflow-actions");
const history = require("./workflow-history");
const events = require("./workflow-events");

function run(builtWorkflow = {}) {
  const startedAt = Date.now();
  const workflow = builtWorkflow.workflow || {};
  const approval = builtWorkflow.approval || {};
  const actionResults = (builtWorkflow.actions || []).map(actions.executeAction);
  const errors = actionResults.filter((result) => result.ok === false).map((result) => result.message || "Action failed.");
  const warnings = [];
  if (approval.status === "needs_approval") warnings.push("Some actions are waiting for owner approval.");
  const status = errors.length ? "failed" : warnings.length ? "needs_approval" : "completed";
  const execution = {
    executionId: `workflow_exec_${Date.now()}`,
    workflowId: workflow.workflowId,
    workflowName: workflow.name,
    event: workflow.event,
    status,
    approval,
    actions: actionResults,
    errors,
    warnings,
    durationMs: Date.now() - startedAt,
    auditTrail: [
      { step: "built", timestamp: builtWorkflow.builtAt || new Date().toISOString() },
      { step: "executed", timestamp: new Date().toISOString(), status }
    ],
    executedAt: new Date().toISOString()
  };
  events.emit("workflow_execution", `Workflow ${workflow.workflowId} ${status}.`, { executionId: execution.executionId, event: workflow.event });
  history.record(execution);
  return { ok: errors.length === 0, data: execution };
}

module.exports = {
  run
};
