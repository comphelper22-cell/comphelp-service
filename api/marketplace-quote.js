const fs = require("fs");
const path = require("path");

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
    ["Property Type", estimate.propertyType],
    ["Units", `${estimate.units || ""} ${estimate.unitLabel || ""}`],
    ["Labor Hours", estimate.laborHours],
    ["Labor Cost", estimate.laborCost ? `$${estimate.laborCost}` : ""],
    ["Material Estimate", estimate.materialEstimate ? `$${estimate.materialEstimate}` : ""],
    ["Profit Target", estimate.profitMargin ? `${estimate.profitMargin}%` : ""],
    ["Commission", estimate.commission ? `$${estimate.commission} (${estimate.commissionPercent || 0}%)` : ""],
    ["Internal Cost", estimate.internalCost ? `$${estimate.internalCost}` : ""],
    ["Expected Profit", estimate.expectedProfit ? `$${estimate.expectedProfit}` : ""],
    ["Estimate Range", estimate.range || (`$${estimate.low || ""} - $${estimate.high || ""}`)],
    ["Recommended Estimate", estimate.recommended ? `$${estimate.recommended}` : ""],
    ["Customer Quote", estimate.customerQuoteText],
    ["Notes", estimate.notes]
  ].map((row) => `<tr><td>${escapeHtml(row[0])}</td><td>${escapeHtml(row[1])}</td></tr>`).join("");
  return `<!doctype html><html><head><meta charset="utf-8"><title>CompHelp Service Quote</title><style>body{font-family:Arial,sans-serif;margin:2rem;color:#111}.box{border:1px solid #ddd;border-radius:10px;padding:1rem}h1{color:#0a5}table{width:100%;border-collapse:collapse;margin:1rem 0}td{border-top:1px solid #ddd;padding:.65rem}.total{font-size:1.4rem;font-weight:800}.muted{color:#555;font-size:.92rem}@media print{button,a.print-hide{display:none}}</style></head><body><button onclick="print()">Save as PDF</button> <a class="print-hide" href="?id=${encodeURIComponent(estimate.id || "")}&format=pdf">Download PDF</a><h1>CompHelp Service Quote</h1><p>Phone: +1 (747) 295-1440<br>Email: comphelper22@gmail.com</p><div class="box"><h2>${escapeHtml(estimate.service || "Service Estimate")}</h2><table>${rows}</table><p class="muted">${escapeHtml(estimate.internalNotes)}</p><p>${escapeHtml(estimate.disclaimer || "Final pricing depends on project details.")}</p></div></body></html>`;
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
    `Property Type: ${estimate.propertyType || ""}`,
    `Units: ${estimate.units || 1} ${estimate.unitLabel || "project"}`,
    `Labor Hours: ${estimate.laborHours || ""}`,
    `Labor Cost: $${estimate.laborCost || ""}`,
    `Material Estimate: $${estimate.materialEstimate || ""}`,
    `Profit Target: ${estimate.profitMargin || ""}%`,
    `Commission: $${estimate.commission || ""} (${estimate.commissionPercent || ""}%)`,
    `Internal Cost: $${estimate.internalCost || ""}`,
    `Expected Profit: $${estimate.expectedProfit || ""}`,
    `Estimate Range: ${estimate.range || ("$" + estimate.low + " - $" + estimate.high)}`,
    `Recommended Estimate: $${estimate.recommended || ""}`,
    `Customer Quote: ${estimate.customerQuoteText || ""}`,
    `Notes: ${estimate.notes || ""}`,
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

module.exports = async function handler(req, res) {
  const id = clean(req.query && req.query.id, 120);
  const fallback = {
    id,
    customerName: "Customer",
    service: "CompHelp Service",
    city: "Los Angeles",
    units: 1,
    unitLabel: "project",
    range: "Estimate pending",
    notes: "Open this quote after generating an estimate from Marketplace Manager.",
    disclaimer: "Final pricing depends on project details."
  };

  let estimate = fallback;
  try {
    estimate = await loadEstimateFromSupabase(id) || estimate;
    const seed = JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", "marketplace.json"), "utf8"));
    estimate = estimate.id !== id ? ((seed.estimates || []).find((item) => item.id === id) || estimate) : estimate;
  } catch (_) {
    estimate = fallback;
  }

  res.statusCode = 200;
  if (req.query && req.query.format === "pdf") {
    const pdf = quotePdf(estimate);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="comphelp-service-quote-${id || "estimate"}.pdf"`);
    return res.end(pdf);
  }
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(quoteHtml(estimate));
};
