const TABLES = {
  leads: "marketplace_leads",
  vendors: "marketplace_vendors",
  projects: "marketplace_projects",
  estimates: "marketplace_estimates",
  customers: "marketplace_customers",
  tasks: "marketplace_tasks",
  activity: "marketplace_activity_logs",
  activityLogs: "marketplace_activity_logs",
  settings: "marketplace_settings",
  users: "marketplace_users",
  organizations: "marketplace_organizations",
  roles: "marketplace_roles",
  permissions: "marketplace_permissions",
  sessions: "marketplace_sessions",
  auditLogs: "marketplace_audit_logs",
  notifications: "marketplace_notifications",
  preferences: "marketplace_preferences",
  invoices: "marketplace_invoices",
  quoteRequests: "marketplace_quote_requests",
  commissions: "marketplace_commissions"
};

function supabaseConfigured(env = process.env) {
  return Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);
}

function toSnake(key) {
  return key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function toCamel(key) {
  return key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function mapKeys(record, mapper) {
  const output = {};
  Object.entries(record || {}).forEach(([key, value]) => {
    output[mapper(key)] = value;
  });
  return output;
}

function response(ok, data, error, meta) {
  return ok ? { ok: true, data, ...(meta || {}) } : { ok: false, error: String(error || "database_error"), ...(meta || {}) };
}

class SupabaseClient {
  constructor(options = {}) {
    this.url = options.url || process.env.SUPABASE_URL || "";
    this.key = options.key || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    this.fetchImpl = options.fetchImpl || fetch;
  }

  configured() {
    return Boolean(this.url && this.key);
  }

  table(collection) {
    return TABLES[collection] || collection;
  }

  async request(collection, options = {}) {
    if (!this.configured()) return response(false, null, "supabase_not_configured", { skipped: true });
    try {
      const base = String(this.url).replace(/\/$/, "");
      const url = `${base}/rest/v1/${this.table(collection)}${options.query || ""}`;
      const result = await this.fetchImpl(url, {
        method: options.method || "GET",
        headers: {
          apikey: this.key,
          Authorization: `Bearer ${this.key}`,
          "Content-Type": "application/json",
          Prefer: "return=representation"
        },
        body: options.body ? JSON.stringify(options.body) : undefined
      });
      const body = await result.json().catch(() => null);
      if (!result.ok) return response(false, null, body && body.message ? body.message : `supabase_${result.status}`, { status: result.status });
      return response(true, body, null, { status: result.status });
    } catch (error) {
      return response(false, null, error.message);
    }
  }

  async list(collection, filters = {}) {
    const filterQuery = Object.entries(filters || {})
      .filter(([, value]) => value !== undefined && value !== "")
      .map(([key, value]) => `${toSnake(key)}=ilike.*${encodeURIComponent(value)}*`)
      .join("&");
    const query = `?select=*&deleted_at=is.null&order=created_at.desc${filterQuery ? `&${filterQuery}` : ""}`;
    const result = await this.request(collection, { query });
    if (!result.ok || !Array.isArray(result.data)) return result;
    return response(true, result.data.map((item) => mapKeys(item, toCamel)));
  }

  async getById(collection, id) {
    const result = await this.request(collection, { query: `?select=*&id=eq.${encodeURIComponent(id)}&deleted_at=is.null&limit=1` });
    if (!result.ok) return result;
    const item = Array.isArray(result.data) ? result.data[0] : null;
    return item ? response(true, mapKeys(item, toCamel)) : response(false, null, "not_found");
  }

  async create(collection, record) {
    const result = await this.request(collection, { method: "POST", body: mapKeys(record, toSnake) });
    if (!result.ok) return result;
    const item = Array.isArray(result.data) ? result.data[0] : result.data;
    return response(true, mapKeys(item, toCamel));
  }

  async update(collection, id, patch) {
    const result = await this.request(collection, { method: "PATCH", query: `?id=eq.${encodeURIComponent(id)}`, body: mapKeys(patch, toSnake) });
    if (!result.ok) return result;
    const item = Array.isArray(result.data) ? result.data[0] : result.data;
    return response(true, mapKeys(item, toCamel));
  }

  async remove(collection, id) {
    return this.update(collection, id, { deletedAt: new Date().toISOString() });
  }

  async search(collection, query, fields = []) {
    const list = await this.list(collection);
    if (!list.ok) return list;
    const needle = String(query || "").trim().toLowerCase();
    if (!needle) return list;
    return response(true, list.data.filter((item) => fields.some((field) => String(item[field] || "").toLowerCase().includes(needle))));
  }
}

module.exports = {
  TABLES,
  SupabaseClient,
  mapKeys,
  response,
  supabaseConfigured,
  toCamel,
  toSnake
};
