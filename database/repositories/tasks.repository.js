const schema = require("../schema/tasks.schema");
const { createRepository } = require("./repository-factory");

module.exports = createRepository(schema);
