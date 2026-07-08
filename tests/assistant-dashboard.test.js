const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { createAiOperationsAssistant } = require("../ai-operations-assistant/assistant");
const { writeJson } = require("../database/json-store");

const file = path.join(__dirname, "..", "tmp_assistant_dashboard.json");
if (fs.existsSync(file)) fs.unlinkSync(file);
const today = new Date().toISOString();
writeJson(file, {
  version: 1,
  customers: [{ id: "cust_1", fullName: "Dashboard Customer", status: "active", createdAt: today, updatedAt: today }],
  jobs: [{ id: "job_1", customerId: "cust_1", customerName: "Dashboard Customer", status: "scheduled", priority: "emergency", startDate: today }],
  invoices: [{ id: "inv_1", customerId: "cust_1", customerName: "Dashboard Customer", paymentStatus: "overdue", total: 400, outstandingBalance: 400, updatedAt: today }],
  estimates: [{ id: "est_1", customerName: "Dashboard Customer", status: "approved", total: 500 }]
});

const assistant = createAiOperationsAssistant({ file });
const result = assistant.dashboard();
assert.strictEqual(result.ok, true);
assert.ok(result.data.businessHealth.score < 100);
assert.strictEqual(result.data.dispatchStatus.emergencyJobs, 1);
assert.strictEqual(result.data.revenueSnapshot.overdueInvoices, 1);

fs.unlinkSync(file);
console.log(JSON.stringify({ ok: true, assistantDashboard: "working" }, null, 2));
