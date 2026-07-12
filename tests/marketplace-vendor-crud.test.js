const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { Readable } = require("stream");

process.env.MARKETPLACE_ADMIN_SECRET = "vendor-crud-test-secret";
const marketplace = require("../api/marketplace");

function request(action, payload) {
  const req = Readable.from([Buffer.from(JSON.stringify({ action, payload }))]);
  req.method = "POST";
  req.headers = {
    "content-type": "application/json",
    "x-marketplace-admin-secret": "vendor-crud-test-secret"
  };
  return req;
}

function response() {
  return {
    statusCode: 200,
    setHeader() {},
    end(body) { this.body = JSON.parse(body); }
  };
}

(async function run() {
  assert.strictEqual(typeof marketplace.vendorPayload, "function");
  assert.strictEqual(typeof marketplace.vendorPatch, "function");

  const created = marketplace.vendorPayload({ name: "Vendor", category: "Cameras", city: "Burbank", distanceMiles: "8.5" });
  assert.strictEqual(created.distanceMiles, 8.5, "Vendor creation must preserve validated distance.");

  const patch = marketplace.vendorPatch({ id: "vendor_1", notes: "Updated note", distanceMiles: "4.2", city: "", status: "", category: "" });
  assert.deepStrictEqual(patch, { notes: "Updated note", distanceMiles: 4.2 }, "Vendor updates must include only explicitly supplied non-empty fields.");

  const derivedSafePatch = marketplace.vendorPatch({ category: "Networking", phone: "818-555-0100" });
  assert.deepStrictEqual(derivedSafePatch, { category: "Networking", phone: "818-555-0100" }, "Partial updates must not overwrite derived services or contact fields.");
  assert.throws(() => marketplace.vendorPatch({ rating: "abc" }), /Invalid rating/);
  assert.throws(() => marketplace.vendorPatch({ commissionPercent: "101" }), /Invalid commissionPercent/);
  assert.throws(() => marketplace.vendorPatch({ distanceMiles: "-1" }), /Invalid distanceMiles/);

  const invalidRes = response();
  await marketplace(request("vendorUpdate", { id: "vendor_missing", rating: "abc" }), invalidRes);
  assert.strictEqual(invalidRes.statusCode, 400);
  assert.strictEqual(invalidRes.body.error, "invalid_request");

  const missingUpdateRes = response();
  await marketplace(request("vendorUpdate", { id: "vendor_missing", notes: "test" }), missingUpdateRes);
  assert.strictEqual(missingUpdateRes.statusCode, 404);
  assert.strictEqual(missingUpdateRes.body.error, "not_found");

  const missingDeleteRes = response();
  await marketplace(request("vendorDelete", { id: "vendor_missing" }), missingDeleteRes);
  assert.strictEqual(missingDeleteRes.statusCode, 404);
  assert.strictEqual(missingDeleteRes.body.error, "not_found");

  const html = fs.readFileSync(path.join(__dirname, "..", "marketplace.html"), "utf8");
  const manager = fs.readFileSync(path.join(__dirname, "..", "assets", "marketplace-manager.js"), "utf8");
  assert.match(html, /<option value="">Keep current status<\/option>/, "Vendor update form must not force active status.");
  assert.match(manager, /function updateVendorCrudMode\(\)/, "Vendor delete/update mode must adjust required controls.");
  assert.match(manager, /category\.required = mode === "vendor"/, "Category is required only when creating a vendor.");

  console.log(JSON.stringify({ ok: true, vendorCrudSafety: "validated" }, null, 2));
})().catch((error) => { throw error; });
