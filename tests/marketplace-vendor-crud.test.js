const assert = require("assert");
const fs = require("fs");
const path = require("path");
const marketplace = require("../api/marketplace");

assert.strictEqual(typeof marketplace.vendorPayload, "function");
assert.strictEqual(typeof marketplace.vendorPatch, "function");

const created = marketplace.vendorPayload({ name: "Vendor", category: "Cameras", city: "Burbank", distanceMiles: "8.5" });
assert.strictEqual(created.distanceMiles, 8.5, "Vendor creation must preserve validated distance.");

const patch = marketplace.vendorPatch({ id: "vendor_1", notes: "Updated note", distanceMiles: "4.2", city: "", status: "", category: "" });
assert.deepStrictEqual(patch, { notes: "Updated note", distanceMiles: 4.2 }, "Vendor updates must include only explicitly supplied non-empty fields.");

const html = fs.readFileSync(path.join(__dirname, "..", "marketplace.html"), "utf8");
const manager = fs.readFileSync(path.join(__dirname, "..", "assets", "marketplace-manager.js"), "utf8");
assert.match(html, /<option value="">Keep current status<\/option>/, "Vendor update form must not force active status.");
assert.match(manager, /function updateVendorCrudMode\(\)/, "Vendor delete/update mode must adjust required controls.");
assert.match(manager, /category\.required = mode === "vendor"/, "Category is required only when creating a vendor.");

console.log(JSON.stringify({ ok: true, vendorCrudSafety: "validated" }, null, 2));
