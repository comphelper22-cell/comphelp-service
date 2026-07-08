const assert = require("assert");
const { parseIntent } = require("../ai-operations-assistant/assistant");

assert.strictEqual(parseIntent("Show today's jobs.").name, "todays_jobs");
assert.strictEqual(parseIntent("Who owes us money?").name, "owed_money");
assert.strictEqual(parseIntent("How much did we make this month?").name, "revenue_month");
assert.strictEqual(parseIntent("What should I do today?").name, "today_priorities");
assert.strictEqual(parseIntent("Which technician is overloaded?").name, "overloaded_technicians");

console.log(JSON.stringify({ ok: true, assistantIntent: "working" }, null, 2));
