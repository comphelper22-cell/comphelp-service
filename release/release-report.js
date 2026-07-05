const { systemHealth } = require("./system-health");
const { versionManager } = require("./version-manager");
const { performanceReview } = require("./performance-review");
const { qualityScore } = require("./quality-score");
const { releaseValidator } = require("./release-validator");

function releaseReport(input = {}) {
  const health = systemHealth(input).data;
  const version = versionManager(input).data;
  const performance = performanceReview(input).data;
  const quality = qualityScore(input).data;
  const validation = releaseValidator(input).data;
  return {
    ok: true,
    data: {
      version,
      systemHealth: health,
      performanceReview: performance,
      qualityScore: quality,
      validation,
      architectureReview: architectureReview(),
      securityReview: securityReview(),
      uiReview: uiReview(validation),
      documentationReview: documentationReview(validation),
      overallProductScore: quality.overall,
      readinessScore: Math.min(100, Math.round((quality.overall + performance.score + (validation.status === "pass" ? 100 : 85)) / 3)),
      recommendation: "Proceed to owner-reviewed beta release candidate after warning review and approved deployment.",
      generatedAt: new Date().toISOString()
    }
  };
}

function architectureReview() {
  return {
    status: "stable",
    notes: [
      "Business modules are organized by domain.",
      "Internal API modules route through consolidated /api/system where appropriate.",
      "JSON fallback remains available across platform foundations.",
      "External integrations remain disabled unless explicitly configured."
    ]
  };
}

function securityReview() {
  return {
    status: "review_required_before_production",
    notes: [
      "Do not stage .env, .env.local, or logs/*.jsonl.",
      "Review security keyword scan warnings from check-project.",
      "Admin-code access should evolve before multi-tenant production launch.",
      "Do not connect payment or external integrations before approval."
    ]
  };
}

function uiReview(validation) {
  return {
    status: validation.navigation.status === "pass" ? "consistent" : "review",
    notes: [
      "Marketplace navigation targets should all map to visible sections.",
      "Release Center should be used as the first V1.0 review surface.",
      "Mobile responsiveness remains CSS-driven through existing layout system."
    ]
  };
}

function documentationReview(validation) {
  return {
    status: validation.docs.status === "pass" ? "complete_for_rc" : "review",
    notes: [
      "V1 release docs added for user, admin, architecture, deployment, known issues, and technical debt.",
      "Sprint plan and roadmap should continue to be updated after release candidate review."
    ]
  };
}

module.exports = { releaseReport };
