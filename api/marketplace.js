const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(process.cwd(), "data", "marketplace.json");
const GALLERY_FILE = path.join(process.cwd(), "data", "gallery.json");
const DEFAULT_MARKETPLACE = {
  version: 1,
  business: {
    name: "CompHelp Service",
    phone: "+1 (747) 295-1440",
    email: "comphelper22@gmail.com",
    serviceAreas: ["Los Angeles", "Burbank", "Glendale", "North Hollywood", "Studio City"]
  },
  services: ["Security Camera Installation", "Smart Home Setup", "WiFi & Network Installation", "Computer Repair", "Data Recovery"],
  vendorCategories: ["Cameras", "WiFi", "Computer Repair", "Data Recovery", "Smart Home", "Electrician", "HVAC", "Plumbing", "Roofing"],
  estimateRules: {
    "Security Camera Installation": { base: 299, unit: "camera", perUnit: 125, questions: ["Property type", "Number of cameras", "Wiring needed", "Preferred installation date"] },
    "Smart Home Setup": { base: 149, unit: "device", perUnit: 55, questions: ["Device types", "Number of devices", "WiFi readiness", "Preferred setup date"] },
    "WiFi & Network Installation": { base: 199, unit: "access point", perUnit: 90, questions: ["Property size", "Dead zones", "Router location", "Preferred installation date"] },
    "Computer Repair": { base: 89, unit: "device", perUnit: 60, questions: ["Device type", "Issue symptoms", "Urgency", "Preferred service date"] },
    "Data Recovery": { base: 149, unit: "drive", perUnit: 120, questions: ["Device or drive type", "What happened", "Files needed", "Preferred service date"] }
  },
  vendors: [],
  leads: [],
  estimates: [],
  quoteRequests: [],
  commissions: [],
  projects: [],
  marketingIdeas: [],
  mediaReviews: [],
  sourceLeads: [],
  dispatches: [],
  followUps: []
};
const DEFAULT_GALLERY = { version: 1, items: [] };
const TABLES = {
  leads: "marketplace_leads",
  vendors: "marketplace_vendors",
  estimates: "marketplace_estimates",
  quoteRequests: "marketplace_quote_requests",
  commissions: "marketplace_commissions",
  projects: "marketplace_projects",
  marketingIdeas: "marketplace_marketing_ideas",
  mediaReviews: "marketplace_media_reviews",
  sourceLeads: "marketplace_source_leads",
  dispatches: "marketplace_dispatches",
  followUps: "marketplace_followups"
};

function sendJson(res, statusCode, body) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

function clean(value, max = 1000) {
  return String(value || "").trim().slice(0, max);
}

function money(value) {
  return Math.max(0, Number(value || 0));
}

function id(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
}

function logError(where, error) {
  console.error("marketplace_api_error", error);
  console.error("[marketplace]", where, {
    message: error && error.message ? error.message : String(error),
    stack: error && error.stack ? error.stack : undefined
  });
}

function safeError(where, error, fallback = "Marketplace request failed.") {
  return {
    ok: false,
    error: clean(error && error.message ? error.message : fallback, 500),
    where
  };
}

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
  } catch (error) {
    logError(`readJson:${path.basename(file)}`, error);
    tryWriteJson(file, fallback);
    return fallback;
  }
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function tryWriteJson(file, data) {
  try {
    writeJson(file, data);
    return { ok: true };
  } catch (error) {
    logError(`writeJson:${path.basename(file)}`, error);
    return { ok: false, warning: "Database not connected and local JSON could not be written in this environment." };
  }
}

function readSeed() {
  const seed = readJson(DATA_FILE, DEFAULT_MARKETPLACE);
  return {
    ...DEFAULT_MARKETPLACE,
    ...seed,
    business: { ...DEFAULT_MARKETPLACE.business, ...(seed.business || {}) },
    estimateRules: { ...DEFAULT_MARKETPLACE.estimateRules, ...(seed.estimateRules || {}) },
    services: Array.isArray(seed.services) && seed.services.length ? seed.services : DEFAULT_MARKETPLACE.services,
    vendorCategories: Array.isArray(seed.vendorCategories) && seed.vendorCategories.length ? seed.vendorCategories : DEFAULT_MARKETPLACE.vendorCategories,
    vendors: Array.isArray(seed.vendors) ? seed.vendors : [],
    leads: Array.isArray(seed.leads) ? seed.leads : [],
    estimates: Array.isArray(seed.estimates) ? seed.estimates : [],
    quoteRequests: Array.isArray(seed.quoteRequests) ? seed.quoteRequests : [],
    commissions: Array.isArray(seed.commissions) ? seed.commissions : [],
    projects: Array.isArray(seed.projects) ? seed.projects : [],
    marketingIdeas: Array.isArray(seed.marketingIdeas) ? seed.marketingIdeas : [],
    mediaReviews: Array.isArray(seed.mediaReviews) ? seed.mediaReviews : [],
    sourceLeads: Array.isArray(seed.sourceLeads) ? seed.sourceLeads : [],
    dispatches: Array.isArray(seed.dispatches) ? seed.dispatches : [],
    followUps: Array.isArray(seed.followUps) ? seed.followUps : []
  };
}

function resolveRole(req) {
  const actual = clean(req.headers["x-marketplace-admin-secret"], 500);
  if (!actual) return "";
  const roles = [
    ["admin", process.env.MARKETPLACE_ADMIN_SECRET || process.env.ADMIN_UPLOAD_SECRET],
    ["manager", process.env.MARKETPLACE_MANAGER_SECRET],
    ["viewer", process.env.MARKETPLACE_VIEWER_SECRET]
  ];
  const match = roles.find((entry) => entry[1] && entry[1] === actual);
  if (match) return match[0];

  const hasConfiguredSecret = roles.some((entry) => Boolean(entry[1]));
  if (!hasConfiguredSecret && process.env.NODE_ENV !== "production" && process.env.VERCEL_ENV !== "production") {
    const demoRoles = [
      ["admin", "123456"],
      ["manager", "222222"],
      ["viewer", "111111"]
    ];
    const demoMatch = demoRoles.find((entry) => entry[1] === actual);
    return demoMatch ? demoMatch[0] : "";
  }
  return "";
}

function hasAnyRoleSecretConfigured() {
  return Boolean(
    process.env.MARKETPLACE_ADMIN_SECRET ||
    process.env.MARKETPLACE_MANAGER_SECRET ||
    process.env.MARKETPLACE_VIEWER_SECRET ||
    process.env.ADMIN_UPLOAD_SECRET
  );
}

function loginStatus(req) {
  const code = clean(req.headers["x-marketplace-admin-secret"], 500);
  if (!code) return { ok: false, status: 400, error: "Missing admin code" };
  const role = resolveRole(req);
  if (role) return { ok: true, role };
  if (!hasAnyRoleSecretConfigured() && (process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production")) {
    return { ok: false, status: 500, error: "Server environment variable not configured" };
  }
  return { ok: false, status: 401, error: "Invalid code" };
}

function requireRole(req, allowed) {
  const role = resolveRole(req);
  if (!role && !hasAnyRoleSecretConfigured() && (process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production")) {
    return { ok: false, status: 500, error: "Server environment variable not configured" };
  }
  if (!role) return { ok: false, status: 401, error: "Invalid code" };
  if (!allowed.includes(role)) return { ok: false, status: 403, error: "Role does not have permission for this action." };
  return { ok: true, role };
}

function supabaseConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

async function supabase(pathname, options = {}) {
  const base = String(process.env.SUPABASE_URL || "").replace(/\/$/, "");
  const response = await fetch(`${base}/rest/v1/${pathname}`, {
    ...options,
    headers: {
      "apikey": process.env.SUPABASE_SERVICE_ROLE_KEY,
      "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation",
      ...(options.headers || {})
    }
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body && body.message ? body.message : "Supabase request failed.");
  return body || [];
}

function toDbRecord(record) {
  const out = {};
  for (const [key, value] of Object.entries(record)) {
    out[key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)] = value;
  }
  return out;
}

function fromDbRecord(record) {
  const out = {};
  for (const [key, value] of Object.entries(record || {})) {
    out[key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())] = value;
  }
  return out;
}

async function list(tableKey) {
  const seed = readSeed();
  if (!supabaseConfigured()) return seed[tableKey] || [];
  try {
    const rows = await supabase(`${TABLES[tableKey]}?select=*&order=created_at.desc`);
    return rows.map(fromDbRecord);
  } catch (error) {
    logError(`supabase:list:${tableKey}`, error);
    return seed[tableKey] || [];
  }
}

async function insert(tableKey, record) {
  const created = { ...record, id: record.id || id(tableKey), createdAt: new Date().toISOString() };
  if (!supabaseConfigured()) {
    const seed = readSeed();
    seed[tableKey] = Array.isArray(seed[tableKey]) ? seed[tableKey] : [];
    seed[tableKey].unshift(created);
    seed.updatedAt = new Date().toISOString();
    const write = tryWriteJson(DATA_FILE, seed);
    return { ...created, storage: write.ok ? "data/marketplace.json" : "memory_only", warning: write.warning };
  }
  try {
    const rows = await supabase(TABLES[tableKey], { method: "POST", body: JSON.stringify(toDbRecord(created)) });
    return fromDbRecord(rows[0]) || created;
  } catch (error) {
    logError(`supabase:insert:${tableKey}`, error);
    const seed = readSeed();
    seed[tableKey] = Array.isArray(seed[tableKey]) ? seed[tableKey] : [];
    seed[tableKey].unshift(created);
    seed.updatedAt = new Date().toISOString();
    const write = tryWriteJson(DATA_FILE, seed);
    return { ...created, storage: write.ok ? "data/marketplace.json" : "memory_only", warning: `Supabase unavailable; ${write.warning || "saved to local fallback."}` };
  }
}

async function updateRecord(tableKey, recordId, patch) {
  if (!recordId) throw new Error("Record id is required.");
  if (!supabaseConfigured()) {
    const seed = readSeed();
    seed[tableKey] = (seed[tableKey] || []).map((item) => item.id === recordId ? { ...item, ...patch, updatedAt: new Date().toISOString() } : item);
    const write = tryWriteJson(DATA_FILE, seed);
    if (!write.ok) return { ...patch, id: recordId, storage: "memory_only", warning: write.warning };
    return seed[tableKey].find((item) => item.id === recordId);
  }
  try {
    const rows = await supabase(`${TABLES[tableKey]}?id=eq.${encodeURIComponent(recordId)}`, {
      method: "PATCH",
      body: JSON.stringify(toDbRecord({ ...patch, updatedAt: new Date().toISOString() }))
    });
    return fromDbRecord(rows[0]);
  } catch (error) {
    logError(`supabase:update:${tableKey}`, error);
    const seed = readSeed();
    seed[tableKey] = (seed[tableKey] || []).map((item) => item.id === recordId ? { ...item, ...patch, updatedAt: new Date().toISOString() } : item);
    const write = tryWriteJson(DATA_FILE, seed);
    return { ...patch, id: recordId, storage: write.ok ? "data/marketplace.json" : "memory_only", warning: `Supabase unavailable; ${write.warning || "saved to local fallback."}` };
  }
}

async function deleteRecord(tableKey, recordId) {
  if (!recordId) throw new Error("Record id is required.");
  if (!supabaseConfigured()) {
    const seed = readSeed();
    seed[tableKey] = (seed[tableKey] || []).filter((item) => item.id !== recordId);
    const write = tryWriteJson(DATA_FILE, seed);
    return { deleted: write.ok, id: recordId, warning: write.warning };
  }
  try {
    await supabase(`${TABLES[tableKey]}?id=eq.${encodeURIComponent(recordId)}`, { method: "DELETE" });
    return { deleted: true, id: recordId };
  } catch (error) {
    logError(`supabase:delete:${tableKey}`, error);
    const seed = readSeed();
    seed[tableKey] = (seed[tableKey] || []).filter((item) => item.id !== recordId);
    const write = tryWriteJson(DATA_FILE, seed);
    return { deleted: write.ok, id: recordId, warning: `Supabase unavailable; ${write.warning || "deleted in local fallback."}` };
  }
}

async function callWebhook(name, payload) {
  const url = process.env[name];
  if (!url) return { skipped: true };
  try {
    const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    return { ok: response.ok, status: response.status };
  } catch (error) {
    logError(`webhook:${name}`, error);
    return { ok: false, error: "Webhook request failed." };
  }
}

async function createHubSpotContact(lead) {
  if (!process.env.HUBSPOT_ACCESS_TOKEN) return { skipped: true };
  try {
    const response = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
      method: "POST",
      headers: { "Authorization": `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ properties: { firstname: lead.name, email: lead.email, phone: lead.phone, city: lead.city || lead.address, message: lead.notes || lead.message } })
    });
    const body = await response.json().catch(() => ({}));
    return { ok: response.ok, id: body.id || "" };
  } catch (error) {
    logError("hubspot:createContact", error);
    return { ok: false, error: "HubSpot request failed." };
  }
}

function qualification(service, message) {
  const rules = readSeed().estimateRules?.[service] || {};
  return {
    score: message && message.length > 40 ? 82 : 64,
    stage: "qualified",
    questions: rules.questions || ["Project scope", "Timeline", "Budget", "Address"],
    nextAction: "Book free estimate and gather remaining project details."
  };
}

function calculateEstimate(payload) {
  const rules = readSeed().estimateRules?.[payload.service] || { base: 99, perUnit: 50, unit: "unit" };
  const units = Math.max(1, Number(payload.units || payload.quantity || 1));
  const laborHours = Math.max(0, Number(payload.laborHours || 0));
  const materialEstimate = money(payload.materialEstimate);
  const laborCost = money(payload.laborCost || laborHours * 45);
  const profitMargin = Math.min(80, Math.max(0, Number(payload.profitMargin || 30)));
  const commissionPercent = Math.min(60, Math.max(0, Number(payload.commissionPercent || 10)));
  const urgencyMultiplier = /same|urgent|today|emergency/i.test(payload.urgency || "") ? 1.25 : 1;
  const baseLow = rules.base + Math.max(0, units - 1) * rules.perUnit + laborHours * 65 + materialEstimate;
  const low = Math.round(baseLow * urgencyMultiplier);
  const high = Math.round((baseLow * 1.45 + 75) * urgencyMultiplier);
  const recommended = Math.round((low + high) / 2);
  const internalCost = Math.round(laborCost + materialEstimate + Math.max(0, units - 1) * rules.perUnit * 0.3);
  const commission = Math.round(recommended * (commissionPercent / 100));
  const targetProfit = Math.round(recommended * (profitMargin / 100));
  const expectedProfit = Math.max(0, recommended - internalCost - commission);
  return {
    id: id("estimate"),
    customerName: clean(payload.customerName, 120),
    email: clean(payload.email, 180),
    service: clean(payload.service, 120),
    city: clean(payload.city, 80),
    propertyType: clean(payload.propertyType, 120),
    units,
    unitLabel: rules.unit,
    laborHours,
    laborCost,
    materialEstimate,
    profitMargin,
    commissionPercent,
    commission,
    internalCost,
    targetProfit,
    expectedProfit,
    urgency: clean(payload.urgency, 100),
    low,
    high,
    recommended,
    range: `$${low} - $${high}`,
    customerQuoteText: `Based on the details provided, your ${clean(payload.service, 120).toLowerCase()} estimate is approximately $${low} - $${high}. A recommended planning number is $${recommended}. Final pricing depends on site conditions and equipment.`,
    internalNotes: `Units: ${units}; labor hours: ${laborHours}; labor cost: $${laborCost}; materials: $${materialEstimate}; profit target: ${profitMargin}%; commission: ${commissionPercent}%; urgency: ${clean(payload.urgency, 100) || "standard"}.`,
    notes: clean(payload.notes, 1500),
    disclaimer: "Final pricing depends on site conditions, equipment, wiring, access, urgency, and vendor availability.",
    createdAt: new Date().toISOString()
  };
}

async function openaiJson(system, payload, fallback) {
  if (!process.env.OPENAI_API_KEY) return fallback;
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        messages: [{ role: "system", content: system }, { role: "user", content: JSON.stringify(payload) }],
        temperature: 0.35,
        response_format: { type: "json_object" }
      })
    });
    const body = await response.json();
    return JSON.parse(body.choices?.[0]?.message?.content || "{}");
  } catch (_) {
    return fallback;
  }
}

async function recommendVendors(payload) {
  const service = clean(payload.service || payload.category, 120);
  const vendors = (await list("vendors")).filter((vendor) => {
    const services = Array.isArray(vendor.services) ? vendor.services : String(vendor.services || "").split(",");
    return services.some((item) => clean(item).toLowerCase().includes(service.toLowerCase())) || clean(vendor.category).toLowerCase().includes(service.toLowerCase());
  });
  const ranked = vendors.map((vendor) => {
    const rating = Number(vendor.rating || 4);
    const distance = Number(vendor.distanceMiles || 25);
    const commission = Number(vendor.commissionPercent || 0);
    const availabilityBoost = /same|next|today|tomorrow|3/i.test(vendor.availability || "") ? 12 : 4;
    const score = Math.round(rating * 18 - distance * 0.7 + availabilityBoost + Math.min(commission, 20) * 0.4);
    return { ...vendor, recommendationScore: score, reason: `Good service match; rating ${rating}, distance ${distance} miles, availability ${vendor.availability || "unknown"}, commission ${commission}%.` };
  }).sort((a, b) => b.recommendationScore - a.recommendationScore).slice(0, 3);
  const fallback = {
    top3: ranked,
    explanation: ranked.length ? `Recommended ${ranked[0].name} first based on service fit, rating, distance, availability, and commission.` : "No matching vendors found yet."
  };
  return openaiJson("Return JSON with top3Summary and explanation for vendor recommendations for CompHelp Service. Never use old branding.", { project: payload, vendors: ranked }, fallback);
}

function marketingIdeas(payload) {
  const service = clean(payload.service, 120);
  const city = clean(payload.city, 80) || "Los Angeles";
  return {
    competitorAngles: [`Compare response time for ${service} in ${city}.`, "Highlight free estimates, local support, and clean installation.", "Build trust with recent project galleries and real job notes."],
    contentIdeas: [`${service} checklist for ${city} homeowners`, `How much does ${service.toLowerCase()} cost in ${city}?`, `Before and after: ${service.toLowerCase()} project walkthrough`],
    socialDrafts: [`Need ${service.toLowerCase()} in ${city}? CompHelp Service offers local support and free estimates.`],
    seoPages: [`${service} ${city}`, `${service} near me`, `Best ${service.toLowerCase()} company in ${city}`]
  };
}

function smmFallback(payload) {
  const type = clean(payload.mediaType, 60) || "reel";
  const service = clean(payload.service, 120);
  const city = clean(payload.city, 80) || "Los Angeles";
  return {
    suggestedReel: "7-12 second vertical video: finished result, quick problem, clean work, CTA.",
    suggestedSlideshow: "3-5 slides: problem, process, finished result, review/CTA.",
    suggestedTikTokScript: `Show the ${service.toLowerCase()} result in ${city}, then explain one customer benefit.`,
    instagramCaption: `Completed ${service.toLowerCase()} project in ${city}. CompHelp Service helps local homes and small businesses with reliable tech service. Call for a free estimate.`,
    facebookPost: `Recent ${service} project in ${city}. Need help? CompHelp Service offers local support and free estimates.`,
    googleBusinessPost: `${service} in ${city}: CompHelp Service completed a local project and can help with similar service needs.`,
    caption: `Completed ${service.toLowerCase()} project in ${city} by CompHelp Service.`,
    hashtags: ["#CompHelpService", `#${city.replace(/\s+/g, "")}`, `#${service.replace(/[^A-Za-z0-9]/g, "")}`, "#LosAngelesCounty"],
    reelScript: ["Show final result", "Mention customer problem", "Show clean setup or repair", "End with free estimate CTA"],
    voiceover: `CompHelp Service completed this ${service.toLowerCase()} project in ${city}. Call +1 (747) 295-1440 for a free estimate.`,
    postingSchedule: [
      { platform: "Instagram", format: type === "tiktok" ? "Reel" : type, bestTime: "6:00 PM local time", autoPost: process.env.AUTO_POST === "true" },
      { platform: "Facebook", format: "Project post", bestTime: "12:00 PM local time", autoPost: process.env.AUTO_POST === "true" },
      { platform: "TikTok", format: "Short vertical video", bestTime: "7:30 PM local time", autoPost: process.env.AUTO_POST === "true" }
    ]
  };
}

async function smmPlan(payload) {
  return openaiJson("Return JSON with suggestedReel, suggestedSlideshow, suggestedTikTokScript, instagramCaption, facebookPost, googleBusinessPost, caption, hashtags, reelScript, voiceover, postingSchedule. Do not claim posts are published. Brand is CompHelp Service.", payload, smmFallback(payload));
}

function seoPlan(payload) {
  const service = clean(payload.service, 120);
  const city = clean(payload.city, 80) || "Los Angeles";
  const slug = `${service} ${city}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return {
    cityPageIdeas: [`${service} in ${city}`, `${service} near ${city}`, `${city} ${service} free estimate`],
    servicePageIdeas: [`${service} pricing`, `${service} FAQ`, `${service} work gallery`],
    blogIdeas: [`How to choose ${service.toLowerCase()} in ${city}`, `${service} cost guide for ${city}`, `Common ${service.toLowerCase()} mistakes`],
    metaTitle: `${service} ${city} | CompHelp Service`,
    metaDescription: `CompHelp Service provides ${service.toLowerCase()} for homes and small businesses in ${city}. Request a free estimate.`,
    faqIdeas: [`How much does ${service.toLowerCase()} cost?`, `Do you serve ${city}?`, "How soon can service be scheduled?"],
    internalLinks: ["/", "/security-camera-installation", "/smart-home-setup", "/wifi-network-installation", "/computer-repair", "/data-recovery"],
    proposedSlug: `/${slug}`,
    nextAction: "Review, create the page with the SEO page tool, then update sitemap.xml."
  };
}

const PUBLIC_LEAD_SOURCES = {
  "Google Maps": "https://www.google.com/maps/search/",
  Yelp: "https://www.yelp.com/search?find_desc=",
  Facebook: "https://www.facebook.com/search/pages/?q=",
  Craigslist: "https://losangeles.craigslist.org/search/sss?query=",
  Angi: "https://www.angi.com/companylist/",
  Thumbtack: "https://www.thumbtack.com/search/"
};

function sourceSearchUrl(source, query, city) {
  const base = PUBLIC_LEAD_SOURCES[source] || PUBLIC_LEAD_SOURCES["Google Maps"];
  return base + encodeURIComponent(`${query} ${city}`);
}

function leadSourceSearchPlan(payload) {
  const city = clean(payload.city || "Los Angeles", 80);
  const category = clean(payload.category || "small businesses", 120);
  const serviceNeed = clean(payload.serviceNeed || "security camera installation", 160);
  const selectedSources = clean(payload.sources, 500)
    ? clean(payload.sources, 500).split(",").map((source) => clean(source, 80)).filter(Boolean)
    : Object.keys(PUBLIC_LEAD_SOURCES);
  return selectedSources.map((source) => ({
    source,
    query: `${category} ${city}`,
    city,
    category,
    serviceNeed,
    searchUrl: sourceSearchUrl(source, category, city),
    status: "needs_approval",
    approved: false,
    notes: "Use public business listing information only. Do not scrape private personal data. Review before contact."
  }));
}

function followupPlan(payload) {
  const name = clean(payload.name || payload.customerName || "Customer", 120);
  const service = clean(payload.service || "service request", 140);
  const channel = clean(payload.channel || "sms", 40);
  const businessHours = "Send only Monday-Friday, 9:00 AM-5:30 PM local time.";
  const smsStop = channel === "sms" ? " Reply STOP to opt out." : "";
  return [
    { day: 0, label: "thank_you", channel, timing: businessHours, status: "needs_approval", message: `Hi ${name}, thanks for contacting CompHelp Service about ${service}. What day works best for a quick estimate?${smsStop}` },
    { day: 1, label: "estimate_reminder", channel, timing: businessHours, status: "needs_approval", message: `Hi ${name}, just checking if you still want a free estimate for ${service}. What city is the job in?${smsStop}` },
    { day: 3, label: "soft_follow_up", channel, timing: businessHours, status: "needs_approval", message: `Hi ${name}, no rush. Do you still need help with ${service}?${smsStop}` },
    { day: 7, label: "final_check_in", channel, timing: businessHours, status: "needs_approval", message: `Hi ${name}, final check-in from CompHelp Service. Should I close this request for now?${smsStop}` }
  ];
}

async function dispatcherPlan(payload) {
  const estimate = calculateEstimate(payload);
  const recommendation = await recommendVendors(payload);
  const topVendor = (recommendation.top3 && recommendation.top3[0]) || (recommendation.top3Summary && recommendation.top3Summary[0]) || null;
  const commissionPercent = money(payload.commissionPercent || topVendor?.commissionPercent || 10);
  const customerPrice = Math.round(estimate.recommended + estimate.recommended * (commissionPercent / 100));
  return {
    service: clean(payload.service, 120),
    customerName: clean(payload.customerName, 120),
    city: clean(payload.city || "Los Angeles", 80),
    routeType: topVendor ? "vendor_marketplace" : "direct_or_manual_review",
    selectedVendorDraft: topVendor,
    topVendors: recommendation.top3 || recommendation.top3Summary || [],
    vendorQuoteRequestDraft: `Please quote ${clean(payload.service, 120)} in ${clean(payload.city || "Los Angeles", 80)}. Scope: ${clean(payload.scope || payload.notes, 1200)}`,
    customerPrice,
    vendorExpectedPrice: estimate.recommended,
    commissionPercent,
    expectedCommission: Math.round(customerPrice - estimate.recommended),
    status: "needs_owner_approval",
    ownerApprovalRequired: true,
    recommendation: topVendor ? "Request vendor confirmation before sending final customer quote." : "No matching vendor found. Handle directly or add vendor profiles."
  };
}

async function emailEstimate(payload) {
  if (!payload.approved) return { skipped: true, reason: "Email not sent. Approval is required." };
  if (!process.env.RESEND_API_KEY || !process.env.LEAD_FROM_EMAIL) return { skipped: true, reason: "RESEND_API_KEY and LEAD_FROM_EMAIL are required." };
  const email = clean(payload.email, 180);
  if (!email) return { skipped: true, reason: "Customer email is missing." };
  const quoteUrl = `${clean(process.env.PUBLIC_SITE_URL || "https://comphelp-service.vercel.app", 240)}/api/marketplace-quote?id=${encodeURIComponent(clean(payload.estimateId, 120))}`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.LEAD_FROM_EMAIL, to: [email], subject: "Your CompHelp Service estimate", html: `<p>Your CompHelp Service estimate is ready: <a href="${quoteUrl}">${quoteUrl}</a></p>` })
  });
  return { ok: response.ok, status: response.status, quoteUrl };
}

function galleryCount() {
  return (readJson(GALLERY_FILE, DEFAULT_GALLERY).items || []).length;
}

async function readBody(req) {
  if (typeof req.body === "object" && req.body) return req.body;
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString("utf8");
  return JSON.parse(text || "{}");
}

async function dashboard(req) {
  const seed = readSeed();
  const role = resolveRole(req);
  const dbConnected = supabaseConfigured();
  if (!role) {
    return {
      ok: true,
      requiresAdmin: true,
      role: "public",
      warnings: dbConnected ? [] : ["Database not connected"],
      config: { services: seed.services, vendorCategories: seed.vendorCategories, estimateRules: seed.estimateRules },
      summary: { leads: 0, vendors: seed.vendors?.length || 0, projects: 0, openProjects: 0, revenue: 0, expectedCommission: 0, publishedGalleryItems: galleryCount(), smmDrafts: 0, conversionRate: 0 },
      recentLeads: [],
      topVendors: (seed.vendors || []).slice(0, 3),
      vendors: seed.vendors || [],
      projects: []
    };
  }
  const [leads, vendors, commissions, projects, mediaReviews, sourceLeads, dispatches, followUps] = await Promise.all([
    list("leads"),
    list("vendors"),
    list("commissions"),
    list("projects"),
    list("mediaReviews"),
    list("sourceLeads"),
    list("dispatches"),
    list("followUps")
  ]);
  const revenue = commissions.reduce((sum, item) => sum + money(item.revenue || item.projectValue), 0);
  const expectedCommission = commissions.reduce((sum, item) => sum + money(item.expectedCommission || item.expected_commission), 0);
  const openProjects = projects.filter((project) => !["completed", "cancelled", "closed"].includes(clean(project.status, 40))).length;
  return {
    ok: true,
    role,
    warnings: dbConnected ? [] : ["Database not connected"],
    config: { services: seed.services, vendorCategories: seed.vendorCategories, estimateRules: seed.estimateRules },
    summary: {
      leads: leads.length,
      sourceLeads: sourceLeads.length,
      vendors: vendors.length,
      projects: projects.length,
      openProjects,
      dispatches: dispatches.length,
      followUps: followUps.length,
      revenue: Math.round(revenue),
      expectedCommission: Math.round(expectedCommission),
      publishedGalleryItems: galleryCount(),
      smmDrafts: mediaReviews.length,
      conversionRate: leads.length ? Math.round((projects.length / leads.length) * 100) : 0,
      vendorPerformance: vendors.slice().sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0)).slice(0, 5),
      marketingPerformance: { smmDrafts: mediaReviews.length, seoPlans: (await list("marketingIdeas")).length }
    },
    recentLeads: leads.slice(0, 8),
    topVendors: vendors.slice().sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0)).slice(0, 8),
    vendors,
    projects: projects.slice(0, 12)
  };
}

function vendorPayload(payload) {
  return {
    name: clean(payload.name, 140),
    category: clean(payload.category, 80),
    services: [clean(payload.category, 80), clean(payload.service, 120)].filter(Boolean),
    phone: clean(payload.phone, 80),
    email: clean(payload.email, 180),
    website: clean(payload.website, 240),
    serviceArea: clean(payload.serviceArea, 240),
    city: clean(payload.serviceArea, 80),
    rating: Math.min(5, Math.max(1, Number(payload.rating || 4))),
    availability: clean(payload.availability, 120),
    commissionPercent: money(payload.commissionPercent),
    notes: clean(payload.notes, 1200),
    status: clean(payload.status, 80) || "active",
    contact: clean(payload.email || payload.phone, 180)
  };
}

async function handleAction(action, payload) {
  if (action === "leadSourceSearch") {
    const plans = leadSourceSearchPlan(payload);
    const saved = [];
    for (const plan of plans) saved.push(await insert("sourceLeads", plan));
    return {
      ok: true,
      sourceLeads: saved,
      note: "Lead source searches were saved for review. No scraping or contact was performed."
    };
  }
  if (action === "lead") {
    const lead = { name: clean(payload.name, 120), phone: clean(payload.phone, 60), email: clean(payload.email, 160), address: clean(payload.address, 300), service: clean(payload.service, 120), notes: clean(payload.notes || payload.message, 1500), message: clean(payload.notes || payload.message, 1500), status: clean(payload.status, 80) || "new", preferredDate: clean(payload.preferredDate, 60), qualification: qualification(payload.service, payload.notes || payload.message), source: "marketplace_manager" };
    const saved = await insert("leads", lead);
    return { ok: true, lead: saved, hubspot: await createHubSpotContact(lead), n8n: await callWebhook("N8N_LEAD_WEBHOOK_URL", { lead }) };
  }
  if (action === "estimate") {
    const estimate = calculateEstimate(payload);
    const saved = await insert("estimates", estimate);
    return { ok: true, estimate: saved, quoteUrl: `/api/marketplace-quote?id=${encodeURIComponent(saved.id || estimate.id)}` };
  }
  if (action === "emailEstimate") return { ok: true, email: await emailEstimate(payload) };
  if (action === "vendorSearch") {
    const vendor = await insert("vendors", { ...vendorPayload(payload), source: "vendor_finder", status: "needs_approval" });
    return { ok: true, vendor, note: "Vendor profile saved for approval and ranking." };
  }
  if (action === "vendor") return { ok: true, vendor: await insert("vendors", vendorPayload(payload)) };
  if (action === "vendorUpdate") return { ok: true, vendor: await updateRecord("vendors", clean(payload.id, 120), vendorPayload(payload)) };
  if (action === "vendorDelete") return { ok: true, vendor: await deleteRecord("vendors", clean(payload.id, 120)) };
  if (action === "quoteRequest") {
    const recommendation = await recommendVendors(payload);
    const request = { leadId: clean(payload.leadId, 120), projectId: clean(payload.projectId, 120), service: clean(payload.service, 120), category: clean(payload.category, 80), city: clean(payload.city, 80), scope: clean(payload.scope, 1600), status: "draft", vendorResponses: [], vendorOptions: recommendation.top3 || recommendation.top3Summary || [] };
    const saved = await insert("quoteRequests", request);
    const n8n = payload.approved ? await callWebhook("N8N_VENDOR_QUOTE_WEBHOOK_URL", { request: saved }) : { skipped: true, reason: "Approval required before sending." };
    return { ok: true, quoteRequest: saved, comparison: recommendation, n8n };
  }
  if (action === "vendorResponse") {
    const response = { vendorName: clean(payload.vendorName, 140), price: money(payload.price), availability: clean(payload.availability, 120), notes: clean(payload.notes, 1200), receivedAt: new Date().toISOString() };
    return { ok: true, response };
  }
  if (action === "dispatcher") {
    const plan = await dispatcherPlan(payload);
    const saved = await insert("dispatches", plan);
    const quoteRequest = await insert("quoteRequests", {
      service: plan.service,
      city: plan.city,
      scope: clean(payload.scope || payload.notes, 1600),
      status: "draft",
      vendorResponses: [],
      vendorOptions: plan.topVendors
    });
    return { ok: true, dispatch: saved, quoteRequest, plan };
  }
  if (action === "recommendation") return { ok: true, recommendation: await recommendVendors(payload) };
  if (action === "commission") {
    const projectValue = money(payload.projectValue || payload.revenue);
    const rate = money(payload.commissionPercent || payload.commissionRate);
    const commission = { projectValue, vendorSelected: clean(payload.vendorSelected || payload.vendorName, 140), commissionPercent: rate, expectedCommission: Math.round(projectValue * (rate / 100)), paidCommission: money(payload.paidCommission), paymentStatus: clean(payload.paymentStatus || payload.status, 80), followUpDate: clean(payload.followUpDate, 60), jobName: clean(payload.jobName, 140), revenue: projectValue, status: clean(payload.paymentStatus || payload.status, 80) };
    return { ok: true, commission: await insert("commissions", commission) };
  }
  if (action === "marketing") return { ok: true, marketing: await insert("marketingIdeas", { ...payload, ideas: marketingIdeas(payload) }), ideas: marketingIdeas(payload) };
  if (action === "seo") {
    const plan = seoPlan(payload);
    return { ok: true, seo: await insert("marketingIdeas", { ...payload, type: "seo", ideas: plan }), plan };
  }
  if (action === "smm") {
    const plan = await smmPlan(payload);
    return { ok: true, mediaReview: await insert("mediaReviews", { ...payload, plan, status: process.env.AUTO_POST === "true" ? "ready_for_auto_post_review" : "draft" }), plan, autoPost: process.env.AUTO_POST === "true" };
  }
  if (action === "followupPlan") {
    const plan = followupPlan(payload);
    const saved = [];
    for (const item of plan) saved.push(await insert("followUps", { ...item, customerName: clean(payload.name || payload.customerName, 120), service: clean(payload.service, 120), recipient: clean(payload.phone || payload.email, 180) }));
    return { ok: true, followUps: saved, note: "Follow-up drafts saved. Sending still requires approval and business-hours checks." };
  }
  if (action === "project") {
    const project = { customerName: clean(payload.customerName, 120), service: clean(payload.service, 120), title: clean(payload.title, 160), city: clean(payload.city, 80), status: clean(payload.status, 80), completionDate: clean(payload.completionDate, 60), followUpDate: clean(payload.followUpDate, 60), beforeAfterNotes: clean(payload.beforeAfterNotes, 1000), customerReview: clean(payload.customerReview, 1200), notes: clean(payload.notes, 1500), reminders: [payload.followUpDate ? `Follow up on ${payload.followUpDate}.` : "Set follow-up date.", "Confirm customer has estimate and next step.", "Send review request only after completed work and approval."] };
    const saved = await insert("projects", project);
    return { ok: true, project: saved, vapi: await callWebhook("VAPI_PROJECT_WEBHOOK_URL", { project: saved }) };
  }
  throw new Error("Unknown marketplace action.");
}

const PERMISSIONS = {
  admin: ["leadSourceSearch", "lead", "estimate", "emailEstimate", "vendorSearch", "vendor", "vendorUpdate", "vendorDelete", "quoteRequest", "vendorResponse", "dispatcher", "recommendation", "commission", "marketing", "seo", "smm", "followupPlan", "project"],
  manager: ["leadSourceSearch", "lead", "estimate", "vendorSearch", "vendor", "vendorUpdate", "quoteRequest", "dispatcher", "recommendation", "marketing", "seo", "smm", "followupPlan", "project"],
  viewer: ["recommendation"]
};

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") return sendJson(res, 204, {});
  try {
    if (req.method === "GET") {
      try {
        return sendJson(res, 200, await dashboard(req));
      } catch (error) {
        logError("handler:GET:dashboard", error);
        return sendJson(res, 500, { ok: false, error: "server_error", message: clean(error.message || "Dashboard request failed.", 500), where: "handler:GET:dashboard" });
      }
    }
    if (req.method !== "POST") return sendJson(res, 405, { ok: false, error: "method_not_allowed", message: "Method not allowed.", where: "handler:method" });
    let body;
    try {
      body = await readBody(req);
    } catch (error) {
      logError("handler:POST:parseBody", error);
      return sendJson(res, 400, { ok: false, error: "invalid_json", message: clean(error.message || "Invalid JSON body.", 500), where: "handler:POST:parseBody" });
    }
    const action = clean(body.action, 80);
    if (action === "login") {
      try {
        const login = loginStatus(req);
        return sendJson(res, login.ok ? 200 : login.status, login.ok ? { ok: true, role: login.role } : { ok: false, error: login.error, where: "handler:POST:login" });
      } catch (error) {
        logError("handler:POST:login", error);
        return sendJson(res, 500, { ok: false, error: "server_error", message: clean(error.message || "Login failed.", 500), where: "handler:POST:login" });
      }
    }
    const roleCheck = requireRole(req, ["admin", "manager", "viewer"]);
    if (!roleCheck.ok) return sendJson(res, roleCheck.status, { ok: false, error: roleCheck.error, where: "handler:POST:requireRole" });
    if (!PERMISSIONS[roleCheck.role].includes(action)) return sendJson(res, 403, { ok: false, error: "Role does not have permission for this action.", where: "handler:POST:permission" });
    try {
      return sendJson(res, 200, await handleAction(action, body.payload || {}));
    } catch (error) {
      logError(`handler:POST:action:${action || "missing"}`, error);
      return sendJson(res, 500, { ok: false, error: "server_error", message: clean(error.message || "Marketplace action failed.", 500), where: `handler:POST:action:${action || "missing"}` });
    }
  } catch (error) {
    logError("handler:top", error);
    return sendJson(res, 500, { ok: false, error: "server_error", message: clean(error.message || "Marketplace request failed.", 500), where: "handler:top" });
  }
};
