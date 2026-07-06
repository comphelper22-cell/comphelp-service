const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { createJobDispatch } = require("../job-dispatch/job-dispatch");

const file = path.join(__dirname, "..", "tmp_job_scheduling.json");
if (fs.existsSync(file)) fs.unlinkSync(file);
const dispatch = createJobDispatch({ file });
const start = "2026-08-01T10:00:00.000Z";

const jobA = dispatch.create({ customerName: "Schedule A", service: "Camera", assignedTechnician: "Tech A", estimatedHours: 2 }).data;
dispatch.assign(jobA.id, { assignedTechnician: "Tech A" });
const scheduled = dispatch.schedule(jobA.id, { startDate: start, estimatedHours: 2 });
assert.strictEqual(scheduled.ok, true);

const jobB = dispatch.create({ customerName: "Schedule B", service: "Camera", assignedTechnician: "Tech A", estimatedHours: 2 }).data;
dispatch.assign(jobB.id, { assignedTechnician: "Tech A" });
const conflict = dispatch.schedule(jobB.id, { startDate: "2026-08-01T11:00:00.000Z", estimatedHours: 2 });
assert.strictEqual(conflict.ok, false);
assert.strictEqual(conflict.error, "schedule_conflict");
assert.ok(conflict.conflicts.length);

const okSlot = dispatch.schedule(jobB.id, { startDate: "2026-08-01T13:00:00.000Z", estimatedHours: 2 });
assert.strictEqual(okSlot.ok, true);

fs.unlinkSync(file);
console.log(JSON.stringify({ ok: true, scheduling: "working" }, null, 2));
