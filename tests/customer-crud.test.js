const assert = require("assert");
const path = require("path");
const fs = require("fs");
const { createCustomerCrm } = require("../crm/customer-crm");

const file = path.join(__dirname, "..", "tmp_customer_crud.json");
if (fs.existsSync(file)) fs.unlinkSync(file);
const crm = createCustomerCrm({ file });

const created = crm.create({ fullName: "Jane Camera", phone: "+1 747 295 1440", email: "jane@example.com", status: "new", tags: "commercial, vip" });
assert.strictEqual(created.ok, true);
assert.strictEqual(created.data.fullName, "Jane Camera");

const updated = crm.update(created.data.id, { company: "Jane Market", status: "active" });
assert.strictEqual(updated.ok, true);
assert.strictEqual(updated.data.company, "Jane Market");

const archived = crm.archive(created.data.id);
assert.strictEqual(archived.ok, true);
assert.strictEqual(archived.data.status, "archived");

const restored = crm.restore(created.data.id);
assert.strictEqual(restored.ok, true);
assert.strictEqual(restored.data.status, "active");

const deleted = crm.delete(created.data.id);
assert.strictEqual(deleted.ok, true);
assert.ok(deleted.data.deleted_at);

fs.unlinkSync(file);
console.log(JSON.stringify({ ok: true, customerCrud: "working" }, null, 2));
