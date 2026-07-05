const schema = require("../schema/users.schema");
const { createRepository } = require("./repository-factory");

module.exports = createRepository(schema);
