const approval = require("./workflow-approval");
const { evaluate } = require("../policy/action-risk-policy");

const POLICY_ACTION_BY_TYPE = {
  create_task: "workflow.task.record",
  notify_owner: "owner.notification.record",
  queue_followup: "lead.followup.draft",
  queue_review_request: "review.request.draft",
  request_approval: "approval.request.record"
};

function buildActions(workflow = {}, input = {}, intelligence = {}) {
  return (workflow.actions || []).map((type) => {
    const action = actionFor(type, workflow, input, intelligence);
    const gate = approval.approvalStatus({}, { policyAction: action.policyAction, policyContext: action.policyContext });
    return {
      ...action,
      status: gate.status === "blocked" ? "blocked" : gate.required ? "needs_approval" : "ready",
      approvalRequired: gate.required,
      policyDecision: gate.policy || null
    };
  });
}

function inspectAction(action = {}) {
  const expectedPolicyAction = POLICY_ACTION_BY_TYPE[action.type];
  if (!expectedPolicyAction) {
    return { action: action.type || "unknown", decision: "deny", riskClass: "prohibited", requiresApproval: false, reason: "Unregistered workflow action types are denied." };
  }
  if (action.policyAction && action.policyAction !== expectedPolicyAction) {
    return { action: expectedPolicyAction, decision: "deny", riskClass: "prohibited", requiresApproval: false, reason: "Workflow action policy mapping was modified or is invalid." };
  }
  return evaluate(expectedPolicyAction, action.policyContext || {});
}

function executeAction(action = {}) {
  const policy = inspectAction(action);
  if (action.status === "blocked" || policy.decision === "deny") {
    return {
      ok: false,
      status: "blocked",
      action,
      policy,
      message: policy.reason || "Action is blocked by policy."
    };
  }
  if (action.status === "needs_approval" || policy.decision === "pending_approval") {
    return {
      ok: true,
      status: "needs_approval",
      action,
      policy,
      message: "Action queued for owner approval."
    };
  }
  return {
    ok: true,
    status: "completed",
    action,
    policy,
    message: "Action completed as an internal workflow record."
  };
}

function actionFor(type, workflow, input, intelligence) {
  const subject = input.subject || input.customerName || input.name || workflow.event;
  const service = input.service || "CompHelp Service";
  const base = {
    type,
    policyAction: POLICY_ACTION_BY_TYPE[type] || "unknown.action",
    policyContext: { ...input },
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
  POLICY_ACTION_BY_TYPE,
  buildActions,
  executeAction,
  inspectAction
};
