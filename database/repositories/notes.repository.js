const schema = require("../schema/notes.schema");
const { createRepository } = require("./repository-factory");

module.exports = createRepository(schema);
