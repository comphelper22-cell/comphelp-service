// Preferences store user and organization display, notification, and workflow settings.
const { createEntityModule } = require("./entity");

module.exports = createEntityModule("preferences", ["userId", "organizationId", "key", "scope", "status"]);
