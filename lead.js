const BASE_REQUIRED_FIELDS = ["name", "phone", "service"];
const WEBSITE_REQUIRED_FIELDS = ["email", "message"];

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", process.env.ALLOWED_ORIGIN || "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.end(JSON.stringify(body));
}

function clean(value, max = 1000) {
  return String(value || "").trim().slice(0, max);
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value) {
  const digits = String(value || "").replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function normalizeLead(body) {
  return {
    source: clean(body.source, 80) || "website_form",
    name: clean(body.name, 120),
    phone: clean(body.phone, 60),
    email: clean(body.email, 160),
    service: clean(body.service, 120),
    serviceArea: clean(body.serviceArea, 120),
    timeline: clean(body.timeline, 120),
    address: clean(body.address, 300),
    message: clean(body.message, 1800) || "Lead submitted from CompHelp Service website.",
    pageUrl: clean(body.pageUrl || body.page_url, 500),
    utmSource: clean(body.utmSource, 120),
    utmMedium: clean(body.utmMedium, 120),
    utmCampaign: clean(body.utmCampaign, 160),
    gclid: clean(body.gclid, 200),
    fbclid: clean(body.fbclid, 200),
    submittedAt: clean(body.submittedAt || body.timestamp, 80) || new Date().toISOString(),
    userAgent: clean(body.userAgent, 300)
  };
}

async function forwardToGoogleSheets(lead) {
  if (!process.env.GOOGLE_SHEETS_WEBHOOK_URL) return { skipped: true };

  const response = await fetch(process.env.GOOGLE_SHEETS_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lead)
  });

  if (!response.ok) {
    throw new Error("Google Sheets webhook failed");
  }
  return { ok: true };
}

async function sendEmail(lead) {
  if (!process.env.RESEND_API_KEY || !process.env.LEAD_TO_EMAIL || !process.env.LEAD_FROM_EMAIL) {
    return { skipped: true };
  }

  const subject = `New CompHelp Service lead: ${lead.service} in ${lead.serviceArea}`;
  const html = `
    <h2>New CompHelp Service lead</h2>
    <p><strong>Source:</strong> ${escapeHtml(lead.source)}</p>
    <p><strong>Name:</strong> ${escapeHtml(lead.name)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(lead.phone)}</p>
    <p><strong>Email:</strong> ${escapeHtml(lead.email)}</p>
    <p><strong>Service:</strong> ${escapeHtml(lead.service)}</p>
    <p><strong>Area:</strong> ${escapeHtml(lead.serviceArea)}</p>
    <p><strong>Timeline:</strong> ${escapeHtml(lead.timeline)}</p>
    <p><strong>Address:</strong> ${escapeHtml(lead.address)}</p>
    <p><strong>Message:</strong><br>${escapeHtml(lead.message).replace(/\n/g, "<br>")}</p>
    <hr>
    <p><strong>Page:</strong> ${escapeHtml(lead.pageUrl)}</p>
    <p><strong>UTM:</strong> ${escapeHtml(lead.utmSource)} / ${escapeHtml(lead.utmMedium)} / ${escapeHtml(lead.utmCampaign)}</p>
    <p><strong>Click IDs:</strong> gclid=${escapeHtml(lead.gclid || "-")} fbclid=${escapeHtml(lead.fbclid || "-")}</p>
    <p><strong>Submitted:</strong> ${escapeHtml(lead.submittedAt)}</p>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: process.env.LEAD_FROM_EMAIL,
      to: [process.env.LEAD_TO_EMAIL],
      reply_to: lead.email,
      subject,
      html
    })
  });

  if (!response.ok) {
    throw new Error("Email API failed");
  }
  return { ok: true };
}

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") return json(res, 204, {});
  if (req.method !== "POST") return json(res, 405, { ok: false, error: "Method not allowed" });

  try {
    const body = typeof req.body === "object" && req.body ? req.body : JSON.parse(req.body || "{}");
    if (clean(body.company)) {
      return json(res, 400, { ok: false, error: "Spam blocked" });
    }
    if (body.formStartedAt && Date.now() - Number(body.formStartedAt) < 3000) {
      return json(res, 400, { ok: false, error: "Spam blocked" });
    }

    const lead = normalizeLead(body);
    const requiredFields = lead.source === "chatbot"
      ? BASE_REQUIRED_FIELDS
      : BASE_REQUIRED_FIELDS.concat(WEBSITE_REQUIRED_FIELDS);
    const missing = requiredFields.filter((field) => !lead[field]);
    if (missing.length || (lead.email && !isValidEmail(lead.email)) || !isValidPhone(lead.phone)) {
      return json(res, 400, { ok: false, error: "Missing required lead fields" });
    }

    const results = await Promise.allSettled([
      forwardToGoogleSheets(lead),
      sendEmail(lead)
    ]);
    const failures = results.filter((result) => result.status === "rejected");
    const successes = results.filter((result) => result.status === "fulfilled" && !result.value.skipped);

    if (!successes.length && failures.length) {
      throw failures[0].reason;
    }

    return json(res, 200, {
      ok: true,
      delivered: successes.length,
      configured: {
        googleSheets: Boolean(process.env.GOOGLE_SHEETS_WEBHOOK_URL),
        email: Boolean(process.env.RESEND_API_KEY && process.env.LEAD_TO_EMAIL && process.env.LEAD_FROM_EMAIL)
      }
    });
  } catch (error) {
    return json(res, 500, { ok: false, error: "Lead delivery failed" });
  }
};
