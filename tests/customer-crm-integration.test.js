const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { createCustomerCrm } = require("../crm/customer-crm");

const file = path.join(__dirname, "..", "tmp_customer_crm_integration.json");
if (fs.existsSync(file)) fs.unlinkSync(file);

const crm = createCustomerCrm({ file });

const created = crm.create({
  fullName: "Integration Customer",
  company: "Integration Market",
  phone: "+1 747 295 1440",
  email: "integration@example.com",
  city: "Los Angeles",
  status: "new",
  tags: "commercial, camera",
  leadSource: "Website"
});

assert.strictEqual(created.ok, true);
assert.strictEqual(created.error, null);
assert.ok(Array.isArray(created.warnings));
assert.ok(created.generatedAt);

const customerId = created.data.id;
const search = crm.search({ query: "Integration Market" });
assert.strictEqual(search.ok, true);
assert.strictEqual(search.data.length, 1);

const profile = crm.profile(customerId);
assert.strictEqual(profile.ok, true);
assert.strictEqual(profile.data.customer.company, "Integration Market");

const note = crm.note({
  customerId,
  body: "Customer asked for a camera installation estimate.",
  pinned: true,
  internal: true
});
assert.strictEqual(note.ok, true);

const timelineAfterNote = crm.timeline(customerId);
assert.strictEqual(timelineAfterNote.ok, true);
assert.ok(timelineAfterNote.data.some((item) => item.title === "Customer Created"));
assert.ok(timelineAfterNote.data.some((item) => item.title === "Internal Note"));

const summary = crm.summary(customerId);
assert.strictEqual(summary.ok, true);
assert.ok(summary.data.recommendedNextAction);

const archived = crm.archive(customerId);
assert.strictEqual(archived.ok, true);
assert.strictEqual(archived.data.status, "archived");
assert.ok(crm.timeline(customerId).data.some((item) => item.title === "Customer Archived"));

const restored = crm.restore(customerId);
assert.strictEqual(restored.ok, true);
assert.strictEqual(restored.data.status, "active");
assert.ok(crm.timeline(customerId).data.some((item) => item.title === "Customer Restored"));

const persistedCrm = createCustomerCrm({ file });
const persistedProfile = persistedCrm.profile(customerId);
assert.strictEqual(persistedProfile.ok, true);
assert.strictEqual(persistedProfile.data.customer.fullName, "Integration Customer");

fs.unlinkSync(file);

console.log(JSON.stringify({
  ok: true,
  flow: ["create", "search", "profile", "note", "timeline", "summary", "archive", "restore"],
  jsonFallbackPersistence: true
}, null, 2));
