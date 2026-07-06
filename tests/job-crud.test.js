const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { createJobDispatch } = require("../job-dispatch/job-dispatch");

const file = path.join(__dirname, "..", "tmp_job_crud.json");
if (fs.existsSync(file)) fs.unlinkSync(file);
const dispatch = createJobDispatch({ file });

const created = dispatch.create({ customerName: "Job Customer", title: "Camera Install", service: "Security Camera Installation", priority: "high" });
assert.strictEqual(created.ok, true);
assert.ok(created.data.jobNumber);

const updated = dispatch.update(created.data.id, { address: "123 Main St", estimatedHours: 4 });
assert.strictEqual(updated.ok, true);
assert.strictEqual(updated.data.address, "123 Main St");
assert.strictEqual(updated.data.estimatedHours, 4);

const details = dispatch.details(created.data.id);
assert.strictEqual(details.ok, true);
assert.strictEqual(details.data.job.title, "Camera Install");

fs.unlinkSync(file);
console.log(JSON.stringify({ ok: true, jobCrud: "working" }, null, 2));
