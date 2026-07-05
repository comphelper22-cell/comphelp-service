const schema = require("../schema/activities.schema");
const { createRepository } = require("./repository-factory");

module.exports = createRepository(schema);
