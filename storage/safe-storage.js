const fs = require("fs");
const path = require("path");

const PRODUCTION_WRITE_WARNING = "Production file writes disabled; using temporary memory store.";
const memoryStore = globalThis.__COMPHELP_SAFE_STORAGE__ || new Map();
globalThis.__COMPHELP_SAFE_STORAGE__ = memoryStore;

function isProductionRuntime() {
  return process.env.SAFE_STORAGE_FORCE_MEMORY === "true"
    || process.env.VERCEL === "1"
    || process.env.VERCEL === "true"
    || process.env.AWS_LAMBDA_FUNCTION_NAME
    || process.env.NODE_ENV === "production" && /[\\/]var[\\/]task/.test(process.cwd());
}

function normalize(file) {
  return path.resolve(file);
}

function readJson(file, fallback = {}) {
  const key = normalize(file);
  if (memoryStore.has(key)) return clone(memoryStore.get(key));
  try {
    return { ...fallback, ...JSON.parse(fs.readFileSync(key, "utf8").replace(/^\uFEFF/, "")) };
  } catch (_) {
    return clone(fallback);
  }
}

function writeJson(file, data) {
  const key = normalize(file);
  if (isProductionRuntime()) {
    memoryStore.set(key, clone(data));
    return { ok: true, file: key, memory: true, warnings: [PRODUCTION_WRITE_WARNING] };
  }
  try {
    fs.mkdirSync(path.dirname(key), { recursive: true });
    fs.writeFileSync(key, JSON.stringify(data, null, 2) + "\n", "utf8");
    memoryStore.set(key, clone(data));
    return { ok: true, file: key, memory: false, warnings: [] };
  } catch (error) {
    memoryStore.set(key, clone(data));
    return {
      ok: true,
      file: key,
      memory: true,
      warnings: [isReadOnlyError(error) ? PRODUCTION_WRITE_WARNING : `File write failed; using temporary memory store: ${error.message}`]
    };
  }
}

function ensureJsonFile(file, fallback = {}) {
  const existing = readJson(file, null);
  if (existing) return { ok: true, data: existing, warnings: [] };
  const written = writeJson(file, fallback);
  return { ok: true, data: clone(fallback), warnings: written.warnings || [] };
}

function appendLine(file, line) {
  const key = normalize(file);
  if (isProductionRuntime()) {
    const current = String(memoryStore.get(key) || "");
    memoryStore.set(key, current + line);
    return { ok: true, file: key, memory: true, warnings: [PRODUCTION_WRITE_WARNING] };
  }
  try {
    fs.mkdirSync(path.dirname(key), { recursive: true });
    fs.appendFileSync(key, line, "utf8");
    return { ok: true, file: key, memory: false, warnings: [] };
  } catch (error) {
    const current = String(memoryStore.get(key) || "");
    memoryStore.set(key, current + line);
    return {
      ok: true,
      file: key,
      memory: true,
      warnings: [isReadOnlyError(error) ? PRODUCTION_WRITE_WARNING : `File append failed; using temporary memory store: ${error.message}`]
    };
  }
}

function isReadOnlyError(error) {
  return error && (error.code === "EROFS" || error.code === "EACCES" || /read-only file system/i.test(error.message || ""));
}

function clone(value) {
  if (value === null || value === undefined) return value;
  return JSON.parse(JSON.stringify(value));
}

module.exports = {
  PRODUCTION_WRITE_WARNING,
  appendLine,
  ensureJsonFile,
  isProductionRuntime,
  readJson,
  writeJson
};
