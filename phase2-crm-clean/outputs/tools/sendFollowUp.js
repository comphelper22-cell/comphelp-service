function clean(value, max = 1000) {
  return String(value || "").trim().slice(0, max);
}

function normalizePhone(value) {
  const raw = clean(value, 80);
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return raw.startsWith("+") ? raw : "";
}

function buildMessage(input = {}) {
  const name = clean(input.name, 120) || "there";
  const service = clean(input.service, 140) || "your service request";
  const type = clean(input.type, 40) || "sms";
  const mode = clean(input.mode, 40) || "lead_confirmation";

  if (mode === "review_request") {
    return type === "email"
      ? {
          subject: "Thank you for choosing CompHelp Service",
          body: `Hi ${name},\n\nThank you for choosing CompHelp Service.\n\nPlease leave a review when you have a moment.\n\nCompHelp Service\n+1 (747) 295-1440`
        }
      : {
          body: "Thank you for choosing CompHelp Service.\n\nPlease leave a review."
        };
  }

  return type === "email"
    ? {
        subject: `CompHelp Service received your ${service} request`,
        body: `Hi ${name},\n\nThanks for contacting CompHelp Service.\n\nWe received your request for ${service}.\n\nWe'll contact you shortly.\n\nCompHelp Service\n+1 (747) 295-1440`
      }
    : {
        body: `Hi ${name},\n\nThanks for contacting CompHelp Service.\n\nWe received your request for ${service}.\n\nWe'll contact you shortly.`
      };
}

async function sendSms(input, message) {
  const to = normalizePhone(input.phone);
  if (!to) throw new Error("A valid customer phone is required.");
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_FROM_NUMBER) {
    throw new Error("Twilio environment variables are not configured.");
  }

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
        Body: message.body
      })
    }
  );

  if (!response.ok) throw new Error("Twilio SMS failed.");
  return { ok: true, channel: "sms", to };
}

async function sendFollowUp(input = {}) {
  const type = clean(input.type, 40) || "sms";
  const message = buildMessage(input);

  if (!input.approved) {
    return {
      ok: true,
      previewOnly: true,
      requiresApproval: true,
      type,
      message,
      note: "Approval is required before sending SMS or email."
    };
  }

  if (type === "sms") {
    return sendSms(input, message);
  }

  return {
    ok: false,
    error: "Email sending is not configured in this agent. Use the generated email copy or add an email provider.",
    message
  };
}

module.exports = {
  sendFollowUp,
  buildMessage
};
