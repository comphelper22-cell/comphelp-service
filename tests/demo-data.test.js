const assert = require("assert");
const { buildBetaDemoData } = require("../data/beta-demo-data");

const data = buildBetaDemoData({}, { baseDate: "2026-07-08T16:00:00.000Z" });

assert.strictEqual(data.customers.length, 100);
assert.strictEqual(data.jobs.length, 50);
assert.strictEqual(data.estimates.length, 30);
assert.strictEqual(data.invoices.length, 25);
assert.strictEqual(data.technicians.length, 10);
assert.strictEqual(data.payments.length, 20);
assert.strictEqual(data.leads.length, 15);
assert.ok(data.customerNotes.length > 0);
assert.ok(data.jobTimeline.length > 0);
assert.ok(data.invoices.some((invoice) => invoice.paymentStatus === "overdue"));
assert.ok(data.jobs.some((job) => job.startDate));

console.log(JSON.stringify({ ok: true, demoData: "working" }, null, 2));
