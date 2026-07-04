const { readTenantData } = require("./tenant-context");

function teams(input = {}) {
  const data = readTenantData(input);
  const users = data.users.map((user) => ({
    id: user.id,
    name: user.name || user.email || "Team Member",
    email: user.email || "",
    role: user.role || "viewer",
    organizationId: user.organizationId || user.organization_id || "",
    status: user.status || "active"
  }));
  const byRole = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {});
  return {
    ok: true,
    data: {
      users,
      byRole,
      activeUsers: users.filter((user) => user.status === "active").length,
      demoMode: data.demoMode,
      generatedAt: new Date().toISOString()
    }
  };
}

module.exports = { teams };
