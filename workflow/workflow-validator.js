const registry = require("./workflow-registry");

function validateWorkflow(workflow = {}) {
  const errors = [];
  if (!workflow.workflowId) errors.push("Missing workflowId.");
  if (!workflow.event) errors.push("Missing workflow event.");
  if (!Array.isArray(workflow.actions) || !workflow.actions.length) errors.push("Workflow must include at least one action.");
  if (workflow.event && !registry.events().includes(workflow.event)) errors.push(`Unsupported event: ${workflow.event}.`);
  return {
    ok: errors.length === 0,
    errors,
    warnings: workflow.approvalRequired ? ["Workflow requires owner approval before risky actions execute."] : []
  };
}

function validateExecution(input = {}) {
  const errors = [];
  if (!input.event) errors.push("Missing event.");
  if (input.event && !registry.events().includes(input.event)) errors.push(`Unsupported event: ${input.event}.`);
  return {
    ok: errors.length === 0,
    errors,
    warnings: []
  };
}

module.exports = {
  validateExecution,
  validateWorkflow
};
