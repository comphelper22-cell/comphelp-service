const fs = require("fs");
const path = require("path");
const { databaseHealth } = require("../database/core/database-health");
const { databaseConfig } = require("../database/core/database-config");
const { listMigrations } = require("../database/core/database-migrations");
const { seedStatus } = require("../database/core/database-seed");
const { validateSchema } = require("../database/core/database-validator");

const ROOT = path.resolve(__dirname, "..");
const SCHEMA_DIR = path.join(ROOT, "database", "schema");
const REPOSITORY_DIR = path.join(ROOT, "database", "repositories");

function listFiles(dir, suffix) {
  return fs.existsSync(dir) ? fs.readdirSync(dir).filter((file) => file.endsWith(suffix)).sort() : [];
}

function schemaReport() {
  const files = listFiles(SCHEMA_DIR, ".schema.js");
  const validations = files.map((file) => {
    const schema = require(path.join(SCHEMA_DIR, file));
    const validation = validateSchema(schema);
    return { file, table: schema.table, ok: validation.ok, errors: validation.errors };
  });
  return {
    ok: validations.every((item) => item.ok),
    data: {
      count: validations.length,
      schemas: validations
    }
  };
}

function repositoryReport() {
  const files = listFiles(REPOSITORY_DIR, ".repository.js");
  return {
    ok: files.length >= 15,
    data: {
      count: files.length,
      repositories: files,
      requiredInterface: ["create", "findById", "findAll", "update", "remove", "search", "paginate", "validate"]
    }
  };
}

function run() {
  const config = databaseConfig();
  const schemas = schemaReport();
  const repositories = repositoryReport();
  return {
    ok: schemas.ok && repositories.ok,
    data: {
      name: "Database Agent",
      mission: "Validate database foundation readiness without connecting production services.",
      config,
      health: databaseHealth(),
      schemas: schemas.data,
      repositories: repositories.data,
      migrations: listMigrations().data,
      seed: seedStatus().data,
      supabaseReadiness: {
        readyForConfiguration: true,
        configured: config.supabaseConfigured,
        productionConnectionActive: false
      },
      generatedAt: new Date().toISOString()
    }
  };
}

module.exports = {
  run,
  repositoryReport,
  schemaReport
};
