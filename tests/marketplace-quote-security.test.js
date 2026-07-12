const assert = require("assert");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const handler = require("../api/marketplace-quote");
const marketplace = require("../api/marketplace");

function response() {
  return { statusCode: 200, headers: {}, setHeader(k, v) { this.headers[k] = v; }, end(value) { this.body = value || ""; } };
}

function token(secret, id, expires) {
  return crypto.createHmac("sha256", secret).update(`${id}.${expires}`).digest("hex");
}

(async () => {
  const secret = "quote-security-test-secret";
  process.env.MARKETPLACE_QUOTE_SECRET = secret;
  const seed = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "marketplace.json"), "utf8"));
  const estimate = seed.estimates[0];
  assert.ok(estimate && estimate.id, "Fixture must contain an estimate.");
  const expires = Date.now() + 60_000;
  const generatedUrl = new URL(marketplace.signedQuoteUrl(estimate.id));
  assert.strictEqual(generatedUrl.searchParams.get("id"), estimate.id);
  assert.ok(generatedUrl.searchParams.get("expires"), "Generated quote URL must expire.");
  assert.ok(generatedUrl.searchParams.get("token"), "Generated quote URL must be signed.");

  const missing = response();
  await handler({ query: {} }, missing);
  assert.strictEqual(missing.statusCode, 400);

  const invalid = response();
  await handler({ query: { id: estimate.id, expires: String(expires), token: "bad" } }, invalid);
  assert.strictEqual(invalid.statusCode, 403);

  const unknownId = "estimate_missing";
  const unknown = response();
  await handler({ query: { id: unknownId, expires: String(expires), token: token(secret, unknownId, expires) } }, unknown);
  assert.strictEqual(unknown.statusCode, 404);

  const valid = response();
  await handler({ query: { id: estimate.id, expires: String(expires), token: token(secret, estimate.id, expires) } }, valid);
  assert.strictEqual(valid.statusCode, 200);
  const html = String(valid.body);
  ["Internal Cost", "Expected Profit", "Profit Target", "Commission", "Labor Cost", "Material Cost"].forEach((label) => {
    assert.ok(!html.includes(label), `Public quote must not expose ${label}.`);
  });
  assert.ok(!html.includes(String(estimate.internalNotes || "__absent__")), "Public quote must not expose internal notes.");

  delete process.env.MARKETPLACE_QUOTE_SECRET;
  console.log(JSON.stringify({ ok: true, signedPublicQuotes: "validated" }, null, 2));
})().catch((error) => { throw error; });
