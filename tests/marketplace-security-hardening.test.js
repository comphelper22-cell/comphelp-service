const assert = require("assert");
const { Readable } = require("stream");
const handler = require("../api/marketplace");

function req(method, body, secret = "") {
  const stream = Readable.from(body === undefined ? [] : [Buffer.from(typeof body === "string" ? body : JSON.stringify(body))]);
  stream.method = method;
  stream.headers = secret ? { "x-marketplace-admin-secret": secret } : {};
  return stream;
}

function res() {
  return {
    statusCode: 200,
    headers: {},
    setHeader(k, v) { this.headers[k] = v; },
    end(value) { this.body = value || ""; }
  };
}

(async () => {
  const saved = {
    admin: process.env.MARKETPLACE_ADMIN_SECRET,
    manager: process.env.MARKETPLACE_MANAGER_SECRET,
    viewer: process.env.MARKETPLACE_VIEWER_SECRET,
    upload: process.env.ADMIN_UPLOAD_SECRET,
    demo: process.env.MARKETPLACE_DEMO_MODE
  };
  delete process.env.MARKETPLACE_ADMIN_SECRET;
  delete process.env.MARKETPLACE_MANAGER_SECRET;
  delete process.env.MARKETPLACE_VIEWER_SECRET;
  delete process.env.ADMIN_UPLOAD_SECRET;
  delete process.env.MARKETPLACE_DEMO_MODE;

  const closed = res();
  await handler(req("POST", { action: "login" }, "123456"), closed);
  assert.strictEqual(closed.statusCode, 401, "Demo codes must fail closed unless demo mode is explicit.");

  process.env.MARKETPLACE_DEMO_MODE = "true";
  const demo = res();
  await handler(req("POST", { action: "login" }, "123456"), demo);
  assert.strictEqual(demo.statusCode, 200, "Explicit demo mode may enable demo credentials.");

  delete process.env.MARKETPLACE_DEMO_MODE;
  const publicDashboard = res();
  await handler(req("GET"), publicDashboard);
  const publicBody = JSON.parse(publicDashboard.body);
  assert.deepStrictEqual(publicBody.vendors, [], "Public dashboard must not expose vendor contact records.");
  assert.deepStrictEqual(publicBody.topVendors, [], "Public dashboard must not expose top-vendor records.");

  process.env.MARKETPLACE_ADMIN_SECRET = "size-test-secret";
  const oversized = res();
  const largeBody = JSON.stringify({ action: "recommendation", payload: { text: "x".repeat(300 * 1024) } });
  await handler(req("POST", largeBody, "size-test-secret"), oversized);
  assert.strictEqual(oversized.statusCode, 413, "Oversized Marketplace JSON requests must return 413.");
  assert.strictEqual(JSON.parse(oversized.body).error, "payload_too_large");

  Object.entries(saved).forEach(([key, value]) => {
    const envKey = { admin: "MARKETPLACE_ADMIN_SECRET", manager: "MARKETPLACE_MANAGER_SECRET", viewer: "MARKETPLACE_VIEWER_SECRET", upload: "ADMIN_UPLOAD_SECRET", demo: "MARKETPLACE_DEMO_MODE" }[key];
    if (value === undefined) delete process.env[envKey];
    else process.env[envKey] = value;
  });
  console.log(JSON.stringify({ ok: true, marketplaceSecurityHardening: "validated" }, null, 2));
})().catch((error) => { throw error; });
