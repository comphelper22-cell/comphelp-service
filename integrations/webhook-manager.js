const { readIntegrationData } = require("./public-api-registry");

function webhooks(input = {}) {
  const data = readIntegrationData(input);
  return {
    ok: true,
    data: {
      webhooks: data.webhooks.map((webhook) => ({
        id: webhook.id || webhook.name || "webhook",
        name: webhook.name || "Webhook",
        event: webhook.event || "event.created",
        targetUrl: safeUrl(webhook.targetUrl || webhook.url),
        status: webhook.status || "draft",
        signingSecretStored: false
      })),
      deliveryEnabled: false,
      generatedAt: new Date().toISOString()
    }
  };
}

function safeUrl(value) {
  const text = String(value || "");
  if (!text) return "";
  return text.replace(/([?&](?:token|key|secret)=)[^&]+/gi, "$1masked");
}

module.exports = { webhooks };
