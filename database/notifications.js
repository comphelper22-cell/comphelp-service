// Notifications store in-app alerts and future email/SMS notification records.
const { createEntityModule } = require("./entity");

module.exports = createEntityModule("notifications", ["userId", "organizationId", "type", "title", "status"]);
