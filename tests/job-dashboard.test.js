const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { createJobDispatch } = require("../job-dispatch/job-dispatch");

const file = path.join(__dirname, "..", "tmp_job_dashboard.json");
if (fs.existsSync(file)) fs.unlinkSync(file);
const dispatch = createJobDispatch({ file });

const emergency = dispatch.create({ customerName: "Emergency Customer", service: "Network Down", priority: "emergency" }).data;
const normal = dispatch.create({ customerName: "Normal Customer", service: "Computer Repair", priority: "normal" }).data;
dispatch.assign(emergency.id, { assignedTechnician: "Tech A" });
dispatch.assign(normal.id, { assignedTechnician: "Tech B" });
dispatch.complete(normal.id, { actualHours: 2, completionNotes: "Done" });

const dashboard = dispatch.dashboard();
assert.strictEqual(dashboard.ok, true);
assert.strictEqual(dashboard.data.emergencyJobs, 1);
assert.strictEqual(dashboard.data.completedJobs, 1);
assert.ok(dashboard.data.openJobs >= 1);
assert.ok(dashboard.data.aiDispatch);
assert.ok(Object.keys(dashboard.data.technicianWorkload).length >= 1);

fs.unlinkSync(file);
console.log(JSON.stringify({ ok: true, jobDashboard: "working" }, null, 2));
