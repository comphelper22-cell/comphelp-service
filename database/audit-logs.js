// Audit logs record security-sensitive account, permission, and workflow events.
const { createEntityModule } = require("./entity");

module.exports = createEntityModule("auditLogs", ["actorId", "organizationId", "action", "resource", "status"]);
