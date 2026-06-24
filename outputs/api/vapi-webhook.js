function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", process.env.ALLOWED_ORIGIN || "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.end(JSON.stringify(body));
}

function clean(value, max = 1000) {
  return String(value || "").trim().slice(0, max);
}

function normalizePhone(value) {
  const raw = clean(value, 80);
  if (!raw) return "";
  const digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  if (digits.length === 10) return "+1" + digits;
  if (digits.length === 11 && digits.startsWith("1")) return "+" + digits;
  return digits;
}

function getCustomerPhone(message) {
  return normalizePhone(
    message?.call?.customer?.number ||
    message?.call?.phoneCallProviderDetails?.from ||
    message?.customer?.number ||
    ""
  );
}

function getToolCalls(message) {
  if (Array.isArray(message?.toolCallList)) return message.toolCallList;
  if (Array.isArray(message?.toolWithToolCallList)) {
    return message.toolWithToolCallList.map((item) => ({
      id: item.toolCall?.id,
      name: item.name || item.toolCall?.name,
      parameters: item.toolCall?.parameters || {}
    }));
  }
  return [];
}

function normalizeLead(parameters, message) {
  return {
    name: clean(parameters.name || parameters.customerName || parameters.customer_name, 120),
    phone: normalizePhone(parameters.phone || parameters.customerPhone || getCustomerPhone(message)),
    email: clean(parameters.email, 160),
    service: clean(parameters.service || parameters.serviceNeeded || parameters.service_needed, 140),
    message: clean(parameters.notes || parameters.message || "Vapi voice assistant lead", 1800),
    address: clean(parameters.address || parameters.installationAddress || parameters.installation_address, 300),
    preferredDate: clean(parameters.preferredDate || parameters.preferred_date || parameters.desiredInstallationDate, 120),
    propertyType: clean(parameters.propertyType || parameters.property_type, 120),
    numberOfCameras: clean(parameters.numberOfCameras || parameters.number_of_cameras, 40),
    source: "vapi_voice_assistant",
    timestamp: new Date().toISOString()
  };
}

function validateLead(lead) {
  const missing = [];
  if (!lead.name) missing.push("name");
  if (!lead.phone) missing.push("phone");
  if (!lead.service) missing.push("service");
  if (!lead.address) missing.push("address");
  if (!lead.preferredDate) missing.push("preferredDate");
  return missing;
}

async function saveLeadToCrm(lead) {
  if (!process.env.GOOGLE_SHEETS_WEBHOOK_URL) {
    throw new Error("GOOGLE_SHEETS_WEBHOOK_URL is not configured");
  }

  const body = new URLSearchParams({
    name: lead.name,
    phone: lead.phone,
    email: lead.email,
    service: lead.service,
    message: lead.message,
    address: lead.address,
    preferredDate: lead.preferredDate,
    propertyType: lead.propertyType,
    numberOfCameras: lead.numberOfCameras,
    source: lead.source,
    timestamp: lead.timestamp,
    company: "",
    formStartedAt: String(Date.now() - 10000)
  });

  const response = await fetch(process.env.GOOGLE_SHEETS_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });

  if (!response.ok) {
    throw new Error("CRM save failed");
  }

  return true;
}

async function sendSmsConfirmation(lead) {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_FROM_NUMBER) {
    return { skipped: true };
  }

  const text = [
    `Hi ${lead.name},`,
    "",
    "Thanks for contacting CompHelp Service.",
    "",
    `We received your request for ${lead.service.toLowerCase()}.`,
    "",
    "We'll contact you shortly."
  ].join("\n");

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(process.env.TWILIO_ACCOUNT_SID)}/Messages.json`,
    {
      method: "POST",
      headers: {
        "Authorization": "Basic " + Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        From: process.env.TWILIO_FROM_NUMBER,
        To: lead.phone,
        Body: text
      })
    }
  );

  if (!response.ok) {
    throw new Error("SMS confirmation failed");
  }

  return { ok: true };
}

async function sendFinishedWorkReviewSms(phone) {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_FROM_NUMBER) {
    return { skipped: true };
  }

  const to = normalizePhone(phone);
  if (!to) {
    throw new Error("Customer phone is required");
  }

  const text = [
    "Thank you for choosing CompHelp Service.",
    "",
    "Please leave a review."
  ].join("\n");

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(process.env.TWILIO_ACCOUNT_SID)}/Messages.json`,
    {
      method: "POST",
      headers: {
        "Authorization": "Basic " + Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        From: process.env.TWILIO_FROM_NUMBER,
        To: to,
        Body: text
      })
    }
  );

  if (!response.ok) {
    throw new Error("Finished work review SMS failed");
  }

  return { ok: true };
}

async function handleSaveLeadTool(toolCall, message) {
  const lead = normalizeLead(toolCall.parameters || {}, message);
  const missing = validateLead(lead);

  if (missing.length) {
    return {
      name: toolCall.name || "saveLeadAndSendSms",
      toolCallId: toolCall.id,
      result: JSON.stringify({
        ok: false,
        missing,
        message: "Please collect the missing fields before saving the lead."
      })
    };
  }

  await saveLeadToCrm(lead);
  const sms = await sendSmsConfirmation(lead);

  return {
    name: toolCall.name || "saveLeadAndSendSms",
    toolCallId: toolCall.id,
    result: JSON.stringify({
      ok: true,
      crmSaved: true,
      smsSent: Boolean(sms.ok),
      smsSkipped: Boolean(sms.skipped),
      message: "Lead saved and confirmation handled."
    })
  };
}

async function handleReviewSmsTool(toolCall, message) {
  const parameters = toolCall.parameters || {};
  const phone = parameters.phone || parameters.customerPhone || getCustomerPhone(message);
  const sms = await sendFinishedWorkReviewSms(phone);

  return {
    name: toolCall.name || "sendFinishedWorkReviewSms",
    toolCallId: toolCall.id,
    result: JSON.stringify({
      ok: true,
      smsSent: Boolean(sms.ok),
      smsSkipped: Boolean(sms.skipped),
      message: "Finished work review SMS handled."
    })
  };
}

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") return json(res, 204, {});
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  try {
    if (process.env.VAPI_WEBHOOK_SECRET) {
      const auth = req.headers?.authorization || req.headers?.Authorization || "";
      const token = auth.replace(/^Bearer\s+/i, "");
      if (token !== process.env.VAPI_WEBHOOK_SECRET) {
        return json(res, 401, { error: "Unauthorized" });
      }
    }

    const body = typeof req.body === "object" && req.body ? req.body : JSON.parse(req.body || "{}");
    const message = body.message || body;

    if (message.type !== "tool-calls") {
      return json(res, 200, { ok: true, received: message.type || "unknown" });
    }

    const results = [];
    for (const toolCall of getToolCalls(message)) {
      if (toolCall.name === "saveLeadAndSendSms") {
        results.push(await handleSaveLeadTool(toolCall, message));
      } else if (toolCall.name === "sendFinishedWorkReviewSms") {
        results.push(await handleReviewSmsTool(toolCall, message));
      } else {
        results.push({
          name: toolCall.name,
          toolCallId: toolCall.id,
          result: JSON.stringify({ ok: false, message: "Unknown tool" })
        });
      }
    }

    return json(res, 200, { results });
  } catch (error) {
    return json(res, 500, { error: "Vapi webhook failed" });
  }
};
