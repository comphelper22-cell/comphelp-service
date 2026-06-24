const DEFAULT_WEBHOOK_URL = process.env.GOOGLE_SHEETS_WEBHOOK_URL || "";

function clean(value, max = 1000) {
  return String(value || "").trim().slice(0, max);
}

function isValidEmail(value) {
  return !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value) {
  const digits = String(value || "").replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

function normalizeLead(input = {}) {
  return {
    timestamp: clean(input.timestamp, 80) || new Date().toISOString(),
    source: clean(input.source, 80) || "ai_employee_agent",
    name: clean(input.name, 120),
    phone: clean(input.phone, 80),
    email: clean(input.email, 160),
    address: clean(input.address, 300),
    service: clean(input.service, 140),
    preferredDate: clean(input.preferredDate || input.preferred_date, 140),
    message: clean(input.message, 1800),
    pageUrl: clean(input.pageUrl || input.page_url, 500)
  };
}

function validateLead(lead) {
  const missing = [];
  for (const field of ["name", "phone", "service"]) {
    if (!lead[field]) missing.push(field);
  }
  if (!isValidPhone(lead.phone)) missing.push("valid phone");
  if (!isValidEmail(lead.email)) missing.push("valid email");
  return missing;
}

async function saveLead(input = {}) {
  const lead = normalizeLead(input);
  const missing = validateLead(lead);

  if (missing.length) {
    return {
      ok: false,
      error: "Lead is missing required information.",
      missing,
      lead
    };
  }

  const webhookUrl = clean(input.webhookUrl || DEFAULT_WEBHOOK_URL, 1000);
  if (!webhookUrl) {
    return {
      ok: false,
      error: "GOOGLE_SHEETS_WEBHOOK_URL is not configured.",
      lead
    };
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lead)
  });

  if (!response.ok) {
    return {
      ok: false,
      error: "Google Sheets webhook failed.",
      status: response.status,
      lead
    };
  }

  return {
    ok: true,
    saved: true,
    lead
  };
}

module.exports = {
  saveLead,
  normalizeLead,
  validateLead
};
