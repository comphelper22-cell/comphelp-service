const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const IGNORE_DIRS = new Set([".git", "node_modules", ".vercel", "backups"]);
const MAX_WARNING_LINE = 220;

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!IGNORE_DIRS.has(entry.name)) walk(path.join(dir, entry.name), files);
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".js")) files.push(path.join(dir, entry.name));
  }
  return files;
}

function relative(file) {
  return path.relative(ROOT, file).replace(/\\/g, "/");
}

function checkSyntax(file) {
  const result = spawnSync(process.execPath, ["-c", file], { encoding: "utf8" });
  if (result.status === 0) return null;
  return `${relative(file)}: ${result.stderr || result.stdout}`.trim();
}

function checkStyle(file) {
  const text = fs.readFileSync(file, "utf8");
  const warnings = [];
  if (text.includes("<<<<<<<") || text.includes("=======") || text.includes(">>>>>>>")) warnings.push(`${relative(file)}: merge conflict marker`);
  text.split(/\r?\n/).forEach((line, index) => {
    if (line.length > MAX_WARNING_LINE) warnings.push(`${relative(file)}:${index + 1}: long line (${line.length})`);
  });
  return warnings;
}

function main() {
  const files = walk(ROOT);
  const errors = [];
  const warnings = [];
  files.forEach((file) => {
    const syntaxError = checkSyntax(file);
    if (syntaxError) errors.push(syntaxError);
    warnings.push(...checkStyle(file));
  });
  const report = {
    ok: errors.length === 0,
    checked: files.length,
    errors,
    warnings: warnings.slice(0, 50),
    warningCount: warnings.length
  };
  console.log(JSON.stringify(report, null, 2));
  if (!report.ok) process.exit(1);
}

main();
