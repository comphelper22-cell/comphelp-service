const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const MARKETPLACE_FILE = path.join(ROOT, "data", "marketplace.json");

function readIntegrationData(input = {}) {
  if (input.data) return normalize(input.data, false);
  try {
    const parsed = JSON.parse(fs.readFileSync(MARKETPLACE_FILE, "utf8").replace(/^\uFEFF/, ""));
    return normalize(parsed, false);
  } catch (_) {
    return normalize({}, true);
  }
}

function normalize(data = {}, forcedDemo = false) {
  const registry = arr(data.publicApiRegistry || data.integrationsRegistry);
  const apiKeys = arr(data.apiKeys || data.integrationApiKeys);
  const webhooks = arr(data.webhooks || data.integrationWebhooks);
  const logs = arr(data.integrationLogs);
  const connectedApps = arr(data.connectedApps || data.integrations);
  const hasIntegrationData = registry.length || apiKeys.length || webhooks.length || logs.length || connectedApps.length;
  if (forcedDemo || !hasIntegrationData) return demoData();
  return { registry, apiKeys, webhooks, logs, connectedApps, demoMode: false };
}

function registry(input = {}) {
  const data = readIntegrationData(input);
  return {
    ok: true,
    data: {
      registry: data.registry,
      connectedApps: data.connectedApps,
      publicApiReady: true,
      externalConnectionsEnabled: false,
      demoMode: data.demoMode,
      generatedAt: new Date().toISOString()
    }
  };
}

function demoData() {
  return {
    demoMode: true,
    registry: [
      { name: "Leads API", version: "v1", endpoint: "/api/public/leads", method: "POST", status: "planned", auth: "api_key" },
      { name: "Projects API", version: "v1", endpoint: "/api/public/projects", method: "POST", status: "planned", auth: "api_key" },
      { name: "Webhook Receiver", version: "v1", endpoint: "/api/public/webhooks", method: "POST", status: "planned", auth: "signature" }
    ],
    apiKeys: [
      { id: "key_demo", name: "Demo Partner Key", prefix: "ch_demo", scopes: ["leads:write"], status: "draft", lastUsedAt: "" }
    ],
    webhooks: [
      { id: "webhook_leads", name: "Lead Created", event: "lead.created", targetUrl: "https://example.com/webhook", status: "draft" }
    ],
    logs: [
      { id: "log_demo", source: "system", event: "integration.foundation.created", status: "info", createdAt: new Date().toISOString() }
    ],
    connectedApps: [
      { name: "Google Sheets", category: "CRM", status: "planned" },
      { name: "Vapi", category: "Voice", status: "planned" },
      { name: "Twilio", category: "Messaging", status: "planned" }
    ]
  };
}

function arr(value) {
  return Array.isArray(value) ? value : [];
}

module.exports = {
  readIntegrationData,
  registry
};
