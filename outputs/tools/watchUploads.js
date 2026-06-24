const fs = require("fs");
const path = require("path");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const CONFIG_PATH = path.join(PROJECT_ROOT, "config.media.json");

function loadMediaConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
}

function ensureMediaFolders(config = loadMediaConfig()) {
  const folders = [
    config.folders.uploads,
    config.folders.processed,
    config.folders.needsReview,
    config.folders.backups,
    config.folders.logs,
    ...Object.values(config.services).map((service) => service.galleryFolder)
  ];

  for (const folder of folders) {
    fs.mkdirSync(path.join(PROJECT_ROOT, folder), { recursive: true });
  }
}

function listUploadFiles(config = loadMediaConfig()) {
  ensureMediaFolders(config);
  const uploadDir = path.join(PROJECT_ROOT, config.folders.uploads);
  return fs.readdirSync(uploadDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && !entry.name.startsWith("."))
    .map((entry) => {
      const absolutePath = path.join(uploadDir, entry.name);
      const stats = fs.statSync(absolutePath);
      return {
        fileName: entry.name,
        absolutePath,
        relativePath: path.relative(PROJECT_ROOT, absolutePath).replace(/\\/g, "/"),
        size: stats.size,
        modifiedAt: stats.mtime.toISOString()
      };
    });
}

function watchUploads(onFiles, config = loadMediaConfig()) {
  ensureMediaFolders(config);
  const uploadDir = path.join(PROJECT_ROOT, config.folders.uploads);
  let timer = null;

  const run = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const files = listUploadFiles(config);
      if (files.length) onFiles(files);
    }, 500);
  };

  const watcher = fs.watch(uploadDir, run);
  run();
  return watcher;
}

module.exports = {
  PROJECT_ROOT,
  loadMediaConfig,
  ensureMediaFolders,
  listUploadFiles,
  watchUploads
};
