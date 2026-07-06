const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { createJobDispatch } = require("../job-dispatch/job-dispatch");
const { writeJson } = require("../database/json-store");

const file = path.join(__dirname, "..", "tmp_dispatch_flow.json");
if (fs.existsSync(file)) fs.unlinkSync(file);
writeJson(file, {
  version: 1,
  customers: [{ id: "cust_1", fullName: "Flow Customer", address: "100 Flow St", city: "Los Angeles" }],
  estimates: [{ id: "est_1", customerId: "cust_1", customerName: "Flow Customer", status: "approved", service: "Security Camera Installation" }],
  vendors: [{ id: "tech_1", name: "Camera Tech", category: "Security Camera Installation", rating: 5, status: "available" }]
});

const dispatch = createJobDispatch({ file });
const job = dispatch.create({ customerId: "cust_1", service: "Security Camera Installation", priority: "high", estimatedHours: 4 }).data;
assert.strictEqual(job.customerName, "Flow Customer");
assert.strictEqual(dispatch.assign(job.id, { assignedTechnician: "Camera Tech" }).ok, true);
assert.strictEqual(dispatch.schedule(job.id, { startDate: "2026-08-02T09:00:00.000Z", estimatedHours: 4 }).ok, true);
assert.strictEqual(dispatch.status(job.id, "en_route").data.status, "en_route");
assert.strictEqual(dispatch.status(job.id, "on_site").data.status, "on_site");
assert.strictEqual(dispatch.status(job.id, "in_progress").data.status, "in_progress");
const completed = dispatch.complete(job.id, { actualHours: 3.5, completionNotes: "Installed and tested cameras." });
assert.strictEqual(completed.ok, true);
assert.strictEqual(completed.data.job.status, "completed");
assert.ok(completed.data.invoicePlaceholder);
assert.ok(completed.data.timeline.some((item) => item.title === "AI Recommendation"));

fs.unlinkSync(file);
console.log(JSON.stringify({ ok: true, dispatchFlow: "working" }, null, 2));
