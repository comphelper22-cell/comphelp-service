const schema = require("../schema/technicians.schema");
const { createRepository } = require("./repository-factory");

module.exports = createRepository(schema);
