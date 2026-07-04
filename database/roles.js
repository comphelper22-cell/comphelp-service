// Roles group permissions for admins, managers, dispatchers, technicians, customers, and viewers.
const { createEntityModule } = require("./entity");

module.exports = createEntityModule("roles", ["name", "scope", "description", "status"]);
