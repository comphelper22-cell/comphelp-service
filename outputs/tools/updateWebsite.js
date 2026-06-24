const fs = require("fs");
const path = require("path");

const PROJECT_ROOT = path.resolve(__dirname, "..");

function cleanRelativePath(filePath) {
  const normalized = String(filePath || "").replace(/\\/g, "/").replace(/^\/+/, "");
  if (!normalized || normalized.includes("..")) {
    throw new Error("A safe relative filePath is required.");
  }
  return normalized;
}

function resolveProjectFile(filePath) {
  const relative = cleanRelativePath(filePath);
  const fullPath = path.resolve(PROJECT_ROOT, relative);
  if (!fullPath.startsWith(PROJECT_ROOT)) {
    throw new Error("File path must stay inside the project.");
  }
  return fullPath;
}

function createUnifiedDiff(filePath, before, after) {
  if (before === after) return "";
  const beforeLines = String(before || "").split(/\r?\n/);
  const afterLines = String(after || "").split(/\r?\n/);
  const output = [`--- a/${filePath}`, `+++ b/${filePath}`];
  const max = Math.max(beforeLines.length, afterLines.length);

  for (let index = 0; index < max; index += 1) {
    const oldLine = beforeLines[index];
    const newLine = afterLines[index];
    if (oldLine === newLine) continue;
    output.push(`@@ line ${index + 1} @@`);
    if (oldLine !== undefined) output.push(`-${oldLine}`);
    if (newLine !== undefined) output.push(`+${newLine}`);
  }

  return output.join("\n");
}

function applyReplacements(content, replacements = []) {
  return replacements.reduce((current, item) => {
    const find = String(item.find || "");
    if (!find) return current;
    const replace = String(item.replace || "");
    return current.split(find).join(replace);
  }, content);
}

async function updateWebsite(input = {}) {
  const filePath = cleanRelativePath(input.filePath);
  const fullPath = resolveProjectFile(filePath);
  const approved = Boolean(input.approved);
  const exists = fs.existsSync(fullPath);
  const before = exists ? fs.readFileSync(fullPath, "utf8") : "";
  let after = typeof input.content === "string" ? input.content : before;

  if (Array.isArray(input.replacements) && input.replacements.length) {
    after = applyReplacements(after, input.replacements);
  }

  if (before === after) {
    return {
      ok: true,
      changed: false,
      filePath,
      message: "No changes detected."
    };
  }

  const diff = createUnifiedDiff(filePath, before, after);
  if (!approved) {
    return {
      ok: true,
      previewOnly: true,
      requiresApproval: true,
      filePath,
      diff,
      message: "Preview generated. Re-run with approved=true to write the file."
    };
  }

  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, after, "utf8");

  return {
    ok: true,
    changed: true,
    filePath,
    diff,
    message: "File updated after approval."
  };
}

module.exports = {
  updateWebsite,
  resolveProjectFile,
  createUnifiedDiff
};
