const schema = require("../schema/files.schema");
const { createRepository } = require("./repository-factory");

module.exports = createRepository(schema);
