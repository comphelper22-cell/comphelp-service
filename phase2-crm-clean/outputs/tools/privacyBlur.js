const fs = require("fs");
const path = require("path");
const { PROJECT_ROOT, loadMediaConfig } = require("./watchUploads");

function moveForPrivacyReview(item, config = loadMediaConfig()) {
  const reviewDir = path.join(PROJECT_ROOT, config.folders.needsReview);
  fs.mkdirSync(reviewDir, { recursive: true });
  const reviewPath = path.join(reviewDir, item.fileName);

  if (!fs.existsSync(reviewPath)) {
    fs.copyFileSync(item.absolutePath, reviewPath);
  }

  return {
    ...item,
    privacyStatus: "needs_owner_review",
    reviewPath: path.relative(PROJECT_ROOT, reviewPath).replace(/\\/g, "/"),
    blurApplied: false,
    publishable: false
  };
}

async function privacyBlur(items, options = {}) {
  const config = options.config || loadMediaConfig();
  const privacyOk = Boolean(options.privacyOk);

  return items.map((item) => {
    if (item.requiresPrivacyReview && !privacyOk) {
      return moveForPrivacyReview(item, config);
    }

    return {
      ...item,
      privacyStatus: privacyOk ? "owner_approved" : "no_flags_detected",
      blurApplied: false,
      publishable: true
    };
  });
}

module.exports = {
  privacyBlur
};
