const { estimate } = require("../agents/estimate-agent");

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

async function body(req) {
  if (typeof req.body === "object" && req.body) return req.body;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { ok: false, error: "Method not allowed" });
  try {
    return json(res, 200, { ok: true, estimate: estimate(await body(req)) });
  } catch (error) {
    return json(res, 500, { ok: false, error: error.message });
  }
};
