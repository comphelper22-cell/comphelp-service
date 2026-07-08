const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { createAiOperationsAssistant } = require("../ai-operations-assistant/assistant");
const { writeJson } = require("../database/json-store");

const file = path.join(__dirname, "..", "tmp_business_health.json");
if (fs.existsSync(file)) fs.unlinkSync(file);
writeJson(file, {
  version: 1,
  customers: [{ id: "cust_1", fullName: "At Risk Customer", status: "active", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" }],
  jobs: [{ id: "job_1", customerId: "cust_1", customerName: "At Risk Customer", status: "waiting_parts", priority: "emergency" }],
  invoices: [{ id: "inv_1", customerId: "cust_1", customerName: "At Risk Customer", paymentStatus: "overdue", total: 300, outstandingBalance: 300 }]
});

const assistant = createAiOperationsAssistant({ file });
const result = assistant.businessHealth();
assert.strictEqual(result.ok, true);
assert.ok(result.data.score < 100);
assert.strictEqual(result.data.signals.overdueInvoices, 1);
assert.strictEqual(result.data.signals.waitingPartsJobs, 1);

fs.unlinkSync(file);
console.log(JSON.stringify({ ok: true, businessHealth: "working" }, null, 2));
