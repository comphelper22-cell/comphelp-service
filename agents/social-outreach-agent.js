const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const QUEUE_FILE = path.join(ROOT, "data", "social-outreach-queue.json");
const LEADS_FILE = path.join(ROOT, "data", "social-leads.json");
const DAILY_LIMIT = Number(process.env.SOCIAL_OUTREACH_DAILY_LIMIT || 10);

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

function today() {
  return new Date().toISOString().slice(0, 10);
}

function messagesSentToday() {
  const queue = readJson(QUEUE_FILE, { version: 1, paused: true, items: [] });
  return (queue.items || []).filter((item) => item.status === "sent" && String(item.sentAt || item.createdAt || "").startsWith(today())).length;
}

function draftsCreatedToday() {
  const queue = readJson(QUEUE_FILE, { version: 1, paused: true, items: [] });
  return (queue.items || []).filter((item) => String(item.createdAt || "").startsWith(today())).length;
}

function draftForLead(lead = {}) {
  const platform = clean(lead.platform || "Instagram", 40);
  const city = clean(lead.city || "LA", 80);
  const need = clean(lead.possibleServiceNeed || "security camera and WiFi installation", 160);
  if (platform === "TikTok") {
    return `Nice setup. If you ever need camera or WiFi help for your business in ${city}, CompHelp Service can help.`;
  }
  return `Hi, I saw your business page. We help local ${city} businesses with ${need}. Would you like a free estimate?`;
}

function validateDraft(input = {}) {
  const queue = readJson(QUEUE_FILE, { version: 1, paused: true, items: [] });
  const body = clean(input.body, 500);
  const recipient = clean(input.profileUrl || input.profileName, 300).toLowerCase();
  const errors = [];
  if (!recipient) errors.push("Profile URL or profile name is required.");
  if (!body) errors.push("Draft body is required.");
  if (draftsCreatedToday() >= DAILY_LIMIT) errors.push("Daily social outreach draft limit reached.");
  if (/\bguaranteed\b|\blimited time only\b|\bact now\b/i.test(body)) errors.push("Draft contains spammy or overpromising wording.");
  if ((queue.items || []).some((item) => clean(item.profileUrl || item.profileName, 300).toLowerCase() === recipient && clean(item.body, 500).toLowerCase() === body.toLowerCase())) {
    errors.push("Duplicate draft already exists.");
  }
  return { ok: errors.length === 0, errors, dailyLimit: DAILY_LIMIT, sentToday: messagesSentToday(), draftsToday: draftsCreatedToday() };
}

function createOutreachDraft(input = {}) {
  const lead = input.lead || input;
  const body = clean(input.body || draftForLead(lead), 500);
  const safety = validateDraft({ ...lead, body });
  const queue = readJson(QUEUE_FILE, { version: 1, paused: true, items: [] });
  if (!safety.ok) {
    const error = new Error(safety.errors.join(" "));
    error.code = "social_draft_rejected";
    throw error;
  }
  const item = {
    id: id("social_draft"),
    platform: clean(lead.platform || "Instagram", 40),
    profileName: clean(lead.profileName, 160),
    profileUrl: clean(lead.profileUrl, 300),
    body,
    status: "needs_approval",
    approved: false,
    safety,
    dailyLimit: DAILY_LIMIT,
    sentToday: messagesSentToday(),
    draftsToday: draftsCreatedToday() + 1,
    note: "Draft only. Do not auto-DM. Owner approval required.",
    createdAt: new Date().toISOString()
  };
  queue.items = Array.isArray(queue.items) ? queue.items : [];
  queue.items.unshift(item);
  writeJson(QUEUE_FILE, queue);
  return item;
}

function summary() {
  const leads = readJson(LEADS_FILE, { version: 1, items: [] });
  const queue = readJson(QUEUE_FILE, { version: 1, paused: true, items: [] });
  return {
    dailyLimit: DAILY_LIMIT,
    sentToday: messagesSentToday(),
    draftsToday: draftsCreatedToday(),
    paused: queue.paused !== false,
    instagramLeads: (leads.items || []).filter((item) => item.platform === "Instagram").length,
    tiktokLeads: (leads.items || []).filter((item) => item.platform === "TikTok").length,
    pendingDrafts: (queue.items || []).filter((item) => item.status === "needs_approval" || item.status === "draft").length,
    leads: (leads.items || []).slice(0, 50),
    drafts: (queue.items || []).slice(0, 50)
  };
}

function pause(paused = true) {
  const queue = readJson(QUEUE_FILE, { version: 1, paused: true, items: [] });
  queue.paused = Boolean(paused);
  return writeJson(QUEUE_FILE, queue);
}

function main() {
  console.log(JSON.stringify(summary(), null, 2));
}

if (require.main === module) main();

module.exports = { createOutreachDraft, draftForLead, validateDraft, summary, pause };
