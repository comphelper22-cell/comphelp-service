const { readIntegrationData } = require("./public-api-registry");

function apiKeys(input = {}) {
  const data = readIntegrationData(input);
  return {
    ok: true,
    data: {
      apiKeys: data.apiKeys.map((key) => ({
        id: key.id || key.name || "api_key",
        name: key.name || "API Key",
        prefix: maskPrefix(key.prefix || key.key || key.token || ""),
        scopes: Array.isArray(key.scopes) ? key.scopes : [],
        status: key.status || "draft",
        lastUsedAt: key.lastUsedAt || key.last_used_at || "",
        secretStored: false
      })),
      realSecretsExposed: false,
      generatedAt: new Date().toISOString()
    }
  };
}

function maskPrefix(value) {
  const text = String(value || "");
  if (!text) return "not_generated";
  return text.slice(0, 8) + "_masked";
}

module.exports = { apiKeys };
