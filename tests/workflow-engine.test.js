const assert = require("assert");
const workflowEngine = require("../workflow/workflow-engine");

function run() {
  const status = workflowEngine.status();
  const built = workflowEngine.build({
    event: "New Lead",
    customerName: "Workflow Test Lead",
    service: "Security Camera Installation",
    city: "Los Angeles"
  });

  assert.strictEqual(status.ok, true, "Workflow engine should be ready.");
  assert.strictEqual(built.ok, true, "Workflow build should return ok.");
  assert.ok(built.data.length > 0, "At least one workflow should be built for New Lead.");
  assert.ok(built.data[0].actions.length > 0, "Built workflow should include actions.");
  assert.strictEqual(built.data[0].approval.status, "needs_approval", "New Lead workflow should require approval.");

  return {
    ok: true,
    status: status.status,
    workflowCount: status.registry.workflowCount,
    builtWorkflows: built.data.length,
    approvalStatus: built.data[0].approval.status
  };
}

if (require.main === module) {
  console.log(JSON.stringify(run(), null, 2));
}

module.exports = { run };
