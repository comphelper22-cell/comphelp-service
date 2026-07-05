const assert = require("assert");
const path = require("path");
const fs = require("fs");
const { createCustomerCrm } = require("../crm/customer-crm");
const { readJson, writeJson } = require("../database/json-store");

const file = path.join(__dirname, "..", "tmp_customer_summary.json");
if (fs.existsSync(file)) fs.unlinkSync(file);
const crm = createCustomerCrm({ file });
const customer = crm.create({ fullName: "Summary Customer", city: "Los Angeles", status: "new" }).data;
const data = readJson(file);
data.projects = [{ customerName: "Summary Customer", title: "WiFi job", status: "scheduled" }];
data.invoices = [{ customerName: "Summary Customer", status: "sent", amount: 450 }];
writeJson(file, data);

const summary = crm.summary(customer.id);
assert.strictEqual(summary.ok, true);
assert.strictEqual(summary.data.openJobs, 1);
assert.strictEqual(summary.data.invoices, 1);
assert.strictEqual(summary.data.outstandingBalancePlaceholder, 450);
assert.ok(summary.data.recommendedNextAction);

const dashboard = crm.dashboard();
assert.strictEqual(dashboard.ok, true);
assert.strictEqual(dashboard.data.totalCustomers, 1);

fs.unlinkSync(file);
console.log(JSON.stringify({ ok: true, customerSummary: "working" }, null, 2));
