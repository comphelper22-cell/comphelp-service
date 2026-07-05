const fs = require("fs");
const path = require("path");

const SQL_DIR = path.resolve(__dirname, "..", "sql");

function listMigrations() {
  const files = fs.existsSync(SQL_DIR)
    ? fs.readdirSync(SQL_DIR).filter((file) => file.endsWith(".sql")).sort()
    : [];
  return {
    ok: true,
    data: {
      migrationMode: "manual_review_required",
      productionExecutionEnabled: false,
      files,
      count: files.length
    }
  };
}

module.exports = {
  listMigrations
};
