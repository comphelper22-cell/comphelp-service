const assert = require("assert");
const fs = require("fs");
const path = require("path");
const safeStorage = require("../storage/safe-storage");

const previous = process.env.SAFE_STORAGE_FORCE_MEMORY;
process.env.SAFE_STORAGE_FORCE_MEMORY = "true";

const file = path.join(__dirname, "..", "data", "production-storage-test.json");
const beforeExists = fs.existsSync(file);
const before = beforeExists ? fs.readFileSync(file, "utf8") : null;

const write = safeStorage.writeJson(file, { version: 1, items: [{ id: "memory_only" }] });
assert.strictEqual(write.ok, true);
assert.strictEqual(write.memory, true);
assert.ok(write.warnings.includes(safeStorage.PRODUCTION_WRITE_WARNING));
assert.deepStrictEqual(safeStorage.readJson(file, { version: 1, items: [] }).items[0].id, "memory_only");

if (!beforeExists) {
  assert.strictEqual(fs.existsSync(file), false, "Production memory writes should not create data files.");
} else {
  assert.strictEqual(fs.readFileSync(file, "utf8"), before, "Production memory writes should not mutate existing data files.");
}

if (previous === undefined) delete process.env.SAFE_STORAGE_FORCE_MEMORY;
else process.env.SAFE_STORAGE_FORCE_MEMORY = previous;

console.log(JSON.stringify({ ok: true, mode: "memory", warning: write.warnings[0] }, null, 2));

