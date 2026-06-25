const path = require("path");
const { loadMediaConfig } = require("./watchUploads");

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);
const VIDEO_EXTENSIONS = new Set([".mp4", ".mov", ".m4v", ".webm"]);

function clean(value, max = 240) {
  return String(value || "").trim().slice(0, max);
}

function detectMediaType(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  if (IMAGE_EXTENSIONS.has(ext)) return "image";
  if (VIDEO_EXTENSIONS.has(ext)) return "video";
  return "unsupported";
}

function classifyService(fileName, config = loadMediaConfig()) {
  const haystack = fileName.toLowerCase().replace(/[_-]+/g, " ");
  let best = { serviceKey: "", confidence: 0, label: "" };

  for (const [serviceKey, service] of Object.entries(config.services)) {
    const hits = service.keywords.filter((keyword) => haystack.includes(keyword.toLowerCase()));
    const confidence = hits.length / Math.max(service.keywords.length, 1);
    if (hits.length && confidence >= best.confidence) {
      best = {
        serviceKey,
        confidence: Math.min(0.95, 0.45 + hits.length * 0.15),
        label: service.label,
        matchedKeywords: hits
      };
    }
  }

  return best.serviceKey ? best : {
    serviceKey: "",
    confidence: 0,
    label: "",
    matchedKeywords: []
  };
}

function analyzeQuality(file, mediaType) {
  const sizeMb = file.size / 1024 / 1024;
  const warnings = [];
  let score = 0.72;

  if (mediaType === "unsupported") {
    return { score: 0, warnings: ["Unsupported file type."] };
  }

  if (sizeMb < 0.08) {
    score -= 0.35;
    warnings.push("Very small file; may be low resolution.");
  }

  if (mediaType === "video" && sizeMb < 1) {
    score -= 0.2;
    warnings.push("Small video file; verify quality before publishing.");
  }

  if (/blur|blurry|bad|test|duplicate/i.test(file.fileName)) {
    score -= 0.4;
    warnings.push("Filename suggests this file may be blurry, duplicate, or only a test.");
  }

  return {
    score: Math.max(0, Math.min(1, Number(score.toFixed(2)))),
    warnings
  };
}

function analyzePrivacy(file, config = loadMediaConfig()) {
  const haystack = file.fileName.toLowerCase().replace(/[_-]+/g, " ");
  const flags = config.privacy.sensitiveKeywords.filter((keyword) => haystack.includes(keyword.toLowerCase()));
  return {
    flags,
    requiresReview: flags.length > 0
  };
}

function analyzeMedia(files, options = {}) {
  const config = options.config || loadMediaConfig();
  return files.map((file) => {
    const mediaType = detectMediaType(file.fileName);
    const service = options.serviceKey
      ? {
          serviceKey: options.serviceKey,
          label: config.services[options.serviceKey]?.label || options.serviceKey,
          confidence: 1,
          matchedKeywords: ["owner override"]
        }
      : classifyService(file.fileName, config);
    const quality = analyzeQuality(file, mediaType);
    const privacy = analyzePrivacy(file, config);

    return {
      ...file,
      mediaType,
      extension: path.extname(file.fileName).toLowerCase(),
      serviceKey: service.serviceKey,
      serviceLabel: service.label,
      serviceConfidence: service.confidence,
      matchedKeywords: service.matchedKeywords || [],
      qualityScore: quality.score,
      qualityWarnings: quality.warnings,
      privacyFlags: privacy.flags,
      requiresPrivacyReview: privacy.requiresReview,
      ownerNote: clean(options.note || ""),
      city: clean(options.city || ""),
      preferredService: clean(options.serviceKey || "")
    };
  });
}

module.exports = {
  analyzeMedia,
  detectMediaType,
  classifyService
};
