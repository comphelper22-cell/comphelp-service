const schema = require("../schema/jobs.schema");
const { createRepository } = require("./repository-factory");

module.exports = createRepository(schema);
