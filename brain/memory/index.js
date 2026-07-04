const shortMemory = require("./short-memory");
const longMemory = require("./long-memory");
const businessMemory = require("./business-memory");
const customerMemory = require("./customer-memory");
const sessionMemory = require("./session-memory");
const knowledgeMemory = require("./knowledge-memory");

const providers = {
  shortMemory,
  longMemory,
  businessMemory,
  customerMemory,
  sessionMemory,
  knowledgeMemory
};

function getProvider(scope = "shortMemory") {
  return providers[scope] || null;
}

function requireProvider(scope) {
  const provider = getProvider(scope);
  if (!provider) return { ok: false, error: "unknown_memory_provider" };
  return { ok: true, provider };
}

function save(scope, record) {
  const result = requireProvider(scope);
  return result.ok ? result.provider.save(record) : result;
}

function load(scope, query) {
  const result = requireProvider(scope);
  return result.ok ? result.provider.load(query) : result;
}

function update(scope, id, patch) {
  const result = requireProvider(scope);
  return result.ok ? result.provider.update(id, patch) : result;
}

function deleteMemory(scope, id) {
  const result = requireProvider(scope);
  return result.ok ? result.provider.delete(id) : result;
}

function search(scope, query) {
  const result = requireProvider(scope);
  return result.ok ? result.provider.search(query) : result;
}

function clear(scope) {
  const result = requireProvider(scope);
  return result.ok ? result.provider.clear() : result;
}

function stats(scope) {
  if (scope && providers[scope]) return providers[scope].stats();
  return {
    ok: true,
    data: Object.values(providers).map((provider) => provider.stats().data)
  };
}

module.exports = {
  providers,
  clear,
  delete: deleteMemory,
  getProvider,
  load,
  save,
  search,
  stats,
  update
};
