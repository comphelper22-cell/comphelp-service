const schema = require("../schema/inventory.schema");
const { createRepository } = require("./repository-factory");

module.exports = createRepository(schema);
