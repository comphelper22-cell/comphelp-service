function selectBestMedia(analysis, options = {}) {
  const maxItems = Number(options.maxItems || 6);
  const seen = new Set();
  const rejected = [];

  const ranked = analysis
    .filter((item) => {
      const duplicateKey = `${item.fileName.toLowerCase()}-${item.size}`;
      if (seen.has(duplicateKey)) {
        rejected.push({ ...item, rejectReason: "Duplicate upload." });
        return false;
      }
      seen.add(duplicateKey);

      if (item.mediaType === "unsupported") {
        rejected.push({ ...item, rejectReason: "Unsupported file type." });
        return false;
      }

      if (item.qualityScore < 0.45) {
        rejected.push({ ...item, rejectReason: "Low quality score." });
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      const serviceDelta = (b.serviceConfidence || 0) - (a.serviceConfidence || 0);
      if (serviceDelta !== 0) return serviceDelta;
      const qualityDelta = (b.qualityScore || 0) - (a.qualityScore || 0);
      if (qualityDelta !== 0) return qualityDelta;
      return (b.size || 0) - (a.size || 0);
    });

  const selected = ranked.slice(0, maxItems);
  const overflow = ranked.slice(maxItems).map((item) => ({
    ...item,
    rejectReason: "Not selected; stronger media was available."
  }));

  return {
    selected,
    rejected: rejected.concat(overflow),
    requiresOwnerInfo: selected.some((item) => !item.city || !item.serviceKey || item.requiresPrivacyReview)
  };
}

module.exports = {
  selectBestMedia
};
