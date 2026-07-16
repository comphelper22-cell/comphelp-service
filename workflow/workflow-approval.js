const { evaluate } = require("../policy/action-risk-policy");

function approvalStatus(workflow = {}, input = {}) {
  const policy = input.policyAction ? evaluate(input.policyAction, input.policyContext || input) : null;
  if (policy && policy.decision === "deny") {
    return {
      required: false,
      approved: false,
      status: "blocked",
      message: policy.reason,
      policy
    };
  }

  const workflowRequiresApproval = workflow.approvalRequired === true || input.approvalRequired === true;
  const policyRequiresApproval = Boolean(policy && policy.decision === "pending_approval");
  const required = workflowRequiresApproval || policyRequiresApproval;

  // No caller-provided boolean can satisfy an approval requirement.
  // Approval remains pending until a durable server-verified approval record exists.
  const approved = !required && (!policy || ["allow", "allow_bounded"].includes(policy.decision));

  return {
    required,
    approved,
    status: required && !approved ? "needs_approval" : "approved",
    message: required && !approved
      ? "Owner approval is required before this workflow can execute risky actions."
      : "Workflow is approved for safe execution.",
    ...(policy ? { policy } : {})
  };
}

function requireApproval(action = {}) {
  if (action.policyAction) {
    const result = evaluate(action.policyAction, action.policyContext || action);
    return !["allow", "allow_bounded"].includes(result.decision);
  }
  return ["queue_followup", "queue_review_request", "request_approval"].includes(action.type) || action.customerFacing === true;
}

module.exports = {
  approvalStatus,
  requireApproval
};
