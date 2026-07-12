const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { createJobDispatch } = require("../job-dispatch/job-dispatch");

const file = path.join(__dirname, "..", "tmp_job_crud.json");
if (fs.existsSync(file)) fs.unlinkSync(file);
const dispatch = createJobDispatch({ file });

const created = dispatch.create({ customerName: "Job Customer", email: "job@example.com", phone: "818-555-0100", title: "Camera Install", service: "Security Camera Installation", priority: "high", schedulePreset: "week" });
assert.strictEqual(created.ok, true);
assert.ok(created.data.jobNumber);
assert.strictEqual(created.data.email, "job@example.com");
assert.strictEqual(created.data.phone, "818-555-0100");
assert.strictEqual(created.data.schedulePreset, "week", "Quick schedule meaning must persist across reloads.");

const updated = dispatch.update(created.data.id, { address: "123 Main St", startDate: "2030-01-15T09:00:00.000Z", estimatedHours: 4 });
assert.strictEqual(updated.ok, true);
assert.strictEqual(updated.data.address, "123 Main St");
assert.strictEqual(updated.data.estimatedHours, 4);
assert.strictEqual(updated.data.endDate, "2030-01-15T13:00:00.000Z");

const rescheduled = dispatch.update(created.data.id, { estimatedHours: 2 });
assert.strictEqual(rescheduled.data.endDate, "2030-01-15T11:00:00.000Z", "Changing duration must recalculate the end date.");

const details = dispatch.details(created.data.id);
assert.strictEqual(details.ok, true);
assert.strictEqual(details.data.job.title, "Camera Install");

fs.unlinkSync(file);
console.log(JSON.stringify({ ok: true, jobCrud: "working" }, null, 2));
