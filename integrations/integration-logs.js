const { readIntegrationData } = require("./public-api-registry");

function logs(input = {}) {
  const data = readIntegrationData(input);
  return {
    ok: true,
    data: {
      logs: data.logs.map((log) => ({
        id: log.id || "integration_log",
        source: log.source || "system",
        event: log.event || "integration.event",
        status: log.status || "info",
        message: sanitize(log.message || ""),
        createdAt: log.createdAt || log.created_at || new Date().toISOString()
      })),
      realSecretsExposed: false,
      generatedAt: new Date().toISOString()
    }
  };
}

function sanitize(value) {
  return String(value || "").replace(/(token|secret|key)=\S+/gi, "$1=masked");
}

module.exports = { logs };
