const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const MARKETPLACE_FILE = path.join(ROOT, "data", "marketplace.json");

function readMarketingData(input = {}) {
  if (input.data) return normalize(input.data, false);
  try {
    return normalize(JSON.parse(fs.readFileSync(MARKETPLACE_FILE, "utf8").replace(/^\uFEFF/, "")), false);
  } catch (_) {
    return normalize({}, true);
  }
}

function normalize(data = {}, forcedDemo = false) {
  const leads = arr(data.leads);
  const marketingIdeas = arr(data.marketingIdeas);
  const campaigns = arr(data.campaigns);
  const reviews = arr(data.reviews);
  const socialPosts = arr(data.socialPosts || data.smmDrafts);
  const emails = arr(data.emailCampaigns);
  const hasData = leads.length || marketingIdeas.length || campaigns.length || reviews.length || socialPosts.length || emails.length;
  const demoMode = forcedDemo || !hasData;
  return demoMode ? demoData() : { leads, marketingIdeas, campaigns, reviews, socialPosts, emails, demoMode };
}

function leadSources(input = {}) {
  const data = readMarketingData(input);
  const bySource = data.leads.reduce((acc, lead) => {
    const source = lead.source || "unknown";
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {});
  return {
    ok: true,
    data: {
      demoMode: data.demoMode,
      leadsToday: data.leads.filter((lead) => withinDays(lead.createdAt || lead.timestamp, 1)).length,
      totalLeads: data.leads.length,
      bySource,
      topSource: Object.keys(bySource).sort((a, b) => bySource[b] - bySource[a])[0] || "unknown",
      generatedAt: new Date().toISOString()
    }
  };
}

function withinDays(value, days) {
  if (!value) return true;
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return true;
  return Date.now() - date.getTime() <= days * 86400000;
}

function arr(value) {
  return Array.isArray(value) ? value : [];
}

function demoData() {
  const now = new Date().toISOString();
  return {
    demoMode: true,
    leads: [
      { name: "Demo Website Lead", source: "website", service: "Security Camera Installation", city: "Los Angeles", createdAt: now },
      { name: "Demo Instagram Lead", source: "instagram", service: "WiFi & Network Installation", city: "Burbank", createdAt: now },
      { name: "Demo Google Lead", source: "google_business", service: "Computer Repair", city: "Glendale", createdAt: now }
    ],
    marketingIdeas: [{ type: "seo", service: "Security Camera Installation", city: "Los Angeles" }],
    campaigns: [{ name: "Local Camera Install Push", channel: "Google Business", spend: 75, leads: 3, revenue: 899 }],
    reviews: [{ rating: 5, source: "Google", status: "published" }],
    socialPosts: [{ platform: "Instagram", status: "draft", reach: 0 }],
    emails: [{ name: "Maintenance Reminder", status: "draft", sends: 0, leads: 0 }]
  };
}

module.exports = {
  leadSources,
  readMarketingData
};
