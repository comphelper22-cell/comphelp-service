const assert = require("assert");
const { Readable } = require("stream");
const systemHandler = require("../api/system");
const safeStorage = require("../storage/safe-storage");

const previous = process.env.SAFE_STORAGE_FORCE_MEMORY;
const previousAdminSecret = process.env.MARKETPLACE_ADMIN_SECRET;
process.env.SAFE_STORAGE_FORCE_MEMORY = "true";
process.env.MARKETPLACE_ADMIN_SECRET = "system-storage-test-secret";

function createReq(body) {
  const req = Readable.from([Buffer.from(JSON.stringify(body), "utf8")]);
  req.method = "POST";
  req.headers = { "content-type": "application/json", "x-marketplace-admin-secret": "system-storage-test-secret" };
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
  const req = createReq({
    module: "workflow",
    action: "workflow.trigger",
    payload: { event: "New Lead", leadId: "lead_production_storage_test" }
  });
  const res = createRes();
  await systemHandler(req, res);
  const parsed = JSON.parse(res.body);

  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(parsed.ok, true);
  assert.ok(parsed.data.executions.length > 0);
  assert.ok(
    parsed.data.warnings.includes(safeStorage.PRODUCTION_WRITE_WARNING),
    "System workflow response should include production storage warning."
  );

  if (previous === undefined) delete process.env.SAFE_STORAGE_FORCE_MEMORY;
  else process.env.SAFE_STORAGE_FORCE_MEMORY = previous;
  if (previousAdminSecret === undefined) delete process.env.MARKETPLACE_ADMIN_SECRET;
  else process.env.MARKETPLACE_ADMIN_SECRET = previousAdminSecret;

  console.log(JSON.stringify({
    ok: true,
    statusCode: res.statusCode,
    warning: safeStorage.PRODUCTION_WRITE_WARNING
  }, null, 2));
})().catch((error) => {
  if (previous === undefined) delete process.env.SAFE_STORAGE_FORCE_MEMORY;
  else process.env.SAFE_STORAGE_FORCE_MEMORY = previous;
  if (previousAdminSecret === undefined) delete process.env.MARKETPLACE_ADMIN_SECRET;
  else process.env.MARKETPLACE_ADMIN_SECRET = previousAdminSecret;
  throw error;
});
