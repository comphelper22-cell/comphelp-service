const assert = require("assert");
const path = require("path");
const fs = require("fs");
const { createCustomerCrm } = require("../crm/customer-crm");

const file = path.join(__dirname, "..", "tmp_customer_search.json");
if (fs.existsSync(file)) fs.unlinkSync(file);
const crm = createCustomerCrm({ file });

crm.create({ fullName: "Maria Network", company: "Burbank Office", email: "maria@example.com", phone: "+1 747 295 1000", status: "commercial", tags: "wifi, commercial" });
crm.create({ fullName: "Alex Home", company: "", email: "alex@example.com", phone: "+1 747 295 2000", status: "residential", tags: "smart home" });

assert.strictEqual(crm.search({ query: "burbank" }).data.length, 1);
assert.strictEqual(crm.search({ query: "295 2000" }).data[0].fullName, "Alex Home");
assert.strictEqual(crm.search({ filter: "commercial" }).data.length, 1);
assert.strictEqual(crm.search({ filter: "residential" }).data.length, 1);

fs.unlinkSync(file);
console.log(JSON.stringify({ ok: true, customerSearch: "working" }, null, 2));
