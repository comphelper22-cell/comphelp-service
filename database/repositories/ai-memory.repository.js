const schema = require("../schema/ai-memory.schema");
const { createRepository } = require("./repository-factory");

module.exports = createRepository(schema, { collection: "aiMemory" });
