const { findSocialLeads, saveSocialLead, contentPlan } = require("../agents/social-lead-finder-agent");
const { createOutreachDraft, summary, pause } = require("../agents/social-outreach-agent");

function sendJson(res, statusCode, body) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

function clean(value, max = 1000) {
  return String(value || "").trim().slice(0, max);
}

async function readBody(req) {
  if (typeof req.body === "object" && req.body) return req.body;
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

function requireAccess(req, options = {}) {
  const secret = clean(req.headers["x-marketplace-admin-secret"], 500);
  const writeSecrets = [
    process.env.MARKETPLACE_ADMIN_SECRET,
    process.env.MARKETPLACE_MANAGER_SECRET,
    process.env.ADMIN_UPLOAD_SECRET
  ].filter(Boolean);
  const viewerSecrets = options.allowViewer ? [process.env.MARKETPLACE_VIEWER_SECRET].filter(Boolean) : [];
  const allowed = writeSecrets.concat(viewerSecrets);
  if (!secret) return { ok: false, status: 401, error: "Missing admin code." };
  if (!allowed.length && process.env.NODE_ENV !== "production" && process.env.VERCEL_ENV !== "production") {
    const demoCodes = options.allowViewer ? ["123456", "222222", "111111"] : ["123456", "222222"];
    return demoCodes.includes(secret) ? { ok: true } : { ok: false, status: 401, error: "Invalid admin code." };
  }
  if (!allowed.length) return { ok: false, status: 500, error: "Admin secret is not configured." };
  if (!allowed.includes(secret)) return { ok: false, status: 401, error: "Invalid admin code." };
  return { ok: true };
}

module.exports = async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const readAuth = requireAccess(req, { allowViewer: true });
      if (!readAuth.ok) return sendJson(res, readAuth.status, { ok: false, error: readAuth.error });
      return sendJson(res, 200, { ok: true, social: summary() });
    }
    if (req.method !== "POST") return sendJson(res, 405, { ok: false, error: "method_not_allowed" });
    const auth = requireAccess(req);
    if (!auth.ok) return sendJson(res, auth.status, { ok: false, error: auth.error });
    const input = await readBody(req);
    const action = clean(input.action || "summary", 80);
    if (action === "summary") return sendJson(res, 200, { ok: true, social: summary() });
    if (action === "findSocialLeads") return sendJson(res, 200, { ok: true, result: findSocialLeads(input) });
    if (action === "saveSocialLead") return sendJson(res, 200, { ok: true, lead: saveSocialLead(input) });
    if (action === "createSocialDraft") return sendJson(res, 200, { ok: true, draft: createOutreachDraft(input) });
    if (action === "contentPlan") return sendJson(res, 200, { ok: true, plan: contentPlan(input) });
    if (action === "pause") return sendJson(res, 200, { ok: true, queue: pause(true), social: summary() });
    if (action === "resume") return sendJson(res, 200, { ok: true, queue: pause(false), social: summary() });
    return sendJson(res, 400, { ok: false, error: "unknown_social_action" });
  } catch (error) {
    console.error("social_leads_api_error", error);
    return sendJson(res, 500, { ok: false, error: "server_error", message: clean(error.message, 500) });
  }
};
