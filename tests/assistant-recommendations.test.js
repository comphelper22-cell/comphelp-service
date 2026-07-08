const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { createAiOperationsAssistant } = require("../ai-operations-assistant/assistant");
const { writeJson } = require("../database/json-store");

const file = path.join(__dirname, "..", "tmp_assistant_recommendations.json");
if (fs.existsSync(file)) fs.unlinkSync(file);
writeJson(file, {
  version: 1,
  customers: [{ id: "cust_1", fullName: "Revenue Customer", status: "active", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" }],
  jobs: [{ id: "job_1", customerId: "cust_1", customerName: "Revenue Customer", status: "waiting_parts", priority: "normal" }],
  invoices: [{ id: "inv_1", customerId: "cust_1", customerName: "Revenue Customer", paymentStatus: "overdue", total: 700, outstandingBalance: 700 }],
  estimates: [{ id: "est_1", customerName: "Revenue Customer", status: "approved", total: 900 }]
});

const assistant = createAiOperationsAssistant({ file });
const result = assistant.recommendations();
assert.strictEqual(result.ok, true);
assert.ok(result.data.some((item) => item.title === "Send overdue invoice reminder"));
assert.ok(result.data.some((item) => item.title === "Call customer with approved estimate"));

fs.unlinkSync(file);
console.log(JSON.stringify({ ok: true, assistantRecommendations: "working" }, null, 2));
