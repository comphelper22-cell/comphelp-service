const { findLeads, saveLead } = require("../agents/lead-finder-agent");
const { enqueueMessage, createMessageDraft, complianceSummary, pauseOutreach, addOptOut, clean } = require("../agents/outreach-core");

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
    const action = clean(input.action || "draft", 50);
    if (action === "findLeads") return json(res, 200, { ok: true, result: findLeads(input) });
    if (action === "saveLead") return json(res, 200, { ok: true, lead: saveLead(input) });
    if (action === "pause") return json(res, 200, { ok: true, queue: pauseOutreach(true) });
    if (action === "resume") return json(res, 200, { ok: true, queue: pauseOutreach(false) });
    if (action === "optout") return json(res, 200, { ok: true, optOuts: addOptOut(input.recipient, input.reason || "manual") });
    if (action === "queueMessage") {
      const bodyText = input.body || createMessageDraft(input);
      const queued = enqueueMessage({
        kind: "outreach",
        channel: input.channel || "draft",
        recipient: input.recipient || input.phone || input.email,
        businessName: input.businessName,
        body: bodyText,
        approved: input.approved === true,
        cold: true
      });
      return json(res, 200, { ok: true, message: queued });
    }
    return json(res, 400, { ok: false, error: "Unknown outreach action" });
  } catch (error) {
    return json(res, 500, { ok: false, error: error.message });
  }
};
