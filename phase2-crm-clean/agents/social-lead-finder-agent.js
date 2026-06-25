const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DATA_FILE = path.join(ROOT, "data", "social-leads.json");

const PLATFORMS = ["Instagram", "TikTok"];
const SERVICES = ["Security Camera Installation", "WiFi & Network Installation", "Smart Home Setup", "Computer Repair", "Data Recovery"];
const CITIES = ["Los Angeles", "Burbank", "Glendale", "North Hollywood", "Studio City"];
const HASHTAGS = ["#losangelesbusiness", "#burbankbusiness", "#glendalebusiness", "#securitycamera", "#cctvinstallation", "#smallbusinessla", "#restaurantla", "#smokeshopla", "#autorepairla", "#laundromatla"];

function clean(value, max = 1000) {
  return String(value || "").trim().slice(0, max);
}

function id(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
}

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
  } catch (_) {
    return fallback;
  }
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  data.updatedAt = new Date().toISOString();
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf8");
  return data;
}

function socialSearchUrl(platform, hashtag) {
  const tag = clean(hashtag).replace(/^#/, "");
  if (platform === "TikTok") return `https://www.tiktok.com/tag/${encodeURIComponent(tag)}`;
  return `https://www.instagram.com/explore/tags/${encodeURIComponent(tag)}/`;
}

function inferBusinessType(hashtag, note = "") {
  const text = `${hashtag} ${note}`.toLowerCase();
  if (/restaurant/.test(text)) return "Restaurant";
  if (/smoke/.test(text)) return "Smoke shop";
  if (/auto/.test(text)) return "Auto repair shop";
  if (/laundromat/.test(text)) return "Laundromat";
  if (/business|small/.test(text)) return "Small business";
  return "Local business";
}

function inferServiceNeed(hashtag, businessType) {
  const text = `${hashtag} ${businessType}`.toLowerCase();
  if (/security|cctv|smoke|restaurant|auto|laundromat/.test(text)) return "Security Camera Installation";
  if (/business|restaurant|office/.test(text)) return "WiFi & Network Installation";
  return SERVICES[0];
}

function normalizeLead(input = {}) {
  const platform = PLATFORMS.includes(input.platform) ? input.platform : "Instagram";
  const hashtag = clean(input.hashtag || HASHTAGS[0], 80);
  const city = CITIES.includes(input.city) ? input.city : clean(input.city || "Los Angeles", 80);
  const businessType = clean(input.businessType || inferBusinessType(hashtag, input.reason), 120);
  const possibleServiceNeed = clean(input.possibleServiceNeed || inferServiceNeed(hashtag, businessType), 160);
  const profileName = clean(input.profileName || `${city} ${businessType} lead`, 160);
  const profileUrl = clean(input.profileUrl || socialSearchUrl(platform, hashtag), 300);
  return {
    id: input.id || id("social_lead"),
    platform,
    profileName,
    profileUrl,
    businessType,
    city,
    hashtag,
    possibleServiceNeed,
    reason: clean(input.reason || `Public ${platform} discovery from ${hashtag}; review manually before outreach.`, 700),
    status: "needs_review",
    source: "social_lead_finder",
    createdAt: new Date().toISOString()
  };
}

function saveSocialLead(input = {}) {
  const lead = normalizeLead(input);
  const data = readJson(DATA_FILE, { version: 1, items: [] });
  data.items = Array.isArray(data.items) ? data.items : [];
  const duplicate = data.items.some((item) => clean(item.platform).toLowerCase() === lead.platform.toLowerCase() && clean(item.profileUrl).toLowerCase() === lead.profileUrl.toLowerCase());
  if (!duplicate) {
    data.items.unshift(lead);
    writeJson(DATA_FILE, data);
  }
  return duplicate ? { ...lead, duplicate: true } : lead;
}

function findSocialLeads(input = {}) {
  const platform = PLATFORMS.includes(input.platform) ? input.platform : "Instagram";
  const city = CITIES.includes(input.city) ? input.city : clean(input.city || "Los Angeles", 80);
  const hashtags = clean(input.hashtag, 100) ? [clean(input.hashtag, 100)] : HASHTAGS.slice(0, 5);
  const leads = hashtags.map((hashtag) => saveSocialLead({
    platform,
    city,
    hashtag,
    profileName: clean(input.profileName, 160) || `${city} ${inferBusinessType(hashtag)} prospect`,
    businessType: input.businessType || inferBusinessType(hashtag),
    possibleServiceNeed: input.possibleServiceNeed || inferServiceNeed(hashtag, input.businessType || ""),
    reason: `Found from public ${platform} hashtag/search URL for ${hashtag}. Owner review required before any message.`
  }));
  return {
    platform,
    city,
    hashtags,
    leads,
    searchUrls: hashtags.map((hashtag) => ({ hashtag, url: socialSearchUrl(platform, hashtag) })),
    note: "This creates review records and search links only. It does not scrape private data or auto-message."
  };
}

function contentPlan(input = {}) {
  const city = clean(input.city || "Los Angeles", 80);
  return {
    days: [
      { day: 1, format: "Reel", topic: "Security camera placement tips", cta: "Ask for a free estimate" },
      { day: 2, format: "Reel", topic: "Common WiFi dead zones in small businesses", cta: "Book WiFi help" },
      { day: 3, format: "Reel", topic: "Security cameras for restaurants and shops", cta: "Request camera estimate" },
      { day: 4, format: "Before/After", topic: "Clean tech setup project", cta: "See what CompHelp Service can fix" },
      { day: 5, format: "Reel", topic: "Why CCTV wiring matters", cta: "Get professional support" },
      { day: 6, format: "Reel", topic: "Router and access point upgrade signs", cta: "Ask for a network estimate" },
      { day: 7, format: "Education video", topic: "When to repair vs replace a computer", cta: "Message for local help" }
    ],
    captions: [
      `Local ${city} businesses: clean camera and WiFi setups make daily operations easier.`,
      "Slow WiFi or blind spots? CompHelp Service helps local businesses plan reliable tech."
    ],
    hashtags: ["#CompHelpService", "#LosAngelesBusiness", "#SecurityCamera", "#WiFiInstallation", "#SmallBusinessLA"],
    voiceover: "CompHelp Service helps local businesses with cameras, WiFi, smart devices, computer repair, and data recovery.",
    postingSchedule: ["Instagram Reel: 6 PM", "TikTok: 7:30 PM", "Instagram/Facebook post: noon"],
    approvalRequired: true
  };
}

function main() {
  console.log(JSON.stringify(findSocialLeads({ platform: process.argv[2], city: process.argv[3] }), null, 2));
}

if (require.main === module) main();

module.exports = { PLATFORMS, SERVICES, CITIES, HASHTAGS, saveSocialLead, findSocialLeads, contentPlan, socialSearchUrl };
