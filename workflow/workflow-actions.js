const approval = require("./workflow-approval");

function buildActions(workflow = {}, input = {}, intelligence = {}) {
  return (workflow.actions || []).map((type) => {
    const action = actionFor(type, workflow, input, intelligence);
    const needsApproval = approval.requireApproval(action);
    return {
      ...action,
      status: needsApproval && input.approved !== true ? "needs_approval" : "ready",
      approvalRequired: needsApproval
    };
  });
}

function executeAction(action = {}) {
  if (action.status === "needs_approval") {
    return {
      ok: true,
      status: "needs_approval",
      action,
      message: "Action queued for owner approval."
    };
  }
  return {
    ok: true,
    status: "completed",
    action,
    message: "Action completed as an internal workflow record."
  };
}

function actionFor(type, workflow, input, intelligence) {
  const subject = input.subject || input.customerName || input.name || workflow.event;
  const service = input.service || "CompHelp Service";
  const base = {
    type,
    workflowId: workflow.workflowId,
    event: workflow.event,
    subject,
    service,
    createdAt: new Date().toISOString()
  };
  if (type === "create_task") return { ...base, title: `Review ${workflow.event}: ${subject}`, customerFacing: false };
  if (type === "notify_owner") return { ...base, title: `Notify owner about ${workflow.event}`, customerFacing: false };
  if (type === "queue_followup") return { ...base, title: `Draft follow-up for ${subject}`, customerFacing: true, recommendation: intelligence.recommendedAction || "Create an owner-approved follow-up draft." };
  if (type === "queue_review_request") return { ...base, title: `Draft review request for ${subject}`, customerFacing: true };
  if (type === "request_approval") return { ...base, title: `Request owner approval for ${workflow.name}`, customerFacing: false };
  return { ...base, title: `Run ${type}`, customerFacing: false };
}

module.exports = {
  buildActions,
  executeAction
};
