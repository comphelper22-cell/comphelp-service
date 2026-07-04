// Sessions track authenticated dashboard or future SaaS user sessions.
const { createEntityModule } = require("./entity");

module.exports = createEntityModule("sessions", ["userId", "organizationId", "role", "status", "expiresAt"]);
