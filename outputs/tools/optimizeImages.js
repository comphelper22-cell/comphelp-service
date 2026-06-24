const fs = require("fs");
const path = require("path");
const { PROJECT_ROOT, loadMediaConfig } = require("./watchUploads");

function tryLoadSharp() {
  try {
    return require("sharp");
  } catch (_) {
    return null;
  }
}

function slugify(value) {
  return String(value || "job-media")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "job-media";
}

function ensureBackup(item, config) {
  const day = new Date().toISOString().slice(0, 10);
  const backupDir = path.join(PROJECT_ROOT, config.folders.backups, day);
  fs.mkdirSync(backupDir, { recursive: true });
  const backupPath = path.join(backupDir, item.fileName);

  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(item.absolutePath, backupPath);
  }

  return path.relative(PROJECT_ROOT, backupPath).replace(/\\/g, "/");
}

async function optimizeSingle(item, config) {
  const service = config.services[item.serviceKey];
  if (!service) {
    return {
      ...item,
      optimized: false,
      error: "Service could not be classified."
    };
  }

  const sharp = tryLoadSharp();
  const galleryDir = path.join(PROJECT_ROOT, service.galleryFolder);
  fs.mkdirSync(galleryDir, { recursive: true });

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const baseName = `${slugify(item.city)}-${slugify(service.label)}-${stamp}`;
  const backupPath = ensureBackup(item, config);
  const ext = item.mediaType === "image" ? ".jpg" : path.extname(item.fileName).toLowerCase();
  const outputPath = path.join(galleryDir, `${baseName}${ext}`);
  const webpPath = path.join(galleryDir, `${baseName}.webp`);
  const thumbPath = path.join(galleryDir, `${baseName}-thumb.webp`);

  if (item.mediaType === "image" && sharp) {
    await sharp(item.absolutePath)
      .rotate()
      .resize({ width: config.imageOptimization.maxWidth, withoutEnlargement: true })
      .jpeg({ quality: config.imageOptimization.quality, mozjpeg: true })
      .toFile(outputPath);

    await sharp(item.absolutePath)
      .rotate()
      .resize({ width: config.imageOptimization.maxWidth, withoutEnlargement: true })
      .webp({ quality: config.imageOptimization.quality })
      .toFile(webpPath);

    await sharp(item.absolutePath)
      .rotate()
      .resize({ width: config.imageOptimization.thumbnailWidth, withoutEnlargement: true })
      .webp({ quality: 72 })
      .toFile(thumbPath);

    return {
      ...item,
      optimized: true,
      optimizer: "sharp",
      backupPath,
      mediaUrl: path.relative(PROJECT_ROOT, webpPath).replace(/\\/g, "/"),
      fallbackMediaUrl: path.relative(PROJECT_ROOT, outputPath).replace(/\\/g, "/"),
      thumbnailUrl: path.relative(PROJECT_ROOT, thumbPath).replace(/\\/g, "/")
    };
  }

  fs.copyFileSync(item.absolutePath, outputPath);
  return {
    ...item,
    optimized: true,
    optimizer: sharp ? "copy-video" : "copy-only-install-sharp-for-webp",
    backupPath,
    mediaUrl: path.relative(PROJECT_ROOT, outputPath).replace(/\\/g, "/"),
    fallbackMediaUrl: path.relative(PROJECT_ROOT, outputPath).replace(/\\/g, "/"),
    thumbnailUrl: ""
  };
}

async function optimizeImages(items, options = {}) {
  const config = options.config || loadMediaConfig();
  const publishable = items.filter((item) => item.publishable);
  const optimized = [];
  const skipped = items.filter((item) => !item.publishable);

  for (const item of publishable) {
    optimized.push(await optimizeSingle(item, config));
  }

  return {
    optimized,
    skipped
  };
}

module.exports = {
  optimizeImages,
  slugify
};
