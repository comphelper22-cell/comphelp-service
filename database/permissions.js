// Permissions define role access to resources and actions.
const { createEntityModule } = require("./entity");

module.exports = createEntityModule("permissions", ["role", "resource", "action", "effect", "status"]);
