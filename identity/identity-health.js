const { identityReadiness } = require("./identity-service");

function identityHealth() {
  const readiness = identityReadiness().data;
  return {
    ok: true,
    data: {
      status: "ready_for_sprint_22_authentication",
      authProviderConnected: false,
      passwordStorageEnabled: false,
      sessionArchitectureReady: true,
      rbacArchitectureReady: true,
      organizationIsolationReady: true,
      jsonFallbackCompatible: readiness.jsonFallbackCompatible,
      warnings: [
        "Real authentication provider is not connected.",
        "Password storage is intentionally disabled.",
        "Token signing is placeholder-only."
      ],
      generatedAt: new Date().toISOString()
    }
  };
}

module.exports = {
  identityHealth
};
