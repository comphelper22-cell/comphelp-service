const { registry } = require("./public-api-registry");
const { apiKeys } = require("./api-key-manager");
const { webhooks } = require("./webhook-manager");
const { logs } = require("./integration-logs");

function dashboard(input = {}) {
  const registryData = registry(input).data;
  const apiKeyData = apiKeys(input).data;
  const webhookData = webhooks(input).data;
  const logData = logs(input).data;
  return {
    ok: true,
    data: {
      registry: registryData.registry,
      apiKeys: apiKeyData.apiKeys,
      webhooks: webhookData.webhooks,
      connectedApps: registryData.connectedApps,
      integrationLogs: logData.logs,
      developerNotes: [
        "External APIs are not connected in Sprint 17.",
        "API keys are metadata only; real secrets must live in environment variables or a secrets manager.",
        "Webhook delivery is disabled until signature verification and retries are implemented.",
        "Public endpoints should enforce tenant isolation before production launch."
      ],
      integrationHealth: {
        publicApiReady: registryData.publicApiReady,
        externalConnectionsEnabled: false,
        realSecretsExposed: false,
        webhookDeliveryEnabled: false,
        status: "architecture_ready"
      },
      generatedAt: new Date().toISOString()
    }
  };
}

module.exports = { dashboard };
