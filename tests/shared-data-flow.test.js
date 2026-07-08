const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { buildBetaDemoData } = require("../data/beta-demo-data");
const { writeJson } = require("../database/json-store");
const { createCustomerCrm } = require("../crm/customer-crm");
const { createJobDispatch } = require("../job-dispatch/job-dispatch");
const { createRevenueFlow } = require("../revenue-flow/revenue-flow");
const analytics = require("../analytics/analytics-engine");

const file = path.join(__dirname, "..", "tmp_shared_demo_flow.json");
writeJson(file, buildBetaDemoData({}, { baseDate: new Date().toISOString() }));

const crm = createCustomerCrm({ file });
const jobs = createJobDispatch({ file });
const revenue = createRevenueFlow({ file });

assert.strictEqual(crm.dashboard().data.totalCustomers, 100);
assert.strictEqual(jobs.dashboard().data.jobs.length, 50);
assert.strictEqual(revenue.dashboard().data.invoices.length, 10);
assert.ok(revenue.dashboard().data.revenueThisMonth > 0);
assert.ok(analytics.dashboard({}).ok);

fs.unlinkSync(file);
console.log(JSON.stringify({ ok: true, sharedDataFlow: "working" }, null, 2));
