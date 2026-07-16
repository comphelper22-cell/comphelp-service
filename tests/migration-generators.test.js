const assert = require("assert");
const fs = require("fs");
const path = require("path");

const corePath = path.join(__dirname, "..", "supabase", "migrations", "0001_core_schema.sql");
const rlsPath = path.join(__dirname, "..", "supabase", "migrations", "0002_tenant_rls.sql");
const beforeCore = fs.readFileSync(corePath, "utf8");
const beforeRls = fs.readFileSync(rlsPath, "utf8");
const beforeCoreMtime = fs.statSync(corePath).mtimeMs;
const beforeRlsMtime = fs.statSync(rlsPath).mtimeMs;

const coreGenerator = require("../scripts/generate-core-migration");
const rlsGenerator = require("../scripts/generate-rls-migration");

assert.strictEqual(fs.readFileSync(corePath, "utf8"), beforeCore, "Importing core generator must not write files.");
assert.strictEqual(fs.readFileSync(rlsPath, "utf8"), beforeRls, "Importing RLS generator must not write files.");
assert.strictEqual(fs.statSync(corePath).mtimeMs, beforeCoreMtime, "Core generator import must be side-effect free.");
assert.strictEqual(fs.statSync(rlsPath).mtimeMs, beforeRlsMtime, "RLS generator import must be side-effect free.");
assert.strictEqual(coreGenerator.generate(), beforeCore, "Core migration generation must be byte-deterministic.");
assert.strictEqual(coreGenerator.generate(), coreGenerator.generate(), "Repeated core generation must be deterministic.");
assert.strictEqual(rlsGenerator.generate(), beforeRls, "RLS migration generation must be byte-deterministic.");
assert.strictEqual(rlsGenerator.generate(), rlsGenerator.generate(), "Repeated RLS generation must be deterministic.");

console.log(JSON.stringify({ ok: true, generators: "pure_and_deterministic" }, null, 2));
