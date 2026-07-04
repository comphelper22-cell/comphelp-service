const { registry } = require("./public-api-registry");
const { apiKeys } = require("./api-key-manager");
const { webhooks } = require("./webhook-manager");
const { logs } = require("./integration-logs");
const { dashboard } = require("./integration-dashboard");

function status() {
  return {
    ok: true,
    status: "ready",
    engine: "Public API & Integrations Foundation",
    modules: ["registry", "apiKeys", "webhooks", "logs", "dashboard"],
    externalApisConnected: false,
    realSecretsExposed: false,
    webhookDeliveryEnabled: false,
    architectureOnly: true,
    generatedAt: new Date().toISOString()
  };
}

module.exports = {
  apiKeys,
  dashboard,
  logs,
  registry,
  status,
  webhooks
};
