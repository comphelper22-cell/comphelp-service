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
  const digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  if (digits.length === 10) return "+1" + digits;
  if (digits.length === 11 && digits.startsWith("1")) return "+" + digits;
  return digits;
}

async function sendReviewSms(phone) {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_FROM_NUMBER) {
    throw new Error("Twilio is not configured");
  }

  const to = normalizePhone(phone);
  if (!to) throw new Error("Phone is required");

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

  if (!response.ok) throw new Error("Review SMS failed");
}

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") return json(res, 204, {});
  if (req.method !== "POST") return json(res, 405, { ok: false, error: "Method not allowed" });

  try {
    if (process.env.JOB_COMPLETE_WEBHOOK_SECRET) {
      const auth = req.headers?.authorization || req.headers?.Authorization || "";
      const token = auth.replace(/^Bearer\s+/i, "");
      if (token !== process.env.JOB_COMPLETE_WEBHOOK_SECRET) {
        return json(res, 401, { ok: false, error: "Unauthorized" });
      }
    }

    const body = typeof req.body === "object" && req.body ? req.body : JSON.parse(req.body || "{}");
    await sendReviewSms(body.phone || body.customerPhone);
    return json(res, 200, { ok: true, message: "Review SMS sent" });
  } catch (error) {
    return json(res, 500, { ok: false, error: "Could not send review SMS" });
  }
};
