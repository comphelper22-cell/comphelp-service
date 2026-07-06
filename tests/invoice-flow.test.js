const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { createRevenueFlow } = require("../revenue-flow/revenue-flow");
const { writeJson } = require("../database/json-store");

const file = path.join(__dirname, "..", "tmp_invoice_flow.json");
if (fs.existsSync(file)) fs.unlinkSync(file);
writeJson(file, { version: 1, jobs: [{ id: "job_1", customerName: "Invoice Customer", customerId: "cust_1", status: "completed", actualHours: 2 }] });
const revenue = createRevenueFlow({ file });

const invoice = revenue.createInvoiceFromJob("job_1");
assert.strictEqual(invoice.ok, true);
assert.strictEqual(invoice.data.jobId, "job_1");

const updated = revenue.updateInvoice(invoice.data.id, { materialCost: 100, laborHours: 3 });
assert.strictEqual(updated.ok, true);
assert.ok(updated.data.total > invoice.data.total);

assert.strictEqual(revenue.markInvoice(invoice.data.id, "sent").data.status, "sent");
assert.strictEqual(revenue.markInvoice(invoice.data.id, "overdue").data.paymentStatus, "overdue");
assert.strictEqual(revenue.markInvoice(invoice.data.id, "paid").data.paymentStatus, "paid");

fs.unlinkSync(file);
console.log(JSON.stringify({ ok: true, invoiceFlow: "working" }, null, 2));
