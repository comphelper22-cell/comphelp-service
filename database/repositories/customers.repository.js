const schema = require("../schema/customers.schema");
const { createRepository } = require("./repository-factory");

module.exports = createRepository(schema);
