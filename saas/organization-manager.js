const { readTenantData } = require("./tenant-context");

function organizations(input = {}) {
  const data = readTenantData(input);
  return {
    ok: true,
    data: {
      organizations: data.organizations.map((org) => ({
        id: org.id,
        tenantId: org.tenantId || org.tenant_id || org.id,
        name: org.name || "Organization",
        slug: org.slug || "",
        industry: org.industry || "service business",
        city: org.city || "Los Angeles",
        ownerEmail: org.ownerEmail || org.owner_email || "",
        status: org.status || "active"
      })),
      demoMode: data.demoMode,
      generatedAt: new Date().toISOString()
    }
  };
}

module.exports = { organizations };
