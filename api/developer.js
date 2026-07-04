const {
  analyzeProject,
  validateProject,
  deploymentReport,
  databaseStatus,
  fullReport,
  gitStatus
} = require("../agents/developer-agent");

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
  if (!configured.length) return { ok: false, status: 500, error: "Developer Center secrets are not configured." };
  if (!configured.includes(secret)) return { ok: false, status: 401, error: "Invalid admin code." };
  return { ok: true };
}

async function runAction(action) {
  if (action === "gitStatus") return { ok: true, git: gitStatus() };
  if (action === "analyze") return { ok: true, report: analyzeProject() };
  if (action === "validate") return { ok: true, validation: validateProject() };
  if (action === "deployment") return { ok: true, deployment: deploymentReport() };
  if (action === "databaseStatus") return { ok: true, database: await databaseStatus() };
  if (action === "fullReport") return { ok: true, report: fullReport() };
  return { ok: false, error: "unknown_developer_action" };
}

module.exports = async function handler(req, res) {
  try {
    if (req.method === "OPTIONS") return sendJson(res, 204, {});
    const auth = requireAccess(req);
    if (!auth.ok) return sendJson(res, auth.status, { ok: false, error: auth.error });
    if (req.method === "GET") return sendJson(res, 200, await runAction("fullReport"));
    if (req.method !== "POST") return sendJson(res, 405, { ok: false, error: "method_not_allowed" });
    const input = await readBody(req);
    const result = await runAction(clean(input.action || "fullReport", 80));
    return sendJson(res, result.ok ? 200 : 400, result);
  } catch (error) {
    console.error("developer_api_error", error);
    return sendJson(res, 500, { ok: false, error: "server_error", message: clean(error.message, 500) });
  }
};
