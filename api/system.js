const developer = require("../server/api-modules/developer");
const businessOs = require("../server/api-modules/business-os");
const platform = require("../server/api-modules/platform");
const titan = require("../server/api-modules/titan");
const brain = require("../server/api-modules/brain");

const modules = {
  developer,
  "business-os": businessOs,
  business: businessOs,
  platform,
  titan,
  brain
};

function clean(value, max = 120) {
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

module.exports = async function handler(req, res) {
  try {
    if (req.method === "OPTIONS") return sendJson(res, 204, {});
    if (req.method === "GET") {
      return sendJson(res, 200, {
        ok: true,
        data: {
          router: "system",
          modules: ["developer", "business-os", "platform", "titan", "brain"]
        }
      });
    }
    if (req.method !== "POST") return sendJson(res, 405, { ok: false, error: "method_not_allowed" });

    const body = await readBody(req);
    const moduleName = clean(body.module, 80);
    const action = clean(body.action, 120);
    const target = modules[moduleName];
    if (!target) return sendJson(res, 400, { ok: false, error: "unknown_system_module" });
    if (!action) return sendJson(res, 400, { ok: false, error: "missing_system_action" });

    req.body = {
      ...(body.payload || {}),
      payload: body.payload || {},
      action
    };
    return target(req, res);
  } catch (error) {
    console.error("system_api_error", error);
    return sendJson(res, 500, { ok: false, error: "server_error", message: clean(error.message, 500) });
  }
};
