const assert = require("assert");
const { Readable } = require("stream");

process.env.MARKETPLACE_ADMIN_SECRET = "test-admin-secret";
process.env.MARKETPLACE_VIEWER_SECRET = "test-viewer-secret";
const systemHandler = require("../api/system");

function createReq(body, secret = "") {
  const req = Readable.from([Buffer.from(JSON.stringify(body), "utf8")]);
  req.method = "POST";
  req.headers = { "content-type": "application/json" };
  if (secret) req.headers["x-marketplace-admin-secret"] = secret;
  return req;
}

function createRes() {
  return {
    statusCode: 200,
    headers: {},
    setHeader(name, value) {
      this.headers[name.toLowerCase()] = value;
    },
    end(body) {
      this.body = body;
    }
  };
}

(async function run() {
  const payload = { module: "memory", action: "status", payload: {} };

  const missingRes = createRes();
  await systemHandler(createReq(payload), missingRes);
  assert.strictEqual(missingRes.statusCode, 401, "System API must reject requests without a Marketplace secret.");
  assert.strictEqual(JSON.parse(missingRes.body).error, "unauthorized");

  const invalidRes = createRes();
  await systemHandler(createReq(payload, "wrong-secret"), invalidRes);
  assert.strictEqual(invalidRes.statusCode, 401, "System API must reject an invalid Marketplace secret.");

  const validRes = createRes();
  await systemHandler(createReq(payload, "test-admin-secret"), validRes);
  assert.strictEqual(validRes.statusCode, 200, "System API must accept a configured Marketplace secret.");
  assert.strictEqual(JSON.parse(validRes.body).ok, true);

  const viewerMutationRes = createRes();
  await systemHandler(createReq({ module: "customer", action: "customer.delete", payload: { customerId: "customer_test" } }, "test-viewer-secret"), viewerMutationRes);
  assert.strictEqual(viewerMutationRes.statusCode, 403, "Viewer role must not execute system mutation actions.");
  assert.strictEqual(JSON.parse(viewerMutationRes.body).error, "forbidden");

  console.log(JSON.stringify({ ok: true, systemApiAuthentication: "enforced" }, null, 2));
})().catch((error) => {
  throw error;
});
