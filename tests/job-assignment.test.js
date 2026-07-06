const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { createJobDispatch } = require("../job-dispatch/job-dispatch");

const file = path.join(__dirname, "..", "tmp_job_assignment.json");
if (fs.existsSync(file)) fs.unlinkSync(file);
const dispatch = createJobDispatch({ file });
const job = dispatch.create({ customerName: "Assign Customer", service: "WiFi" }).data;

const assigned = dispatch.assign(job.id, { assignedTechnician: "Tech One", notes: "Initial assignment" });
assert.strictEqual(assigned.ok, true);
assert.strictEqual(assigned.data.job.assignedTechnician, "Tech One");
assert.strictEqual(assigned.data.assignment.action, "assign");

const reassigned = dispatch.assign(job.id, { assignedTechnician: "Tech Two" });
assert.strictEqual(reassigned.ok, true);
assert.strictEqual(reassigned.data.assignment.action, "reassign");
assert.strictEqual(reassigned.data.assignmentHistory.length, 2);

const removed = dispatch.assign(job.id, { assignedTechnician: "" });
assert.strictEqual(removed.ok, true);
assert.strictEqual(removed.data.assignment.action, "remove_assignment");

fs.unlinkSync(file);
console.log(JSON.stringify({ ok: true, jobAssignment: "working" }, null, 2));
