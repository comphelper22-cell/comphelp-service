const platform = require("../../agents/platform-agent");

function clean(value, max = 500) {
  return String(value || "").trim().slice(0, max);
}

function sendJson(res, statusCode, body) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

async function readBody(req) {
  if (typeof req.body === "object" && req.body) return req.body;
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

function requireAccess(req) {
  const secret = clean(req.headers["x-marketplace-admin-secret"], 500);
  const configured = [
    process.env.MARKETPLACE_ADMIN_SECRET,
    process.env.MARKETPLACE_MANAGER_SECRET,
    process.env.ADMIN_UPLOAD_SECRET
  ].filter(Boolean);
  if (!secret) return { ok: false, status: 401, error: "Missing admin code." };
  if (!configured.length && process.env.NODE_ENV !== "production" && process.env.VERCEL_ENV !== "production") {
    return ["123456", "222222"].includes(secret) ? { ok: true } : { ok: false, status: 401, error: "Invalid admin code." };
  }
  if (!configured.length) return { ok: false, status: 500, error: "Platform secrets are not configured." };
  return configured.includes(secret) ? { ok: true } : { ok: false, status: 401, error: "Invalid admin code." };
}

async function runAction(action, payload) {
  if (action === "platformStatus") return { ok: true, platform: await platform.platformStatus() };
  if (action === "ensureDefaults") return platform.ensureDefaults();
  if (action === "createOrganization") return platform.createOrganization(payload);
  if (action === "createUser") return platform.createUser(payload);
  if (action === "createSession") return platform.createSession(payload);
  if (action === "revokeSession") return platform.revokeSession(payload.sessionId, payload.actorId);
  if (action === "createNotification") return platform.createNotification(payload);
  if (action === "updatePreference") return platform.updatePreference(payload);
  if (action === "audit") return platform.audit(payload.auditAction || "manual_audit", payload);
  return { ok: false, error: "unknown_platform_action" };
}

module.exports = async function handler(req, res) {
  try {
    if (req.method === "OPTIONS") return sendJson(res, 204, {});
    const auth = requireAccess(req);
    if (!auth.ok) return sendJson(res, auth.status, { ok: false, error: auth.error });
    if (req.method === "GET") return sendJson(res, 200, { ok: true, platform: await platform.platformStatus() });
    if (req.method !== "POST") return sendJson(res, 405, { ok: false, error: "method_not_allowed" });
    const body = await readBody(req);
    const action = clean(body.action || "platformStatus", 80);
    const result = await runAction(action, body.payload || body);
    return sendJson(res, result.ok ? 200 : 400, result);
  } catch (error) {
    console.error("platform_api_error", error);
    return sendJson(res, 500, { ok: false, error: "server_error", message: clean(error.message, 500) });
  }
};
