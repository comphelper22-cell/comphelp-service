const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { createRevenueFlow } = require("../revenue-flow/revenue-flow");

const file = path.join(__dirname, "..", "tmp_estimate_flow.json");
if (fs.existsSync(file)) fs.unlinkSync(file);
const revenue = createRevenueFlow({ file });

const estimate = revenue.createEstimate({ customerName: "Estimate Customer", service: "Camera", laborHours: 4, materialCost: 200, discount: 25, taxPlaceholder: 20 });
assert.strictEqual(estimate.ok, true);
assert.strictEqual(estimate.data.total, 535);

const updated = revenue.updateEstimate(estimate.data.id, { laborHours: 5 });
assert.strictEqual(updated.ok, true);
assert.strictEqual(updated.data.lineItems.labor.hours, 5);

const approved = revenue.approveEstimate(estimate.data.id);
assert.strictEqual(approved.ok, true);
assert.strictEqual(approved.data.status, "approved");

const converted = revenue.convertEstimateToJob(estimate.data.id);
assert.strictEqual(converted.ok, true);
assert.ok(converted.data.job.id);

const rejected = revenue.rejectEstimate(estimate.data.id, "Customer changed scope");
assert.strictEqual(rejected.ok, true);
assert.strictEqual(rejected.data.status, "rejected");

fs.unlinkSync(file);
console.log(JSON.stringify({ ok: true, estimateFlow: "working" }, null, 2));
