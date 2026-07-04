const assert = require("assert");
const integrationEngine = require("../integrations/integration-engine");

function run() {
  const input = { data: sampleData() };
  const status = integrationEngine.status();
  const registry = integrationEngine.registry(input);
  const apiKeys = integrationEngine.apiKeys(input);
  const webhooks = integrationEngine.webhooks(input);
  const logs = integrationEngine.logs(input);
  const dashboard = integrationEngine.dashboard(input);

  assert.strictEqual(status.ok, true, "Integrations status should return ok.");
  assert.strictEqual(status.externalApisConnected, false, "External APIs must not be connected.");
  assert.strictEqual(status.realSecretsExposed, false, "Real secrets must not be exposed.");
  assert.strictEqual(registry.ok, true, "Registry should return ok.");
  assert.strictEqual(apiKeys.ok, true, "API keys should return ok.");
  assert.strictEqual(webhooks.ok, true, "Webhooks should return ok.");
  assert.strictEqual(logs.ok, true, "Logs should return ok.");
  assert.strictEqual(dashboard.ok, true, "Dashboard should return ok.");
  assert.strictEqual(dashboard.data.integrationHealth.externalConnectionsEnabled, false, "Dashboard must show external connections disabled.");
  assert.strictEqual(dashboard.data.integrationHealth.realSecretsExposed, false, "Dashboard must show no exposed secrets.");
  assert.ok(apiKeys.data.apiKeys[0].prefix.includes("masked"), "API key prefix should be masked.");

  return {
    ok: true,
    registry: registry.data.registry.length,
    apiKeys: apiKeys.data.apiKeys.length,
    webhooks: webhooks.data.webhooks.length,
    logs: logs.data.logs.length,
    externalConnectionsEnabled: dashboard.data.integrationHealth.externalConnectionsEnabled
  };
}

function sampleData() {
  return {
    publicApiRegistry: [
      { name: "Leads API", version: "v1", endpoint: "/api/public/leads", method: "POST", status: "planned", auth: "api_key" }
    ],
    apiKeys: [
      { id: "key_1", name: "Partner Key", prefix: "ch_live_secret_should_mask", scopes: ["leads:write"], status: "draft" }
    ],
    webhooks: [
      { id: "wh_1", name: "Lead Created", event: "lead.created", targetUrl: "https://example.com/hook?token=secret", status: "draft" }
    ],
    integrationLogs: [
      { id: "log_1", source: "system", event: "integration.test", status: "info", message: "token=secret should mask" }
    ],
    connectedApps: [
      { name: "Google Sheets", category: "CRM", status: "planned" }
    ]
  };
}

if (require.main === module) {
  console.log(JSON.stringify(run(), null, 2));
}

module.exports = { run };
