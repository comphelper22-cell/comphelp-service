const { createFollowupDrafts, recordReply } = require("../agents/followup-agent");
const { complianceSummary, clean } = require("../agents/outreach-core");

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
  if (req.method === "GET") return json(res, 200, { ok: true, compliance: complianceSummary() });
  if (req.method !== "POST") return json(res, 405, { ok: false, error: "Method not allowed" });
  try {
    const input = await body(req);
    const action = clean(input.action || "draftFollowups", 50);
    if (action === "reply") return json(res, 200, { ok: true, result: recordReply(input.recipient, input.text) });
    return json(res, 200, { ok: true, drafts: createFollowupDrafts(input) });
  } catch (error) {
    return json(res, 500, { ok: false, error: error.message });
  }
};
