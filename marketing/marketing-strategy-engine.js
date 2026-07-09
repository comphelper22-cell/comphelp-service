const { leadIntelligence } = require("./lead-intelligence-engine");
const { marketWatcher } = require("./market-watcher");

function marketingStrategy(input = {}) {
  const leads = leadIntelligence(input).data;
  const market = marketWatcher(input).data;
  const topLead = leads.topLeadsToday[0] || {};
  const topService = market.popularServices[0] || { service: "Security Camera Installation", demandScore: 80 };
  const topNeighborhood = leads.bestNeighborhoods[0] || { title: "Los Angeles", averageScore: 75 };
  const topIndustry = leads.bestIndustries[0] || { title: "small offices", averageScore: 72 };
  return {
    ok: true,
    data: {
      recommendedServiceThisWeek: topService.service,
      bestCustomerSegment: topIndustry.title,
      bestNeighborhood: topNeighborhood.title,
      bestPriceOffer: priceOffer(topService.service),
      bestContentIdea: contentIdea(topService.service, topNeighborhood.title),
      bestOutreachMessage: outreachMessage(topLead),
      bestFollowUpTiming: "Prepare a draft today, then ask owner approval before any outreach.",
      recommendedCampaign: {
        title: `${topService.service} for ${topIndustry.title}`,
        channel: "Instagram, Facebook, Google Business Profile, and owner-approved direct outreach",
        audience: `${topIndustry.title} in ${topNeighborhood.title}`,
        cta: "Get a free estimate",
        safety: "Draft only. No sending without owner approval."
      },
      marketOpportunityScore: leads.marketOpportunityScore,
      generatedAt: new Date().toISOString()
    }
  };
}

function priceOffer(service) {
  if (/camera/i.test(service)) return "Free site review with clear camera installation estimate.";
  if (/wifi|network/i.test(service)) return "Free WiFi reliability check with repair or upgrade estimate.";
  if (/data/i.test(service)) return "Free recovery evaluation; recovery is not guaranteed.";
  if (/computer/i.test(service)) return "Free computer repair estimate after basic diagnosis.";
  return "Free estimate with clear next steps.";
}

function contentIdea(service, neighborhood) {
  if (/camera/i.test(service)) return `Post a short reel: 3 camera blind spots small businesses in ${neighborhood} should check.`;
  if (/wifi|network/i.test(service)) return `Post a quick tip: why guest WiFi should be separate from business devices in ${neighborhood}.`;
  if (/data/i.test(service)) return "Post an educational video: what to do first when an external drive stops working.";
  return "Post a before/after tech cleanup story with a free-estimate CTA.";
}

function outreachMessage(lead = {}) {
  return `Hi, I noticed ${lead.businessName || "your business"} may need ${lead.possibleServiceNeed || "local tech support"}. CompHelp Service can prepare a free estimate if helpful.`;
}

module.exports = {
  marketingStrategy
};
