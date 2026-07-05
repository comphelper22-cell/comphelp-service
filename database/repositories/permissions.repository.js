const schema = require("../schema/permissions.schema");
const { createRepository } = require("./repository-factory");

module.exports = createRepository(schema);
