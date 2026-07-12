const assert = require("assert");

process.env.SAFE_STORAGE_FORCE_MEMORY = "true";
const marketplaceHandler = require("../api/marketplace");

(async function run() {
  assert.strictEqual(typeof marketplaceHandler.intakeWebsiteLead, "function", "Marketplace must expose a website lead intake bridge.");

  const saved = await marketplaceHandler.intakeWebsiteLead({
    source: "website_form",
    name: "Website Integration Test",
    phone: "+1 747 555 0199",
    email: "integration@example.com",
    service: "WiFi & Network Installation",
    serviceArea: "Burbank",
    message: "Need an estimate",
    pageUrl: "https://comphelp.ai/"
  });

  assert.ok(saved.id, "Website lead should receive a Marketplace record ID.");
  assert.strictEqual(saved.source, "website_form");
  assert.strictEqual(saved.status, "New Lead");
  assert.strictEqual(saved.pageUrl, "https://comphelp.ai/");
  assert.strictEqual(saved.email, "integration@example.com");

  console.log(JSON.stringify({ ok: true, websiteMarketplaceBridge: "working", leadId: saved.id }, null, 2));
})().catch((error) => {
  throw error;
});
