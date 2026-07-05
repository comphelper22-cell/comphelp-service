const assert = require("assert");
const path = require("path");
const fs = require("fs");
const { createCustomerCrm } = require("../crm/customer-crm");

const file = path.join(__dirname, "..", "tmp_customer_notes.json");
if (fs.existsSync(file)) fs.unlinkSync(file);
const crm = createCustomerCrm({ file });
const customer = crm.create({ fullName: "Notes Customer", status: "active" }).data;

const note = crm.note({ customerId: customer.id, body: "Call customer tomorrow.", pinned: true, internal: true });
assert.strictEqual(note.ok, true);
assert.strictEqual(note.data.pinned, true);

const edited = crm.note({ operation: "edit", noteId: note.data.id, body: "Call customer today.", pinned: true });
assert.strictEqual(edited.ok, true);
assert.strictEqual(edited.data.body, "Call customer today.");

const notes = crm.note({ operation: "list", customerId: customer.id });
assert.strictEqual(notes.data.length, 1);

const deleted = crm.note({ operation: "delete", noteId: note.data.id });
assert.strictEqual(deleted.ok, true);
assert.ok(deleted.data.deleted_at);

fs.unlinkSync(file);
console.log(JSON.stringify({ ok: true, customerNotes: "working" }, null, 2));
