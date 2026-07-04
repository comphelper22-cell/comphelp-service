const fs = require("fs");
const path = require("path");
const { SupabaseClient, TABLES, response, supabaseConfigured } = require("./client");
const { DATA_FILE, DEFAULT_DATA, JsonStore, ensureDir, id, now, writeJson } = require("./json-store");

const ROOT = path.resolve(__dirname, "..");
const LOG_DIR = path.join(ROOT, "logs");
const TABLE_CHECKS = ["leads", "vendors", "projects", "estimates", "customers", "tasks", "activityLogs", "settings"];

function clean(value, max = 1000) {
  return String(value || "").trim().slice(0, max);
}

function unwrap(result, fallback) {
  return result && result.ok ? result.data : fallback;
}

class Database {
  constructor(options = {}) {
    this.json = new JsonStore(options.file || DATA_FILE);
    this.supabase = new SupabaseClient(options.supabase || {});
  }

  mode() {
    return this.supabase.configured() ? "supabase" : "json";
  }

  async listResult(collection, filters = {}) {
    if (this.supabase.configured()) {
      const result = await this.supabase.list(collection, filters);
      if (result.ok) return result;
    }
    return this.json.list(collection, filters);
  }

  async getByIdResult(collection, recordId) {
    if (!recordId) return response(false, null, "missing_id");
    if (this.supabase.configured()) {
      const result = await this.supabase.getById(collection, recordId);
      if (result.ok) return result;
    }
    return this.json.getById(collection, recordId);
  }

  async createResult(collection, record = {}) {
    const item = { ...record, id: record.id || id(collection) };
    if (this.supabase.configured()) {
      const result = await this.supabase.create(collection, item);
      if (result.ok) return result;
    }
    return this.json.create(collection, item);
  }

  async updateResult(collection, recordId, patch = {}) {
    if (!recordId) return response(false, null, "missing_id");
    const item = { ...patch, updatedAt: now() };
    if (this.supabase.configured()) {
      const result = await this.supabase.update(collection, recordId, item);
      if (result.ok) return result;
    }
    return this.json.update(collection, recordId, item);
  }

  async removeResult(collection, recordId) {
    if (!recordId) return response(false, null, "missing_id");
    if (this.supabase.configured()) {
      const result = await this.supabase.remove(collection, recordId);
      if (result.ok) return result;
    }
    return this.json.remove(collection, recordId);
  }

  async searchResult(collection, query, fields = []) {
    if (this.supabase.configured()) {
      const result = await this.supabase.search(collection, query, fields);
      if (result.ok) return result;
    }
    return this.json.search(collection, query, fields);
  }

  async list(collection, filters = {}) {
    return unwrap(await this.listResult(collection, filters), []);
  }

  async getById(collection, recordId) {
    return unwrap(await this.getByIdResult(collection, recordId), null);
  }

  async create(collection, record = {}) {
    return unwrap(await this.createResult(collection, record), null);
  }

  async update(collection, recordId, patch = {}) {
    return unwrap(await this.updateResult(collection, recordId, patch), null);
  }

  async remove(collection, recordId) {
    return unwrap(await this.removeResult(collection, recordId), null);
  }

  async search(collection, query, fields = []) {
    return unwrap(await this.searchResult(collection, query, fields), []);
  }

  async health() {
    const jsonHealth = this.json.health();
    const errors = [];
    const tablesChecked = TABLE_CHECKS.map((collection) => ({
      collection,
      table: TABLES[collection] || collection,
      jsonCount: jsonHealth.collections[collection] || 0
    }));
    if (!jsonHealth.available) errors.push("JSON fallback unavailable.");
    return {
      ok: errors.length === 0,
      mode: this.mode(),
      backend: this.supabase.configured() ? "supabase_with_json_fallback" : "json",
      supabaseConfigured: this.supabase.configured(),
      jsonFallbackAvailable: jsonHealth.available,
      jsonReady: jsonHealth.exists,
      tablesChecked,
      collections: jsonHealth.collections,
      dataFile: jsonHealth.file,
      errors,
      timestamp: now()
    };
  }
}

function database() {
  return new Database();
}

async function databaseStatus() {
  const status = await database().health();
  return writeLogReport("database-report.json", status);
}

function writeLogReport(name, data) {
  ensureDir(LOG_DIR);
  const report = { generatedAt: now(), ...data };
  writeJson(path.join(LOG_DIR, name), report);
  return report;
}

module.exports = {
  ROOT,
  DATA_FILE,
  DEFAULT_DATA,
  TABLES,
  database,
  Database,
  JsonBackend: JsonStore,
  JsonStore,
  SupabaseClient,
  clean,
  databaseStatus,
  id,
  money: (value) => Math.max(0, Number(value || 0)),
  now,
  response,
  supabaseConfigured,
  writeLogReport
};
