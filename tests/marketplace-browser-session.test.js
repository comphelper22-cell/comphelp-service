const assert = require("assert");
const fs = require("fs");
const path = require("path");

const source = fs.readFileSync(path.join(__dirname, "..", "assets", "marketplace-manager.js"), "utf8");

assert.ok(source.includes('sessionStorage.setItem("marketplaceSecret", secret)'), "Access code should be scoped to the browser tab session.");
assert.ok(!source.includes('localStorage.setItem("marketplaceSecret", secret)'), "Access code must not persist in localStorage.");
assert.ok(source.includes("async function restoreAuthenticatedSession()"), "Saved sessions must be restored through server validation.");
assert.ok(source.includes("await login(savedSecret)"), "Saved access codes must be revalidated before showing the dashboard.");
assert.ok(source.includes('localStorage.removeItem("marketplaceSecret")'), "Legacy persistent access codes should be removed.");

console.log(JSON.stringify({ ok: true, browserSessionSecurity: "validated" }, null, 2));
