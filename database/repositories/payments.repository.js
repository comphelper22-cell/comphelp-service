const schema = require("../schema/payments.schema");
const { createRepository } = require("./repository-factory");

module.exports = createRepository(schema);
