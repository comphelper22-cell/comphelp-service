const { createMemoryProvider } = require("./provider");

module.exports = createMemoryProvider("sessionMemory", "Current authenticated session context and temporary dashboard state.");
