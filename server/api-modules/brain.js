const brain = require("../../brain");
const brainAgent = require("../../agents/brain-agent");

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
    process.env.MARKETPLACE_VIEWER_SECRET,
    process.env.ADMIN_UPLOAD_SECRET
  ].filter(Boolean);
  if (!secret) return { ok: false, status: 401, error: "Missing admin code." };
  if (!configured.length && process.env.NODE_ENV !== "production" && process.env.VERCEL_ENV !== "production") {
    return ["123456", "222222", "111111"].includes(secret) ? { ok: true } : { ok: false, status: 401, error: "Invalid admin code." };
  }
  if (!configured.length) return { ok: false, status: 500, error: "Brain secrets are not configured." };
  return configured.includes(secret) ? { ok: true } : { ok: false, status: 401, error: "Invalid admin code." };
}

function runAction(action, payload = {}) {
  const context = payload.context || payload;
  if (action === "brainStatus") return { ok: true, data: brain.brainStatus(context) };
  if (action === "brainHealth") return { ok: true, data: brain.brainHealth(context) };
  if (action === "recommendation") return { ok: true, data: brain.recommendation(payload) };
  if (action === "executiveSummary") return { ok: true, data: brain.executiveSummary(payload) };
  if (action === "memoryStatus") return { ok: true, data: brain.memoryManager.memoryStatus() };
  if (action === "knowledgeStatus") return { ok: true, data: brain.knowledgeRegistry.knowledgeStatus() };
  if (action === "brainAgent") return { ok: true, data: brainAgent.run(context) };
  return { ok: false, error: "unknown_brain_action" };
}

module.exports = async function handler(req, res) {
  try {
    if (req.method === "OPTIONS") return sendJson(res, 204, {});
    const auth = requireAccess(req);
    if (!auth.ok) return sendJson(res, auth.status, { ok: false, error: auth.error });
    if (req.method === "GET") return sendJson(res, 200, runAction("brainStatus", {}));
    if (req.method !== "POST") return sendJson(res, 405, { ok: false, error: "method_not_allowed" });
    const body = await readBody(req);
    const result = runAction(clean(body.action || "brainStatus", 80), body.payload || body);
    return sendJson(res, result.ok ? 200 : 400, result);
  } catch (error) {
    console.error("brain_api_error", error);
    return sendJson(res, 500, { ok: false, error: "server_error", message: clean(error.message, 500) });
  }
};

module.exports._internal = { runAction };
