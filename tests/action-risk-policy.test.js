const assert = require("assert");
const policy = require("../policy/action-risk-policy");

assert.deepStrictEqual(policy.RISK_CLASSES, ["observe", "draft", "bounded", "approval_required", "prohibited"]);
assert.ok(Object.keys(policy.ACTIONS).length >= 15);

Object.entries(policy.ACTIONS).forEach(([action, rule]) => {
  assert.match(action, /^[a-z0-9.-]+$/);
  assert.ok(policy.RISK_CLASSES.includes(rule.riskClass));
  assert.ok(rule.reason);
  assert.ok(rule.ownerAgent);
  assert.ok(Array.isArray(rule.requiredContext));
});

assert.deepStrictEqual(policy.evaluate("analytics.read"), {
  action: "analytics.read",
  decision: "allow",
  riskClass: "observe",
  requiresApproval: false,
  reason: policy.ACTIONS["analytics.read"].reason
});
assert.strictEqual(policy.evaluate("content.draft", { organizationId: "org_1" }).decision, "allow");
assert.strictEqual(policy.evaluate("vendor.dispatch", { jobId: "job_1", vendorId: "vendor_1", approvedQuoteId: "quote_1" }).decision, "pending_approval");
assert.strictEqual(policy.evaluate("customer.quote.send", { customerId: "customer_1", estimateId: "estimate_1" }).requiresApproval, true);
assert.strictEqual(policy.evaluate("payment.charge", { customerId: "customer_1", invoiceId: "invoice_1", amount: 100, currency: "USD" }).decision, "pending_approval");
assert.strictEqual(policy.evaluate("refund.issue", { paymentId: "payment_1", amount: 25, reason: "Customer-approved cancellation" }).decision, "pending_approval");
assert.strictEqual(policy.evaluate("social.publish", { contentId: "content_1", platform: "instagram", approvedMediaIds: ["media_1"] }).decision, "pending_approval");
assert.strictEqual(policy.evaluate("credential.expose").decision, "deny");
assert.strictEqual(policy.evaluate("unknown.action").decision, "deny");
assert.strictEqual(policy.evaluate("analytics.read", null).decision, "deny", "Null policy context must fail closed instead of throwing.");

assert.strictEqual(policy.evaluate("customer.profile.read").decision, "deny", "Missing authorization context must fail closed.");
[
  { organizationId: [], authorizedUserId: "user_1" },
  { organizationId: "org_1", authorizedUserId: false },
  { organizationId: "   ", authorizedUserId: "user_1" }
].forEach((context) => assert.strictEqual(policy.evaluate("customer.profile.read", context).decision, "deny", "Malformed authorization context must fail closed."));
assert.strictEqual(policy.evaluate("customer.profile.read", { organizationId: "org_1", authorizedUserId: "user_1" }).decision, "allow");
assert.strictEqual(policy.evaluate("lead.followup.send", { boundedActions: [] }).decision, "deny", "Required context must be validated before approval evaluation.");
const boundedFollowup = { boundedActions: ["lead.followup.send"], leadId: "lead_1", approvedTemplateId: "template_1" };
assert.strictEqual(policy.evaluate("lead.followup.send", { ...boundedFollowup, amount: 1 }).decision, "pending_approval", "Bounded automation stays disabled until a verified approval store exists.");
assert.strictEqual(policy.evaluate("lead.followup.send", { ...boundedFollowup, amount: 11 }).decision, "deny", "Bounded actions above the configured maximum must fail closed.");
assert.strictEqual(policy.evaluate("lead.followup.send", { ...boundedFollowup, amount: -1 }).decision, "deny");
[null, "", " ", false, true, [], [1], "1", "invalid"].forEach((amount) => {
  assert.strictEqual(policy.evaluate("lead.followup.send", { ...boundedFollowup, amount }).decision, "deny", `Coercible amount ${JSON.stringify(amount)} must fail closed.`);
});
assert.strictEqual(policy.evaluate("payment.charge", { customerId: "customer_1", invoiceId: "invoice_1", amount: "100", currency: "usd" }).decision, "deny", "Malformed financial context must fail closed.");
assert.strictEqual(policy.evaluate("payment.charge", { customerId: "customer_1", invoiceId: "invoice_1", amount: 100, currency: "ZZZ" }).decision, "deny", "Unsupported currencies must fail closed.");
const sparseMediaIds = new Array(1);
assert.strictEqual(policy.evaluate("social.publish", { contentId: "content_1", platform: "instagram", approvedMediaIds: sparseMediaIds }).decision, "deny", "Sparse evidence arrays must fail closed.");
assert.strictEqual(policy.evaluate("lead.followup.send", { ...boundedFollowup, amount: 1, emergencyStop: true }).decision, "deny");

const workflowApproval = require("../workflow/workflow-approval");
assert.strictEqual(workflowApproval.requireApproval({ policyAction: "vendor.dispatch" }), true);
assert.strictEqual(workflowApproval.requireApproval({ policyAction: "analytics.read" }), false);
assert.strictEqual(workflowApproval.requireApproval({ policyAction: "credential.expose" }), true, "Prohibited actions must fail closed for boolean callers.");
assert.strictEqual(workflowApproval.requireApproval({ policyAction: "unknown.action" }), true, "Unknown actions must fail closed for boolean callers.");
assert.strictEqual(workflowApproval.approvalStatus({}, { policyAction: "payment.charge", policyContext: { customerId: "customer_1", invoiceId: "invoice_1", amount: 100, currency: "USD" }, approved: true }).status, "needs_approval", "Caller-controlled booleans cannot approve policy actions.");
assert.strictEqual(workflowApproval.approvalStatus({ approvalRequired: true }, { approved: true }).status, "needs_approval", "Policy-less caller booleans cannot approve workflows.");
assert.strictEqual(workflowApproval.approvalStatus({ approvalRequired: true }, { policyAction: "analytics.read" }).status, "needs_approval", "Policy allow cannot bypass workflow approval.");
assert.strictEqual(workflowApproval.approvalStatus({}, { policyAction: "credential.expose" }).status, "blocked");
assert.strictEqual(workflowApproval.approvalStatus({}, { policyAction: "analytics.read" }).status, "approved");

console.log(JSON.stringify({ ok: true, actionRiskPolicy: "enforced" }, null, 2));
