const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

function clean(value, max = 1000) {
  return String(value || "").trim().slice(0, max);
}

function escapeHtml(value) {
  return clean(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function quoteHtml(estimate) {
  const rows = [
    ["Customer", estimate.customerName],
    ["City", estimate.city],
    ["Job Size", estimate.jobSize],
    ["Property Type", estimate.propertyType],
    ["Cameras / Devices", `${estimate.numberOfCamerasDevices || estimate.units || ""} ${estimate.unitLabel || ""}`],
    ["Estimate Range", estimate.range || (`$${estimate.low || ""} - $${estimate.high || ""}`)],
    ["Recommended Estimate", estimate.recommended ? `$${estimate.recommended}` : ""],
    ["Customer Quote", estimate.customerQuoteText]
  ].map((row) => `<tr><td>${escapeHtml(row[0])}</td><td>${escapeHtml(row[1])}</td></tr>`).join("");
  const pdfUrl = `?id=${encodeURIComponent(estimate.id || "")}&expires=${encodeURIComponent(estimate.quoteExpires || "")}&token=${encodeURIComponent(estimate.quoteToken || "")}&format=pdf`;
  return `<!doctype html><html><head><meta charset="utf-8"><title>CompHelp Service Quote</title><style>body{font-family:Arial,sans-serif;margin:2rem;color:#111}.box{border:1px solid #ddd;border-radius:10px;padding:1rem}h1{color:#0a5}table{width:100%;border-collapse:collapse;margin:1rem 0}td{border-top:1px solid #ddd;padding:.65rem}.total{font-size:1.4rem;font-weight:800}.muted{color:#555;font-size:.92rem}@media print{button,a.print-hide{display:none}}</style></head><body><button onclick="print()">Save as PDF</button> <a class="print-hide" href="${pdfUrl}">Download PDF</a><h1>CompHelp Service Quote</h1><p>Phone: +1 (747) 295-1440<br>Email: comphelper22@gmail.com</p><div class="box"><h2>${escapeHtml(estimate.service || "Service Estimate")}</h2><table>${rows}</table><p>${escapeHtml(estimate.disclaimer || "Final pricing depends on project details.")}</p></div></body></html>`;
}

function pdfEscape(value) {
  return clean(value, 500).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function quotePdf(estimate) {
  const lines = [
    "CompHelp Service Quote",
    "Phone: +1 (747) 295-1440",
    "Email: comphelper22@gmail.com",
    "",
    `Service: ${estimate.service || "Service Estimate"}`,
    `Customer: ${estimate.customerName || "Customer"}`,
    `City: ${estimate.city || "Los Angeles"}`,
    `Job Size: ${estimate.jobSize || ""}`,
    `Property Type: ${estimate.propertyType || ""}`,
    `Cameras / Devices: ${estimate.numberOfCamerasDevices || estimate.units || 1} ${estimate.unitLabel || "project"}`,
    `Estimate Range: ${estimate.range || ("$" + estimate.low + " - $" + estimate.high)}`,
    `Recommended Estimate: $${estimate.recommended || ""}`,
    `Customer Quote: ${estimate.customerQuoteText || ""}`,
    "",
    estimate.disclaimer || "Final pricing depends on project details."
  ];
  const text = lines.map((line, index) => `BT /F1 12 Tf 72 ${740 - index * 22} Td (${pdfEscape(line)}) Tj ET`).join("\n");
  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj",
    "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
    `5 0 obj << /Length ${Buffer.byteLength(text)} >> stream\n${text}\nendstream endobj`
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (const object of objects) {
    offsets.push(Buffer.byteLength(pdf));
    pdf += object + "\n";
  }
  const xref = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => { pdf += `${String(offset).padStart(10, "0")} 00000 n \n`; });
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(pdf, "utf8");
}

function fromDbRecord(record) {
  const out = {};
  for (const [key, value] of Object.entries(record || {})) {
    out[key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())] = value;
  }
  return out;
}

async function loadEstimateFromSupabase(id) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY || !id) return null;
  const base = String(process.env.SUPABASE_URL).replace(/\/$/, "");
  const response = await fetch(`${base}/rest/v1/marketplace_estimates?id=eq.${encodeURIComponent(id)}&select=*&limit=1`, {
    headers: {
      "apikey": process.env.SUPABASE_SERVICE_ROLE_KEY,
      "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
    }
  });
  const rows = await response.json().catch(() => []);
  return Array.isArray(rows) && rows[0] ? fromDbRecord(rows[0]) : null;
}

function quoteSecret() {
  return clean(process.env.MARKETPLACE_QUOTE_SECRET || process.env.MARKETPLACE_ADMIN_SECRET || process.env.ADMIN_UPLOAD_SECRET, 500);
}

function validQuoteToken(id, expires, token) {
  const secret = quoteSecret();
  const expiry = Number(expires);
  if (!secret || !id || !token || !Number.isFinite(expiry) || expiry <= Date.now()) return false;
  const expected = crypto.createHmac("sha256", secret).update(`${id}.${expiry}`).digest("hex");
  const actualBuffer = Buffer.from(String(token), "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");
  return actualBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(actualBuffer, expectedBuffer);
}

function sendError(res, statusCode, message) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  return res.end(`<!doctype html><html><head><meta charset="utf-8"><title>Quote unavailable</title></head><body><h1>Quote unavailable</h1><p>${escapeHtml(message)}</p></body></html>`);
}

module.exports = async function handler(req, res) {
  const id = clean(req.query && req.query.id, 120);
  const expires = clean(req.query && req.query.expires, 30);
  const token = clean(req.query && req.query.token, 200);
  if (!id || !expires || !token) return sendError(res, 400, "This quote link is incomplete.");
  if (!quoteSecret()) return sendError(res, 503, "Quote links are temporarily unavailable.");
  if (!validQuoteToken(id, expires, token)) return sendError(res, 403, "This quote link is invalid or expired.");

  let estimate = null;
  try {
    estimate = await loadEstimateFromSupabase(id);
    if (!estimate) {
      const seed = JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", "marketplace.json"), "utf8"));
      estimate = (seed.estimates || []).find((item) => item.id === id) || null;
    }
  } catch (_) {
    return sendError(res, 500, "The quote could not be loaded. Please contact CompHelp Service.");
  }
  if (!estimate) return sendError(res, 404, "This quote was not found.");
  estimate = { ...estimate, quoteExpires: expires, quoteToken: token };

  res.statusCode = 200;
  if (req.query && req.query.format === "pdf") {
    const pdf = quotePdf(estimate);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="comphelp-service-quote-${id}.pdf"`);
    return res.end(pdf);
  }
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(quoteHtml(estimate));
};
