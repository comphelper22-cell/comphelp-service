const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const MEMORY_FILE = path.join(ROOT, "data", "brain-memory.json");

function now() {
  return new Date().toISOString();
}

function createId(scope) {
  return `${scope}_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
}

function ensureStore() {
  fs.mkdirSync(path.dirname(MEMORY_FILE), { recursive: true });
  if (!fs.existsSync(MEMORY_FILE)) {
    fs.writeFileSync(MEMORY_FILE, JSON.stringify({ version: 1, memories: {} }, null, 2) + "\n", "utf8");
  }
}

function readStore() {
  ensureStore();
  try {
    return JSON.parse(fs.readFileSync(MEMORY_FILE, "utf8").replace(/^\uFEFF/, ""));
  } catch (_) {
    return { version: 1, memories: {} };
  }
}

function writeStore(store) {
  ensureStore();
  fs.writeFileSync(MEMORY_FILE, JSON.stringify({ ...store, updatedAt: now() }, null, 2) + "\n", "utf8");
}

function ok(data) {
  return { ok: true, data };
}

function fail(error) {
  return { ok: false, error: String(error || "memory_error") };
}

function createMemoryProvider(scope, description) {
  function list() {
    const store = readStore();
    return Array.isArray(store.memories[scope]) ? store.memories[scope].filter((item) => !item.deletedAt) : [];
  }

  return {
    scope,
    description,
    save(record = {}) {
      const store = readStore();
      const item = {
        id: record.id || createId(scope),
        title: String(record.title || "Memory").slice(0, 160),
        content: String(record.content || record.value || "").slice(0, 5000),
        tags: Array.isArray(record.tags) ? record.tags.slice(0, 20) : [],
        metadata: record.metadata || {},
        createdAt: record.createdAt || now(),
        updatedAt: now()
      };
      store.memories[scope] = Array.isArray(store.memories[scope]) ? store.memories[scope] : [];
      store.memories[scope].unshift(item);
      writeStore(store);
      return ok(item);
    },
    load(query = {}) {
      const items = list();
      if (query.id) {
        const found = items.find((item) => item.id === query.id);
        return found ? ok(found) : fail("memory_not_found");
      }
      return ok(items);
    },
    update(id, patch = {}) {
      if (!id) return fail("missing_memory_id");
      const store = readStore();
      const items = Array.isArray(store.memories[scope]) ? store.memories[scope] : [];
      const index = items.findIndex((item) => item.id === id && !item.deletedAt);
      if (index === -1) return fail("memory_not_found");
      items[index] = { ...items[index], ...patch, updatedAt: now() };
      store.memories[scope] = items;
      writeStore(store);
      return ok(items[index]);
    },
    delete(id) {
      if (!id) return fail("missing_memory_id");
      return this.update(id, { deletedAt: now() });
    },
    search(query = "") {
      const needle = String(query || "").trim().toLowerCase();
      const items = list();
      if (!needle) return ok(items);
      return ok(items.filter((item) => {
        return [item.title, item.content, ...(item.tags || [])].some((value) => String(value || "").toLowerCase().includes(needle));
      }));
    },
    clear() {
      const store = readStore();
      store.memories[scope] = [];
      writeStore(store);
      return ok({ cleared: true, scope });
    },
    stats() {
      const items = list();
      return ok({
        scope,
        description,
        count: items.length,
        latest: items[0] ? items[0].updatedAt || items[0].createdAt : null,
        storage: "json",
        file: path.relative(ROOT, MEMORY_FILE).replace(/\\/g, "/")
      });
    }
  };
}

module.exports = { MEMORY_FILE, createMemoryProvider, fail, ok, readStore };
