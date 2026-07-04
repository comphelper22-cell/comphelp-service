const { createMemoryProvider } = require("./provider");

module.exports = createMemoryProvider("shortMemory", "Temporary working context for the current sprint, task, or session.");
