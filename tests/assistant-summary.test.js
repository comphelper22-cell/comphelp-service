const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { createAiOperationsAssistant } = require("../ai-operations-assistant/assistant");
const { writeJson } = require("../database/json-store");

const file = path.join(__dirname, "..", "tmp_assistant_summary.json");
if (fs.existsSync(file)) fs.unlinkSync(file);
const today = new Date().toISOString();
writeJson(file, {
  version: 1,
  jobs: [{ id: "job_1", customerName: "Summary Customer", status: "scheduled", priority: "normal", startDate: today }],
  invoices: [{ id: "inv_1", customerName: "Summary Customer", status: "paid", paymentStatus: "paid", total: 250, updatedAt: today }],
  customers: []
});

const assistant = createAiOperationsAssistant({ file });
const result = assistant.summary();
assert.strictEqual(result.ok, true);
assert.strictEqual(result.data.todaysJobs.length, 1);
assert.ok(result.data.summary.some((line) => line.includes("job")));

fs.unlinkSync(file);
console.log(JSON.stringify({ ok: true, assistantSummary: "working" }, null, 2));
