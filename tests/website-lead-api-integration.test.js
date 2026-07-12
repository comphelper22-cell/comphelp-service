const assert = require("assert");

process.env.SAFE_STORAGE_FORCE_MEMORY = "true";
const leadHandler = require("../lead");

function createRes() {
  return {
    statusCode: 200,
    headers: {},
    setHeader(name, value) { this.headers[name.toLowerCase()] = value; },
    end(body) { this.body = body; }
  };
}

(async function run() {
  const req = {
    method: "POST",
    body: {
      source: "website_form",
      name: "Website API Test",
      phone: "+1 747 555 0123",
      email: "website-api@example.com",
      service: "Smart Home Setup",
      serviceArea: "Glendale",
      address: "Glendale, CA",
      message: "Please contact me about an estimate.",
      pageUrl: "https://comphelp.ai/",
      company: "",
      formStartedAt: String(Date.now() - 10000)
    }
  };
  const res = createRes();
  await leadHandler(req, res);
  const body = JSON.parse(res.body);

  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(body.ok, true);
  assert.strictEqual(body.marketplace.synced, true, "Lead endpoint must sync valid website leads into Marketplace.");
  assert.ok(body.marketplace.leadId, "Lead endpoint must return the Marketplace lead ID.");

  console.log(JSON.stringify({ ok: true, websiteLeadApiMarketplaceSync: "working" }, null, 2));
})().catch((error) => { throw error; });
