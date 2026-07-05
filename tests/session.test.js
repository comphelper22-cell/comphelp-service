const assert = require("assert");
const { sessionStatus, createSession } = require("../auth/session-manager");
const { tokenStatus, issuePlaceholderToken } = require("../auth/token-manager");

const status = sessionStatus();
assert.strictEqual(status.ok, true);
assert.strictEqual(status.data.activeSessionStore, false);
assert.strictEqual(status.data.model.rememberMe, false);

const session = createSession({ rememberMe: true, device: "Test Device" });
assert.strictEqual(session.ok, true);
assert.strictEqual(session.data.rememberMe, true);
assert.ok(session.data.sessionId.startsWith("session_"));

const token = issuePlaceholderToken({ userId: "user_test", role: "Guest" });
assert.strictEqual(token.ok, true);
assert.strictEqual(token.data.signed, false);
assert.strictEqual(tokenStatus().data.realTokensIssued, false);

console.log(JSON.stringify({
  ok: true,
  sessionsStored: false,
  tokensSigned: false
}, null, 2));
