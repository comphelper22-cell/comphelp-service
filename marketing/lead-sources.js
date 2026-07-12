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
  const sourceCounts = data.leads.reduce((acc, lead) => {
    const source = String(lead.source || "unknown");
    acc.set(source, (acc.get(source) || 0) + 1);
    return acc;
  }, new Map());
  const bySource = Object.fromEntries(sourceCounts);
  const sourceAnalytics = Array.from(sourceCounts.keys()).reduce((acc, source) => {
    const sourceLeads = data.leads.filter((lead) => String(lead.source || "unknown") === source);
    const now = Date.now();
    const current = sourceLeads.filter((lead) => {
      const age = ageDays(lead.createdAt || lead.timestamp, now);
      return age !== null && age <= 7;
    }).length;
    const previous = sourceLeads.filter((lead) => {
      const age = ageDays(lead.createdAt || lead.timestamp, now);
      return age !== null && age > 7 && age <= 14;
    }).length;
    const converted = sourceLeads.filter((lead) => /converted|won|booked|customer|completed/i.test(lead.status || "") || lead.jobId).length;
    const sharedFiles = sourceLeads.reduce((total, lead) => total + assetCount(lead, ["files", "attachments", "sharedFiles"]), 0);
    const sharedMedia = sourceLeads.reduce((total, lead) => total + assetCount(lead, ["media", "photos", "videos", "sharedMedia"]), 0);
    acc[source] = {
      source,
      leads: sourceLeads.length,
      currentPeriod: current,
      previousPeriod: previous,
      growth: previous ? Math.round(((current - previous) / previous) * 100) : null,
      converted,
      conversionRate: sourceLeads.length ? Math.round((converted / sourceLeads.length) * 100) : 0,
      sharedFiles,
      sharedMedia,
      weeklyTrend: Array.from({ length: 6 }, (_, index) => {
        const newestWeek = 5 - index;
        return sourceLeads.filter((lead) => {
          const age = ageDays(lead.createdAt || lead.timestamp, now);
          return age !== null && age >= newestWeek * 7 && age < (newestWeek + 1) * 7;
        }).length;
      }),
      topServices: topValues(sourceLeads, "service", 4),
      topCities: topValues(sourceLeads, "city", 4),
      recentActivity: sourceLeads.slice().sort((a, b) => new Date(b.createdAt || b.timestamp || 0) - new Date(a.createdAt || a.timestamp || 0)).slice(0, 6).map((lead) => ({
        name: lead.businessName || lead.name || "Lead",
        service: lead.service || "Service inquiry",
        city: lead.city || "",
        status: lead.status || "new",
        createdAt: lead.createdAt || lead.timestamp || ""
      }))
    };
    return acc;
  }, Object.create(null));
  return {
    ok: true,
    data: {
      demoMode: data.demoMode,
      leadsToday: data.leads.filter((lead) => withinDays(lead.createdAt || lead.timestamp, 1)).length,
      totalLeads: data.leads.length,
      bySource,
      sourceAnalytics,
      topSource: Object.keys(bySource).sort((a, b) => bySource[b] - bySource[a])[0] || "unknown",
      generatedAt: new Date().toISOString()
    }
  };
}

function assetCount(item, fields) {
  const seen = new Set();
  fields.forEach((field) => arr(item[field]).forEach((asset) => {
    const key = asset && typeof asset === "object"
      ? asset.id || asset.url || asset.path || asset.name || JSON.stringify(asset)
      : String(asset);
    seen.add(String(key));
  }));
  return seen.size;
}

function ageDays(value, now = Date.now()) {
  if (!value) return null;
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp) || timestamp > now) return null;
  return (now - timestamp) / 86400000;
}

function topValues(items, field, limit) {
  const counts = items.reduce((acc, item) => {
    const value = String(item[field] || "Not specified");
    acc.set(value, (acc.get(value) || 0) + 1);
    return acc;
  }, new Map());
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([name, count]) => ({ name, count }));
}

function withinDays(value, days) {
  const age = ageDays(value);
  return age !== null && age <= days;
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
