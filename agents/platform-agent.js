const crypto = require("crypto");
const { database, now, response, supabaseConfigured, writeLogReport } = require("../database");

const db = database();

const DEFAULT_ROLES = ["admin", "manager", "dispatcher", "technician", "customer", "viewer"];
const DEFAULT_PERMISSIONS = [
  ["admin", "*", "*"],
  ["manager", "leads", "write"],
  ["manager", "estimates", "write"],
  ["manager", "vendors", "write"],
  ["dispatcher", "dispatch", "write"],
  ["technician", "projects", "update"],
  ["customer", "portal", "read"],
  ["viewer", "*", "read"]
];

function clean(value, max = 500) {
  return String(value || "").trim().slice(0, max);
}

function token() {
  return crypto.randomBytes(24).toString("hex");
}

function hash(value) {
  return crypto.createHash("sha256").update(String(value || "")).digest("hex");
}

async function audit(action, payload = {}) {
  return db.createResult("auditLogs", {
    actorId: clean(payload.actorId || "system", 120),
    organizationId: clean(payload.organizationId, 120),
    action: clean(action, 120),
    resource: clean(payload.resource || "platform", 120),
    resourceId: clean(payload.resourceId, 120),
    status: clean(payload.status || "logged", 80),
    metadata: payload.metadata || {},
    createdAt: now()
  });
}

async function ensureDefaults() {
  const roles = await db.listResult("roles");
  const permissions = await db.listResult("permissions");
  const roleNames = roles.ok ? new Set(roles.data.map((role) => role.name)) : new Set();
  const permissionKeys = permissions.ok ? new Set(permissions.data.map((permission) => `${permission.role}:${permission.resource}:${permission.action}`)) : new Set();
  const created = { roles: 0, permissions: 0 };

  for (const role of DEFAULT_ROLES) {
    if (!roleNames.has(role)) {
      await db.createResult("roles", { name: role, scope: "tenant", description: `${role} access role`, status: "active" });
      created.roles += 1;
    }
  }

  for (const [role, resource, action] of DEFAULT_PERMISSIONS) {
    const key = `${role}:${resource}:${action}`;
    if (!permissionKeys.has(key)) {
      await db.createResult("permissions", { role, resource, action, effect: "allow", status: "active" });
      created.permissions += 1;
    }
  }

  if (created.roles || created.permissions) {
    await audit("rbac_defaults_created", { status: "created", metadata: created });
  }
  return response(true, created);
}

async function createOrganization(input = {}) {
  const name = clean(input.name || "CompHelp AI", 160);
  const saved = await db.createResult("organizations", {
    name,
    slug: clean(input.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""), 160),
    industry: clean(input.industry || "technology services", 120),
    city: clean(input.city || "Los Angeles", 120),
    ownerEmail: clean(input.ownerEmail, 160),
    status: clean(input.status || "active", 80)
  });
  if (saved.ok) await audit("organization_created", { organizationId: saved.data.id, resource: "organizations", resourceId: saved.data.id });
  return saved;
}

async function createUser(input = {}) {
  const saved = await db.createResult("users", {
    organizationId: clean(input.organizationId, 120),
    name: clean(input.name, 160),
    email: clean(input.email, 180).toLowerCase(),
    phone: clean(input.phone, 80),
    role: clean(input.role || "viewer", 80),
    status: clean(input.status || "active", 80),
    authProvider: clean(input.authProvider || "internal_placeholder", 120),
    supabaseUserId: clean(input.supabaseUserId, 160)
  });
  if (saved.ok) await audit("user_created", { actorId: saved.data.id, organizationId: saved.data.organizationId, resource: "users", resourceId: saved.data.id });
  return saved;
}

async function createSession(input = {}) {
  const sessionToken = token();
  const expiresAt = input.expiresAt || new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();
  const saved = await db.createResult("sessions", {
    userId: clean(input.userId, 120),
    organizationId: clean(input.organizationId, 120),
    role: clean(input.role || "viewer", 80),
    tokenHash: hash(sessionToken),
    status: "active",
    expiresAt,
    createdAt: now()
  });
  if (!saved.ok) return saved;
  await audit("session_created", { actorId: saved.data.userId, organizationId: saved.data.organizationId, resource: "sessions", resourceId: saved.data.id });
  return response(true, { ...saved.data, sessionToken });
}

async function revokeSession(sessionId, actorId) {
  const saved = await db.updateResult("sessions", sessionId, { status: "revoked", revokedAt: now() });
  if (saved.ok) await audit("session_revoked", { actorId, resource: "sessions", resourceId: sessionId, status: "revoked" });
  return saved;
}

async function createNotification(input = {}) {
  const saved = await db.createResult("notifications", {
    userId: clean(input.userId, 120),
    organizationId: clean(input.organizationId, 120),
    type: clean(input.type || "info", 80),
    title: clean(input.title || "Notification", 180),
    message: clean(input.message, 1000),
    status: clean(input.status || "unread", 80)
  });
  if (saved.ok) await audit("notification_created", { actorId: input.actorId, organizationId: saved.data.organizationId, resource: "notifications", resourceId: saved.data.id });
  return saved;
}

async function updatePreference(input = {}) {
  const saved = await db.createResult("preferences", {
    userId: clean(input.userId, 120),
    organizationId: clean(input.organizationId, 120),
    key: clean(input.key, 160),
    value: input.value,
    scope: clean(input.scope || "user", 80),
    status: "active"
  });
  if (saved.ok) await audit("preference_updated", { actorId: input.userId, organizationId: input.organizationId, resource: "preferences", resourceId: saved.data.id });
  return saved;
}

async function platformStatus() {
  const [health, users, organizations, roles, permissions, sessions, auditLogs, notifications, preferences] = await Promise.all([
    db.health(),
    db.listResult("users"),
    db.listResult("organizations"),
    db.listResult("roles"),
    db.listResult("permissions"),
    db.listResult("sessions"),
    db.listResult("auditLogs"),
    db.listResult("notifications"),
    db.listResult("preferences")
  ]);
  const errors = [];
  for (const result of [users, organizations, roles, permissions, sessions, auditLogs, notifications, preferences]) {
    if (!result.ok) errors.push(result.error);
  }
  const status = {
    ok: errors.length === 0,
    mode: health.mode,
    authStatus: "internal_session_ready",
    rbacStatus: roles.ok && permissions.ok ? "ready" : "needs_attention",
    organizationStatus: organizations.ok ? "ready" : "needs_attention",
    sessionStatus: sessions.ok ? "ready" : "needs_attention",
    auditLogStatus: auditLogs.ok ? "ready" : "needs_attention",
    notificationStatus: notifications.ok ? "ready" : "needs_attention",
    preferenceStatus: preferences.ok ? "ready" : "needs_attention",
    supabaseReady: supabaseConfigured(),
    jsonFallbackReady: health.jsonFallbackAvailable,
    counts: {
      users: users.ok ? users.data.length : 0,
      organizations: organizations.ok ? organizations.data.length : 0,
      roles: roles.ok ? roles.data.length : 0,
      permissions: permissions.ok ? permissions.data.length : 0,
      sessions: sessions.ok ? sessions.data.length : 0,
      auditLogs: auditLogs.ok ? auditLogs.data.length : 0,
      notifications: notifications.ok ? notifications.data.length : 0,
      preferences: preferences.ok ? preferences.data.length : 0
    },
    errors,
    timestamp: now()
  };
  return writeLogReport("platform-report.json", status);
}

module.exports = {
  DEFAULT_PERMISSIONS,
  DEFAULT_ROLES,
  audit,
  createNotification,
  createOrganization,
  createSession,
  createUser,
  ensureDefaults,
  platformStatus,
  revokeSession,
  updatePreference
};
