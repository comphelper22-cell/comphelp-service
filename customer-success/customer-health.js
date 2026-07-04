const { customerProfiles } = require("./customer-ltv");

function health(input = {}) {
  const profiles = customerProfiles(input).profiles.map(scoreProfile);
  const overallScore = profiles.length ? Math.round(profiles.reduce((sum, item) => sum + item.healthScore, 0) / profiles.length) : 72;
  return {
    ok: true,
    data: {
      overallScore,
      status: overallScore >= 80 ? "healthy" : overallScore >= 60 ? "watch" : "needs_attention",
      customers: profiles,
      generatedAt: new Date().toISOString()
    }
  };
}

function scoreProfile(profile) {
  let score = 65;
  if (profile.lifetimeValue >= 1000) score += 15;
  if (profile.completedJobs > 0) score += 10;
  if (profile.openTasks > 0) score -= 12;
  if (/risk|unhappy|waiting|churn|lost/i.test(`${profile.status} ${profile.notes}`)) score -= 25;
  if (profile.openEstimates > 0) score -= 5;
  score = Math.max(0, Math.min(100, score));
  return {
    ...profile,
    healthScore: score,
    healthStatus: score >= 80 ? "healthy" : score >= 60 ? "watch" : "at_risk"
  };
}

module.exports = { health, scoreProfile };
