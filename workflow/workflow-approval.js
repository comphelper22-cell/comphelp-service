function approvalStatus(workflow = {}, input = {}) {
  const required = workflow.approvalRequired === true || input.approvalRequired === true;
  const approved = input.approved === true;
  return {
    required,
    approved,
    status: required && !approved ? "needs_approval" : "approved",
    message: required && !approved
      ? "Owner approval is required before this workflow can execute risky actions."
      : "Workflow is approved for safe execution."
  };
}

function requireApproval(action = {}) {
  return ["queue_followup", "queue_review_request", "request_approval"].includes(action.type) || action.customerFacing === true;
}

module.exports = {
  approvalStatus,
  requireApproval
};
