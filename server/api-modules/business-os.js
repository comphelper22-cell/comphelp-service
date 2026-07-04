const business = require("../../agents/business-os-agent");

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

function role(req) {
  const secret = clean(req.headers["x-marketplace-admin-secret"], 500);
  const roles = [
    ["admin", process.env.MARKETPLACE_ADMIN_SECRET || process.env.ADMIN_UPLOAD_SECRET],
    ["manager", process.env.MARKETPLACE_MANAGER_SECRET],
    ["dispatcher", process.env.MARKETPLACE_DISPATCHER_SECRET],
    ["technician", process.env.MARKETPLACE_TECHNICIAN_SECRET],
    ["customer", process.env.MARKETPLACE_CUSTOMER_SECRET],
    ["viewer", process.env.MARKETPLACE_VIEWER_SECRET]
  ];
  const configured = roles.filter(([, value]) => Boolean(value));
  const found = roles.find(([, value]) => value && value === secret);
  if (found) return found[0];
  if (!configured.length && process.env.NODE_ENV !== "production" && process.env.VERCEL_ENV !== "production") {
    if (secret === "123456") return "admin";
    if (secret === "222222") return "manager";
    if (secret === "333333") return "dispatcher";
    if (secret === "444444") return "technician";
    if (secret === "555555") return "customer";
    if (secret === "111111") return "viewer";
  }
  return "";
}

function allowed(userRole, action) {
  const permissions = {
    admin: ["dashboard", "crm", "estimate", "dispatch", "analytics", "reports", "databaseHealth"],
    manager: ["dashboard", "crm", "estimate", "dispatch", "analytics", "reports", "databaseHealth"],
    dispatcher: ["dashboard", "crm", "estimate", "dispatch", "analytics", "databaseHealth"],
    technician: ["dashboard", "crm", "dispatch", "databaseHealth"],
    customer: ["estimate"],
    viewer: ["dashboard", "analytics", "databaseHealth"]
  };
  return permissions[userRole] && permissions[userRole].includes(action);
}

async function run(action, payload) {
  if (action === "dashboard") return { ok: true, dashboard: await business.businessDashboard() };
  if (action === "crm") return { ok: true, result: await business.crm(payload.crmAction || "list", payload) };
  if (action === "estimate") return { ok: true, estimate: await business.saveEstimate(payload) };
  if (action === "dispatch") return { ok: true, dispatch: await business.dispatch(payload) };
  if (action === "analytics") return { ok: true, analytics: await business.analytics(payload.period || "daily") };
  if (action === "reports") return { ok: true, reports: await business.reports() };
  if (action === "databaseHealth") return { ok: true, database: await business.databaseHealth() };
  return { ok: false, error: "unknown_business_action" };
}

module.exports = async function handler(req, res) {
  try {
    if (req.method === "OPTIONS") return sendJson(res, 204, {});
    const userRole = role(req);
    if (!userRole) return sendJson(res, 401, { ok: false, error: "Invalid or missing role code." });
    if (req.method === "GET") {
      if (!allowed(userRole, "dashboard")) return sendJson(res, 403, { ok: false, error: "Role does not have permission." });
      return sendJson(res, 200, await run("dashboard", {}));
    }
    if (req.method !== "POST") return sendJson(res, 405, { ok: false, error: "method_not_allowed" });
    const body = await readBody(req);
    const action = clean(body.action || "dashboard", 80);
    if (!allowed(userRole, action)) return sendJson(res, 403, { ok: false, error: "Role does not have permission." });
    const result = await run(action, body.payload || body);
    return sendJson(res, result.ok ? 200 : 400, result);
  } catch (error) {
    console.error("business_os_api_error", error);
    return sendJson(res, 500, { ok: false, error: "server_error", message: clean(error.message, 500) });
  }
};
