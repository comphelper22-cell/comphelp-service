const fs = require("fs");
const path = require("path");
const { response } = require("./client");

const ROOT = path.resolve(__dirname, "..");
const DATA_FILE = path.join(ROOT, "data", "marketplace.json");

const DEFAULT_DATA = {
  version: 1,
  leads: [],
  vendors: [],
  projects: [],
  estimates: [],
  customers: [],
  customerNotes: [],
  customerTimeline: [],
  tasks: [],
  activity: [],
  activityLogs: [],
  settings: [],
  users: [],
  organizations: [],
  roles: [],
  permissions: [],
  sessions: [],
  auditLogs: [],
  notifications: [],
  preferences: [],
  invoices: [],
  quoteRequests: [],
  commissions: []
  ,
  companies: [],
  technicians: [],
  jobs: [],
  payments: [],
  notes: [],
  files: [],
  inventory: [],
  aiMemory: []
};

function now() {
  return new Date().toISOString();
}

function id(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readJson(file, fallback = DEFAULT_DATA) {
  try {
    const parsed = JSON.parse(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
    return { ...fallback, ...parsed };
  } catch (_) {
    return { ...fallback };
  }
}

function writeJson(file, data) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf8");
}

class JsonStore {
  constructor(file = DATA_FILE) {
    this.file = file;
  }

  read() {
    const data = readJson(this.file, DEFAULT_DATA);
    Object.keys(DEFAULT_DATA).forEach((key) => {
      if (Array.isArray(DEFAULT_DATA[key]) && !Array.isArray(data[key])) data[key] = [];
    });
    return data;
  }

  write(data) {
    writeJson(this.file, { ...data, updatedAt: now() });
  }

  list(collection, filters = {}) {
    try {
      const data = this.read();
      let items = Array.isArray(data[collection]) ? data[collection].filter((item) => !item.deleted_at && !item.deletedAt) : [];
      Object.entries(filters || {}).forEach(([key, value]) => {
        if (value === undefined || value === "") return;
        const needle = String(value).toLowerCase();
        items = items.filter((item) => String(item[key] || "").toLowerCase().includes(needle));
      });
      return response(true, items);
    } catch (error) {
      return response(false, null, error.message);
    }
  }

  getById(collection, recordId) {
    const listed = this.list(collection);
    if (!listed.ok) return listed;
    const item = listed.data.find((record) => record.id === recordId);
    return item ? response(true, item) : response(false, null, "not_found");
  }

  create(collection, record = {}) {
    try {
      const data = this.read();
      const item = { ...record, id: record.id || id(collection), createdAt: record.createdAt || now(), updatedAt: now() };
      data[collection] = Array.isArray(data[collection]) ? data[collection] : [];
      data[collection].unshift(item);
      this.write(data);
      return response(true, item);
    } catch (error) {
      return response(false, null, error.message);
    }
  }

  update(collection, recordId, patch = {}) {
    try {
      const data = this.read();
      const items = Array.isArray(data[collection]) ? data[collection] : [];
      const index = items.findIndex((item) => item.id === recordId);
      if (index === -1) return this.create(collection, { ...patch, id: recordId });
      items[index] = { ...items[index], ...patch, updatedAt: now() };
      data[collection] = items;
      this.write(data);
      return response(true, items[index]);
    } catch (error) {
      return response(false, null, error.message);
    }
  }

  remove(collection, recordId) {
    return this.update(collection, recordId, { deleted_at: now(), deletedAt: now() });
  }

  search(collection, query, fields = []) {
    const listed = this.list(collection);
    if (!listed.ok) return listed;
    const needle = String(query || "").trim().toLowerCase();
    if (!needle) return listed;
    return response(true, listed.data.filter((item) => fields.some((field) => String(item[field] || "").toLowerCase().includes(needle))));
  }

  health() {
    const data = this.read();
    return {
      ok: true,
      available: true,
      file: path.relative(ROOT, this.file).replace(/\\/g, "/"),
      exists: fs.existsSync(this.file),
      collections: Object.fromEntries(Object.keys(DEFAULT_DATA).filter((key) => Array.isArray(DEFAULT_DATA[key])).map((key) => [key, Array.isArray(data[key]) ? data[key].length : 0]))
    };
  }
}

module.exports = {
  DATA_FILE,
  DEFAULT_DATA,
  JsonStore,
  ensureDir,
  id,
  now,
  readJson,
  writeJson
};
