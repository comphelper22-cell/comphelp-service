const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { createRevenueFlow } = require("../revenue-flow/revenue-flow");

const file = path.join(__dirname, "..", "tmp_payment_status.json");
if (fs.existsSync(file)) fs.unlinkSync(file);
const revenue = createRevenueFlow({ file });
const invoice = revenue.createInvoice({ customerName: "Payment Customer", laborHours: 4, laborRate: 100 }).data;

const partial = revenue.recordPayment({ invoiceId: invoice.id, amount: 100, method: "cash" });
assert.strictEqual(partial.ok, true);
assert.strictEqual(partial.data.invoice.paymentStatus, "partial");
assert.strictEqual(partial.data.invoice.outstandingBalance, 300);

const paid = revenue.recordPayment({ invoiceId: invoice.id, amount: 300, method: "cash" });
assert.strictEqual(paid.ok, true);
assert.strictEqual(paid.data.invoice.paymentStatus, "paid");
assert.strictEqual(paid.data.invoice.outstandingBalance, 0);

fs.unlinkSync(file);
console.log(JSON.stringify({ ok: true, paymentStatus: "working" }, null, 2));
