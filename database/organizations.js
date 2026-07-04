// Organizations represent tenants and business accounts in the SaaS model.
const { createEntityModule } = require("./entity");

module.exports = createEntityModule("organizations", ["name", "slug", "industry", "status", "city", "ownerEmail"]);
