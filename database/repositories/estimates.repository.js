const schema = require("../schema/estimates.schema");
const { createRepository } = require("./repository-factory");

module.exports = createRepository(schema);
