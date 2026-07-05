const assert = require("assert");
const identityEngine = require("../identity/identity-engine");
const authEngine = require("../auth/auth-engine");

const identity = identityEngine.status();
assert.strictEqual(identity.ok, true);
assert.strictEqual(identity.data.realAuthConnected, false);
assert.strictEqual(identity.data.passwordsStored, false);
assert.ok(identity.data.loginFlow.includes("Permission Load"));

const auth = authEngine.status();
assert.strictEqual(auth.ok, true);
assert.strictEqual(auth.data.realAuthConnected, false);
assert.strictEqual(auth.data.passwordsStored, false);

const login = authEngine.login({ email: "demo@example.com", role: "Guest", organizationId: "org_demo" });
assert.strictEqual(login.ok, true);
assert.strictEqual(login.data.authenticated, false);
assert.strictEqual(login.data.token.signed, false);

console.log(JSON.stringify({
  ok: true,
  realAuthConnected: false,
  passwordsStored: false,
  loginFlow: "validated"
}, null, 2));
