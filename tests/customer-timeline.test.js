const assert = require("assert");
const path = require("path");
const fs = require("fs");
const { createCustomerCrm } = require("../crm/customer-crm");
const { readJson, writeJson } = require("../database/json-store");

const file = path.join(__dirname, "..", "tmp_customer_timeline.json");
if (fs.existsSync(file)) fs.unlinkSync(file);
const crm = createCustomerCrm({ file });
const customer = crm.create({ fullName: "Timeline Customer", status: "active" }).data;
const data = readJson(file);
data.estimates = [{ customerName: "Timeline Customer", service: "Camera", status: "approved", createdAt: "2026-01-01T00:00:00.000Z" }];
data.projects = [{ customerName: "Timeline Customer", title: "Install", status: "completed", completionDate: "2026-01-02T00:00:00.000Z" }];
data.invoices = [{ customerName: "Timeline Customer", status: "paid", amount: 299, paidAt: "2026-01-03T00:00:00.000Z" }];
writeJson(file, data);

const timeline = crm.timeline(customer.id);
assert.strictEqual(timeline.ok, true);
assert.ok(timeline.data.some((item) => item.title === "Estimate Approved"));
assert.ok(timeline.data.some((item) => item.title === "Job Completed"));
assert.ok(timeline.data.some((item) => item.title === "Payment Received"));

fs.unlinkSync(file);
console.log(JSON.stringify({ ok: true, customerTimeline: "working" }, null, 2));
