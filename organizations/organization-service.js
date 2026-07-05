const { validateOrganization } = require("./organization-validator");

function organizationModel() {
  return {
    id: "org_demo",
    name: "Demo Company",
    ownerUserId: "user_owner",
    status: "active",
    settings: {
      timezone: "America/Los_Angeles",
      demoMode: true
    },
    isolation: {
      organizationIdRequired: true,
      crossTenantAccessAllowed: false
    }
  };
}

function organizationStatus(input = {}) {
  return {
    ok: true,
    data: {
      status: "architecture_ready",
      validation: validateOrganization(input),
      model: organizationModel(),
      jsonFallbackCompatible: true,
      supabaseReadyLater: true,
      generatedAt: new Date().toISOString()
    }
  };
}

module.exports = {
  organizationModel,
  organizationStatus
};
