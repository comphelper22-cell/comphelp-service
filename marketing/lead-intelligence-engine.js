const { customerCrm } = require("../crm/customer-crm");
const { rankLeads, scoreLead } = require("./lead-scoring");
const { createOutreachDrafts, evaluateOutreachPolicy } = require("./outreach-policy");

const DEFAULT_LEADS = [
  {
    id: "lead-intel-dental-la",
    source: "google_business_public_listing_placeholder",
    businessName: "Los Angeles Dental Office Prospect",
    businessType: "dental offices",
    city: "Los Angeles",
    neighborhood: "Mid-Wilshire",
    category: "camera installation prospects",
    possibleServiceNeed: "Security camera installation and office WiFi upgrade",
    reason: "Dental offices often need lobby, entry, and back-office camera coverage plus reliable patient WiFi.",
    publicListingUrl: "manual-research-placeholder",
    reviewSignals: "Mentions parking lot safety and inconsistent guest WiFi.",
    websiteQuality: "basic website with no visible security vendor",
    urgency: "high",
    likelyBudget: "high",
    distanceMiles: 7,
    serviceFit: 94,
    phoneAvailable: true,
    emailAvailable: false,
    status: "needs_review"
  },
  {
    id: "lead-intel-restaurant-burbank",
    source: "yelp_public_category_placeholder",
    businessName: "Burbank Restaurant Prospect",
    businessType: "restaurants",
    city: "Burbank",
    neighborhood: "Downtown Burbank",
    category: "WiFi/network cabling prospects",
    possibleServiceNeed: "Guest WiFi, POS network cleanup, and cameras",
    reason: "Restaurants depend on stable POS and camera coverage during evening hours.",
    publicListingUrl: "manual-research-placeholder",
    reviewSignals: "Public reviews mention slow checkout and crowded entry area.",
    websiteQuality: "modern but no visible IT support information",
    urgency: "medium",
    likelyBudget: "medium",
    distanceMiles: 12,
    serviceFit: 86,
    phoneAvailable: true,
    emailAvailable: true,
    status: "needs_review"
  },
  {
    id: "lead-intel-property-glendale",
    source: "local_business_directory_placeholder",
    businessName: "Glendale Property Manager Prospect",
    businessType: "property managers",
    city: "Glendale",
    neighborhood: "Pacific-Edison",
    category: "camera installation prospects",
    possibleServiceNeed: "Multi-unit camera upgrade and network rack cleanup",
    reason: "Property managers frequently need repeat camera, WiFi, and low-voltage support.",
    publicListingUrl: "manual-research-placeholder",
    reviewSignals: "Tenant comments mention entry access and building maintenance delays.",
    websiteQuality: "outdated website",
    urgency: "high",
    likelyBudget: "high",
    distanceMiles: 10,
    serviceFit: 92,
    phoneAvailable: true,
    emailAvailable: true,
    status: "needs_review"
  },
  {
    id: "lead-intel-retail-noho",
    source: "facebook_marketplace_manual_research_placeholder",
    businessName: "North Hollywood Retail Prospect",
    businessType: "retail stores",
    city: "North Hollywood",
    neighborhood: "NoHo Arts District",
    category: "computer repair prospects",
    possibleServiceNeed: "Computer repair and backup setup",
    reason: "Small retail shops often need POS computer repair, backups, and security camera support.",
    publicListingUrl: "manual-research-placeholder",
    reviewSignals: "Manual review placeholder: tech support need should be verified by owner.",
    websiteQuality: "missing website",
    urgency: "medium",
    likelyBudget: "medium",
    distanceMiles: 9,
    serviceFit: 80,
    phoneAvailable: false,
    emailAvailable: false,
    status: "needs_review"
  },
  {
    id: "lead-intel-warehouse-la",
    source: "construction_service_listing_placeholder",
    businessName: "LA Warehouse Prospect",
    businessType: "warehouses",
    city: "Los Angeles",
    neighborhood: "Vernon",
    category: "WiFi/network cabling prospects",
    possibleServiceNeed: "Warehouse WiFi coverage and camera installation",
    reason: "Warehouses have larger coverage needs and higher-ticket camera or network projects.",
    publicListingUrl: "manual-research-placeholder",
    reviewSignals: "Public listing suggests new operations and no visible IT provider.",
    websiteQuality: "basic website",
    urgency: "medium",
    likelyBudget: "high",
    distanceMiles: 15,
    serviceFit: 88,
    phoneAvailable: true,
    emailAvailable: false,
    status: "needs_review"
  }
];

function leadIntelligence(input = {}) {
  const city = String(input.city || "").toLowerCase();
  const service = String(input.service || "").toLowerCase();
  let leads = DEFAULT_LEADS.map(enrichLead);
  if (city) leads = leads.filter((lead) => lead.city.toLowerCase().includes(city));
  if (service) {
    leads = leads.filter((lead) => String(lead.possibleServiceNeed || "").toLowerCase().includes(service));
  }
  const ranked = rankLeads(leads);
  return {
    ok: true,
    data: {
      externalFetchEnabled: false,
      sourceMode: "public-source-placeholders-and-owner-review",
      topLeadsToday: ranked.slice(0, Number(input.limit || 8)),
      bestNeighborhoods: summarize(ranked, "neighborhood"),
      bestIndustries: summarize(ranked, "businessType"),
      followUpQueue: ranked.filter((lead) => lead.status === "needs_review").slice(0, 6),
      marketOpportunityScore: Math.round(avg(ranked.map((lead) => lead.score))),
      outreachApprovalRequired: true,
      generatedAt: new Date().toISOString()
    }
  };
}

function saveLeadToCrm(input = {}) {
  const leadId = input.leadId;
  const status = normalizeCrmStatus(input.status || "prospect");
  const lead = DEFAULT_LEADS.map(enrichLead).find((item) => item.id === leadId) || input.lead;
  if (!lead) return fail("lead_not_found");
  const customer = customerCrm.create({
    fullName: lead.businessName,
    company: lead.businessName,
    phone: lead.phone || "",
    email: lead.email || "",
    city: lead.city,
    state: "CA",
    status,
    leadSource: lead.source,
    tags: [status, lead.businessType, lead.category, "ai_marketing_manager"],
    notes: `${lead.reason} Possible need: ${lead.possibleServiceNeed}. Outreach requires owner approval.`,
    metadata: {
      sourceLeadId: lead.id,
      marketIntelligence: true,
      outreachApproved: false,
      publicBusinessInfoOnly: true
    }
  });
  if (!customer.ok) return customer;
  customerCrm.note({
    customerId: customer.data.id,
    body: `AI Marketing Manager saved lead as ${status}. Score: ${lead.score}/100. Do not contact without owner approval.`,
    internal: true,
    pinned: true
  });
  return ok({ customer: customer.data, lead, crmStatus: status, outreachApprovalRequired: true });
}

function enrichLead(lead) {
  const scored = scoreLead(lead).data;
  return {
    ...lead,
    score: scored.score,
    probabilityToClose: scored.probabilityToClose,
    scoreReasoning: scored.reasoning,
    outreachApproved: false,
    approvalRequired: true,
    outreachDrafts: createOutreachDrafts(lead),
    outreachPolicy: evaluateOutreachPolicy({ lead }).data,
    privacy: "public_business_information_only"
  };
}

function summarize(leads, key) {
  const counts = leads.reduce((acc, lead) => {
    const label = lead[key] || "Unknown";
    if (!acc[label]) acc[label] = { title: label, count: 0, score: 0 };
    acc[label].count += 1;
    acc[label].score += Number(lead.score || 0);
    return acc;
  }, {});
  return Object.values(counts).map((item) => ({
    title: item.title,
    count: item.count,
    averageScore: Math.round(item.score / item.count)
  })).sort((a, b) => b.averageScore - a.averageScore);
}

function normalizeCrmStatus(value) {
  return String(value || "prospect").trim().toLowerCase().replace(/\s+/g, "_").replace(/-/g, "_");
}

function avg(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + Number(value || 0), 0) / values.length;
}

function ok(data) {
  return { ok: true, data, error: null, warnings: [], generatedAt: new Date().toISOString() };
}

function fail(error) {
  return { ok: false, data: null, error: String(error || "lead_intelligence_error"), warnings: [], generatedAt: new Date().toISOString() };
}

module.exports = {
  DEFAULT_LEADS,
  leadIntelligence,
  saveLeadToCrm
};
