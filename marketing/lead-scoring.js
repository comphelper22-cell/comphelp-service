const CATEGORY_SCORES = {
  "dental offices": 18,
  "small offices": 16,
  restaurants: 15,
  "retail stores": 14,
  warehouses: 17,
  "apartment managers": 18,
  "property managers": 18,
  "camera installation prospects": 19,
  "wifi/network cabling prospects": 17,
  "computer repair prospects": 12,
  "data recovery prospects": 15
};

const BUDGET_SCORES = {
  high: 16,
  medium: 10,
  low: 5
};

const URGENCY_SCORES = {
  high: 16,
  medium: 10,
  low: 4
};

function scoreLead(lead = {}) {
  const businessType = CATEGORY_SCORES[String(lead.businessType || lead.category || "").toLowerCase()] || 10;
  const urgency = URGENCY_SCORES[String(lead.urgency || "").toLowerCase()] || 6;
  const likelyBudget = BUDGET_SCORES[String(lead.likelyBudget || "").toLowerCase()] || 7;
  const serviceFit = clamp(Number(lead.serviceFit || 70), 0, 100) * 0.18;
  const distance = distanceScore(lead.distanceMiles);
  const reviewSignals = signalScore(lead.reviewSignals);
  const websiteQuality = websiteScore(lead.websiteQuality);
  const contactAvailability = contactScore(lead);
  const raw = businessType + urgency + likelyBudget + serviceFit + distance + reviewSignals + websiteQuality + contactAvailability;
  const score = Math.round(clamp(raw, 0, 100));
  return {
    ok: true,
    data: {
      leadId: lead.id || null,
      score,
      probabilityToClose: probability(score),
      priority: score >= 80 ? "high" : score >= 62 ? "medium" : "review",
      factors: {
        businessType,
        urgency,
        likelyBudget,
        serviceFit: Math.round(serviceFit),
        distance,
        reviewSignals,
        websiteQuality,
        contactAvailability
      },
      reasoning: buildReasoning(lead, score),
      generatedAt: new Date().toISOString()
    }
  };
}

function rankLeads(leads = []) {
  return leads.map((lead) => {
    const scoring = scoreLead(lead).data;
    return { ...lead, score: scoring.score, probabilityToClose: scoring.probabilityToClose, scoreReasoning: scoring.reasoning };
  }).sort((a, b) => b.score - a.score);
}

function distanceScore(value) {
  const miles = Number(value);
  if (!Number.isFinite(miles)) return 8;
  if (miles <= 5) return 12;
  if (miles <= 12) return 9;
  if (miles <= 25) return 6;
  return 3;
}

function signalScore(value) {
  const text = String(value || "").toLowerCase();
  if (/security|camera|wifi|network|slow|outage|break|data|repair/.test(text)) return 12;
  if (/complaint|weak|old|missing|unreliable/.test(text)) return 9;
  if (text) return 5;
  return 2;
}

function websiteScore(value) {
  const text = String(value || "").toLowerCase();
  if (/missing|outdated|basic|slow|broken/.test(text)) return 8;
  if (/good|modern|strong/.test(text)) return 4;
  return 5;
}

function contactScore(lead = {}) {
  let score = 0;
  if (lead.phoneAvailable || lead.phone) score += 5;
  if (lead.emailAvailable || lead.email) score += 3;
  if (lead.website) score += 2;
  return score;
}

function probability(score) {
  if (score >= 85) return "high";
  if (score >= 65) return "medium";
  return "low";
}

function buildReasoning(lead, score) {
  const reasons = [
    `${lead.businessName || "Lead"} fits ${lead.possibleServiceNeed || "CompHelp Service"} demand.`,
    `Lead score is ${score}/100 based on fit, urgency, distance, and public signals.`
  ];
  if (lead.reviewSignals) reasons.push(`Public signal: ${lead.reviewSignals}`);
  if (lead.websiteQuality) reasons.push(`Website signal: ${lead.websiteQuality}`);
  return reasons;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

module.exports = {
  rankLeads,
  scoreLead
};
