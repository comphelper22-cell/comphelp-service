const assert = require("assert");
const fs = require("fs");
const path = require("path");

const html = fs.readFileSync(path.join(__dirname, "..", "marketplace.html"), "utf8");
const manager = fs.readFileSync(path.join(__dirname, "..", "assets", "marketplace-manager.js"), "utf8");
const section = html.match(/<form class="panel dispatch-wizard" id="jobForm">([\s\S]*?)<\/form>/);
assert.ok(section, "Dynamic Job Dispatch form must exist.");
const form = section[1];
const typedNames = [...form.matchAll(/<input name="([^"]+)"(?![^>]*type="hidden")[^>]*>/g)].map((match) => match[1]).sort();
assert.deepStrictEqual(typedNames, ["address", "customerName", "email", "phone"], "Only customer name, email, phone, and address may require typing.");
assert.ok(!/<textarea|<select/.test(form), "Job Dispatch must use visual choices instead of textareas or dropdowns.");
assert.ok((form.match(/data-job-choice=/g) || []).length >= 12, "Service and dispatch options must be presented as visual choices.");
assert.ok((form.match(/data-job-schedule=/g) || []).length === 3, "Schedule must offer three quick choices.");
assert.match(manager, /function attachDynamicJobDispatch\(\)/);
assert.match(manager, /function updateJobDispatchSummary\(\)/);
assert.match(manager, /chooseJobSchedule\(form, "tomorrow"\)/);
assert.match(html, /prefers-reduced-motion:reduce/, "Animations must respect reduced-motion preferences.");

console.log(JSON.stringify({ ok: true, dynamicJobDispatch: "validated" }, null, 2));
