const schema = require("../schema/companies.schema");
const { createRepository } = require("./repository-factory");

module.exports = createRepository(schema);
