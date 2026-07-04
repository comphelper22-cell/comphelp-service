const memory = require("./memory");

function registry() {
  return Object.entries(memory.providers).map(([key, provider]) => ({
    key,
    scope: provider.scope,
    description: provider.description,
    functions: ["save", "load", "update", "delete", "search", "clear"],
    status: "registered"
  }));
}

function status() {
  return {
    ok: true,
    status: "ready",
    providerCount: registry().length,
    providers: registry(),
    storage: "json",
    externalMemoryConnected: false
  };
}

module.exports = { registry, status };
