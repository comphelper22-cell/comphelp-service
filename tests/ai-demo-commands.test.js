const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { buildBetaDemoData } = require("../data/beta-demo-data");
const { writeJson } = require("../database/json-store");
const { createAiOperationsAssistant } = require("../ai-operations-assistant/assistant");

const file = path.join(__dirname, "..", "tmp_ai_demo_commands.json");
writeJson(file, buildBetaDemoData({}, { baseDate: new Date().toISOString() }));
const assistant = createAiOperationsAssistant({ file });

[
  "Show today's jobs",
  "Who owes us money?",
  "What should I do today?",
  "Which technician is overloaded?",
  "Which customers need follow up?",
  "How much revenue this month?",
  "Show overdue invoices",
  "Show open estimates"
].forEach((question) => {
  const result = assistant.ask({ question });
  assert.strictEqual(result.ok, true, question);
  assert.ok(result.data.answer, question);
});

assert.ok(assistant.ask({ question: "Show today's jobs" }).data.items.length > 0);
assert.ok(assistant.ask({ question: "Who owes us money?" }).data.items.length > 0);
assert.ok(assistant.ask({ question: "Show open estimates" }).data.items.length > 0);

fs.unlinkSync(file);
console.log(JSON.stringify({ ok: true, aiDemoCommands: "working" }, null, 2));
