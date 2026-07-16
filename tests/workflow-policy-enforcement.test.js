const assert = require("assert");
const runner = require("../workflow/workflow-runner");
const actions = require("../workflow/workflow-actions");
const emergencyStop = require("../policy/emergency-stop");
const builder = require("../workflow/workflow-builder");

const rawApprovedBuild = builder.build({ workflowId: "wf_raw_approval", name: "Raw Approval", event: "Test", approvalRequired: true, actions: ["create_task"] }, { approved: true }).data;
assert.strictEqual(rawApprovedBuild.approval.status, "needs_approval");
assert.strictEqual(runner.run(rawApprovedBuild).data.status, "needs_approval", "Raw approved=true cannot complete a workflow.");

const blockedRun = runner.run({
  workflow: { workflowId: "wf_blocked", name: "Blocked", event: "Test" },
  approval: { status: "blocked", message: "Prohibited action." },
  actions: [{ type: "create_task", policyAction: "workflow.task.record", policyContext: {}, status: "ready" }]
});
assert.strictEqual(blockedRun.ok, false);
assert.strictEqual(blockedRun.data.status, "blocked");
assert.ok(blockedRun.data.actions.every((item) => item.status === "blocked"));

const unknownAction = actions.executeAction({ type: "mystery", policyAction: "unknown.action", policyContext: {}, status: "ready" });
assert.strictEqual(unknownAction.ok, false);
assert.strictEqual(unknownAction.status, "blocked");

const prohibitedAction = actions.executeAction({ type: "leak", policyAction: "credential.expose", policyContext: {}, status: "ready" });
assert.strictEqual(prohibitedAction.ok, false);
assert.strictEqual(prohibitedAction.status, "blocked");

const tamperedAction = actions.executeAction({ type: "charge", policyAction: "workflow.task.record", policyContext: {}, status: "ready" });
assert.strictEqual(tamperedAction.status, "blocked", "Caller cannot pair an unknown/dangerous action type with a safe policy label.");
const mismatchedKnownAction = actions.executeAction({ type: "create_task", policyAction: "analytics.read", policyContext: {}, status: "ready" });
assert.strictEqual(mismatchedKnownAction.status, "blocked", "Known action types must reject mismatched policy labels.");

const moneyAction = actions.executeAction({
  type: "charge",
  policyAction: "payment.charge",
  policyContext: { customerId: "c1", invoiceId: "i1", amount: 50, currency: "USD", approved: true },
  status: "ready"
});
assert.strictEqual(moneyAction.status, "blocked", "Unregistered money actions remain blocked even with approved=true.");

const built = actions.buildActions({ workflowId: "wf_1", event: "New Lead", actions: ["create_task", "notify_owner", "queue_followup", "request_approval"] }, { leadId: "lead_1" }, {});
assert.ok(built.every((item) => item.policyAction), "Every executable action must map to a registered policy action.");
assert.ok(built.every((item) => item.policyContext && typeof item.policyContext === "object"));

emergencyStop.resetForTests();
assert.strictEqual(emergencyStop.isActive(), false);
emergencyStop.activate({ actorId: "owner_1", reason: "Security test" });
assert.strictEqual(emergencyStop.isActive(), true);
const stoppedAction = actions.executeAction({ type: "task", policyAction: "workflow.task.record", policyContext: {}, status: "ready" });
assert.strictEqual(stoppedAction.status, "blocked");
const stoppedPendingRun = runner.run({
  workflow: { workflowId: "wf_stopped_pending", name: "Stopped Pending", event: "Test" },
  approval: { status: "needs_approval" },
  actions: [{ type: "create_task", policyAction: "workflow.task.record", policyContext: {}, status: "needs_approval" }]
});
assert.strictEqual(stoppedPendingRun.data.status, "blocked", "Emergency stop must override needs_approval branches.");
emergencyStop.resetForTests();

const previousNodeEnv = process.env.NODE_ENV;
process.env.NODE_ENV = "production";
assert.strictEqual(emergencyStop.isActive(), true, "Production must fail closed without a shared emergency-stop provider.");
assert.throws(() => emergencyStop.resetForTests(), /unavailable in production/i);
if (previousNodeEnv === undefined) delete process.env.NODE_ENV;
else process.env.NODE_ENV = previousNodeEnv;
emergencyStop.resetForTests();

console.log(JSON.stringify({ ok: true, workflowPolicyEnforcement: "fail_closed" }, null, 2));
