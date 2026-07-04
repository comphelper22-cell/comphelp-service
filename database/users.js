// User accounts for internal users and future SaaS tenant members.
const { createEntityModule } = require("./entity");

module.exports = createEntityModule("users", ["name", "email", "phone", "role", "status", "organizationId"]);
