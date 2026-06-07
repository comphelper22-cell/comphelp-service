function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", process.env.ALLOWED_ORIGIN || "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.end(JSON.stringify(body));
}

function clean(value, max = 1200) {
  return String(value || "").trim().slice(0, max);
}

function extractReply(responseJson) {
  if (responseJson.output_text) return responseJson.output_text;

  const parts = [];
  for (const item of responseJson.output || []) {
    for (const content of item.content || []) {
      if (content.type === "output_text" && content.text) {
        parts.push(content.text);
      }
    }
  }
  return parts.join("\n").trim();
}

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") return json(res, 204, {});
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  if (!process.env.OPENAI_API_KEY) {
    return json(res, 500, { error: "OpenAI API key is not configured" });
  }

  try {
    const body = typeof req.body === "object" && req.body ? req.body : JSON.parse(req.body || "{}");
    const message = clean(body.message, 900);
    const history = Array.isArray(body.history) ? body.history.slice(-8) : [];
    const leadState = body.leadState && typeof body.leadState === "object" ? body.leadState : {};

    if (!message) {
      return json(res, 400, { error: "Message is required" });
    }

    const input = [
      {
        role: "developer",
        content: [
          {
            type: "input_text",
            text: [
              "You are the CompHelp Service website assistant for a Los Angeles and Burbank technology service business.",
              "Primary conversion goal: help qualified visitors request a quote or call +1-747-295-1440.",
              "Services: Security Camera Installation, Smart Home Setup, Computer Repair, WiFi & Network Installation.",
              "You can answer questions about security cameras, smart home setup, WiFi installation, and computer repair.",
              "The website collects chatbot leads automatically when name, phone, and service needed are present.",
              `Current lead state: service=${clean(leadState.service, 120) || "missing"}, name=${clean(leadState.name, 120) || "missing"}, phone=${clean(leadState.phone, 80) || "missing"}, propertyType=${clean(leadState.propertyType, 120) || "missing"}, numberOfCameras=${clean(leadState.numberOfCameras, 40) || "missing"}, address=${clean(leadState.address, 220) || "missing"}, desiredInstallationDate=${clean(leadState.desiredInstallationDate, 120) || "missing"}, missing=${clean(leadState.missing, 80) || "none"}.`,
              "Be concise, friendly, and practical. Ask at most one clarifying question.",
              "If a lead field is missing, naturally ask for that missing field while still answering the user's question.",
              "For security camera installation, after service, name, and phone are collected, the website will show: Based on your project, estimated installation starts at $299.",
              "After that estimate, the AI Sales Assistant must collect customer name, property type, number of cameras, address, and desired installation date.",
              "Do not invent exact availability, licenses, warranties, or final prices. Use starting-price language only.",
              "Do not say the lead has been saved; the website will show the saved confirmation after Google Sheets submission.",
              "If the visitor is ready, mention same-week Los Angeles and Burbank availability."
            ].join(" ")
          }
        ]
      }
    ];

    for (const item of history) {
      const role = item.role === "assistant" ? "assistant" : "user";
      const content = clean(item.content, 900);
      if (content) {
        input.push({ role, content: [{ type: "input_text", text: content }] });
      }
    }

    input.push({ role: "user", content: [{ type: "input_text", text: message }] });

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        input,
        max_output_tokens: 220
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return json(res, response.status, { error: "OpenAI request failed" });
    }

    const reply = extractReply(data) || "I can help with that. Please use the quote form or call +1-747-295-1440 for the fastest response.";
    return json(res, 200, { reply });
  } catch (error) {
    return json(res, 500, { error: "Chat request failed" });
  }
};
