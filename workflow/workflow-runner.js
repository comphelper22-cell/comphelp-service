const actions = require("./workflow-actions");
const history = require("./workflow-history");
const events = require("./workflow-events");

function run(builtWorkflow = {}) {
  const startedAt = Date.now();
  const workflow = builtWorkflow.workflow || {};
  const approval = builtWorkflow.approval || {};
  const policyChecks = (builtWorkflow.actions || []).map((action) => ({ action, policy: actions.inspectAction(action) }));
  const denied = policyChecks.find((item) => item.policy.decision === "deny");
  let actionResults;
  if (approval.status === "blocked" || denied) {
    const message = denied ? denied.policy.reason : approval.message || "Workflow is blocked by policy.";
    actionResults = (builtWorkflow.actions || []).map((action) => ({ ok: false, status: "blocked", action, message }));
  } else if (approval.status === "needs_approval") {
    actionResults = (builtWorkflow.actions || []).map((action) => ({ ok: true, status: "needs_approval", action, message: "Workflow is waiting for owner approval." }));
  } else {
    actionResults = (builtWorkflow.actions || []).map(actions.executeAction);
  }
  const errors = actionResults.filter((result) => result.ok === false).map((result) => result.message || "Action failed.");
  const warnings = [];
  if (approval.status === "needs_approval") warnings.push("Some actions are waiting for owner approval.");
  const status = approval.status === "blocked" || denied ? "blocked" : errors.length ? "failed" : warnings.length ? "needs_approval" : "completed";
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
  const recorded = history.record(execution);
  if (recorded.warnings && recorded.warnings.length) {
    execution.warnings = execution.warnings.concat(recorded.warnings);
  }
  return { ok: errors.length === 0, data: execution };
}

module.exports = {
  run
};
