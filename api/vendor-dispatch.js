const { dispatchJob, compareVendorResponses, saveQuoteRequest } = require("../agents/dispatcher-agent");
const { findVendors, saveVendorProfile, compareVendors } = require("../agents/vendor-finder-agent");
const { clean } = require("../agents/outreach-core");

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
    const input = await body(req);
    const action = clean(input.action || "dispatch", 50);
    if (action === "findVendors") return json(res, 200, { ok: true, result: findVendors(input) });
    if (action === "saveVendor") return json(res, 200, { ok: true, vendor: saveVendorProfile(input) });
    if (action === "compareVendors") return json(res, 200, { ok: true, result: compareVendors(input) });
    if (action === "compareResponses") return json(res, 200, { ok: true, result: compareVendorResponses(input) });
    if (action === "saveQuoteRequest") return json(res, 200, { ok: true, quoteRequest: saveQuoteRequest(input) });
    return json(res, 200, { ok: true, dispatch: dispatchJob(input) });
  } catch (error) {
    return json(res, 500, { ok: false, error: error.message });
  }
};
