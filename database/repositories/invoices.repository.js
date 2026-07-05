const schema = require("../schema/invoices.schema");
const { createRepository } = require("./repository-factory");

module.exports = createRepository(schema);
