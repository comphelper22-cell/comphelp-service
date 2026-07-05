const schema = require("../schema/roles.schema");
const { createRepository } = require("./repository-factory");

module.exports = createRepository(schema);
