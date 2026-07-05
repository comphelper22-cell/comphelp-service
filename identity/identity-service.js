const ROLES = [
  "Super Admin",
  "Company Owner",
  "Office Manager",
  "Dispatcher",
  "Technician",
  "Sales",
  "Marketing",
  "Customer",
  "Guest"
];

const PERMISSIONS = [
  "View",
  "Create",
  "Update",
  "Delete",
  "Approve",
  "Assign",
  "Export",
  "Billing",
  "Administration",
  "Analytics",
  "AI"
];

const SESSION_MODEL = {
  sessionId: "placeholder-session-id",
  device: "Device placeholder",
  browser: "Browser placeholder",
  ipPlaceholder: "0.0.0.0",
  locationPlaceholder: "Location unavailable until approved",
  lastActivity: "ISO timestamp",
  expiration: "ISO timestamp",
  rememberMe: false
};

const LOGIN_FLOW = [
  "User",
  "Validation",
  "Authentication",
  "Role Resolution",
  "Organization Resolution",
  "Permission Load",
  "Dashboard Routing"
];

function identityReadiness() {
  return {
    ok: true,
    data: {
      product: "CompHelp AI",
      architectureOnly: true,
      demoModePreserved: true,
      realAuthConnected: false,
      oauthConnected: false,
      passwordsStored: false,
      jsonFallbackCompatible: true,
      supportedRoles: ROLES,
      permissions: PERMISSIONS,
      loginFlow: LOGIN_FLOW,
      generatedAt: new Date().toISOString()
    }
  };
}

module.exports = {
  LOGIN_FLOW,
  PERMISSIONS,
  ROLES,
  SESSION_MODEL,
  identityReadiness
};
