const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const safeStorage = require("../storage/safe-storage");

const DATA_FILE = path.join(process.cwd(), "data", "marketplace.json");
const GALLERY_FILE = path.join(process.cwd(), "data", "gallery.json");

const AUTOMATION_LOG_FILE = path.join(process.cwd(), "logs", "automation.jsonl");

const CRM_STAGES = ["New Lead", "Contacted", "Quote Sent", "Follow-up", "Won", "Lost"];
const CRM_STAGE_KEYS = {
  "new lead": "New Lead",
  new: "New Lead",
  contacted: "Contacted",
  "quote sent": "Quote Sent",
  quote_sent: "Quote Sent",
  estimate_sent: "Quote Sent",
  "follow-up": "Follow-up",
  follow_up: "Follow-up",
  followup: "Follow-up",
  won: "Won",
  lost: "Lost"
};
const DEFAULT_MARKETPLACE = {
  version: 1,
  business: {
    name: "CompHelp Service",
    phone: "+1 (747) 295-1440",
    email: "comphelper22@gmail.com",
    serviceAreas: ["Los Angeles", "Burbank", "Glendale", "North Hollywood", "Studio City"]
  },
  services: ["Security Camera Installation", "Smart Home Setup", "WiFi & Network Installation", "Computer Repair", "Data Recovery"],
  crmStages: CRM_STAGES,
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
  customers: [],
  jobs: [],
  jobTimeline: [],
  jobAssignments: [],
  estimates: [],
  invoices: [],
  payments: [],
  quoteRequests: [],
  commissions: [],
  projects: [],
  marketingIdeas: [],
  mediaReviews: [],
  sourceLeads: [],
  dispatches: [],
  followUps: [],
  customerNotes: [],
  customerTimeline: [],
  technicians: [],
  messageQueue: [],
  optOuts: [],
  activityLogs: [],
  deploymentRuns: []
};
const DEFAULT_GALLERY = { version: 1, items: [] };
const TABLES = {
  leads: "marketplace_leads",
  vendors: "marketplace_vendors",
  customers: "marketplace_customers",
  jobs: "marketplace_jobs",
  estimates: "marketplace_estimates",
  invoices: "marketplace_invoices",
  payments: "marketplace_payments",
  quoteRequests: "marketplace_quote_requests",
  commissions: "marketplace_commissions",
  projects: "marketplace_projects",
  marketingIdeas: "marketplace_marketing_ideas",
  mediaReviews: "marketplace_media_reviews",
  sourceLeads: "marketplace_source_leads",
  dispatches: "marketplace_dispatches",
  followUps: "marketplace_followups",
  messageQueue: "marketplace_message_queue",
  optOuts: "marketplace_opt_outs",
  activityLogs: "marketplace_activity_logs"
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

function normalizeLeadStatus(value) {
  const raw = clean(value, 80);
  const key = raw.toLowerCase().replace(/\s+/g, " ");
  return CRM_STAGE_KEYS[key] || CRM_STAGE_KEYS[key.replace(/\s+/g, "_")] || "New Lead";
}

function crmSummary(leads = []) {
  const counts = CRM_STAGES.reduce((acc, stage) => {
    acc[stage] = 0;
    return acc;
  }, {});
  leads.forEach((lead) => {
    counts[normalizeLeadStatus(lead.status)] += 1;
  });
  return {
    stages: CRM_STAGES,
    totalLeads: leads.length,
    newLeads: counts["New Lead"],
    contacted: counts.Contacted,
    quoteSent: counts["Quote Sent"],
    followUp: counts["Follow-up"],
    won: counts.Won,
    lost: counts.Lost,
    counts
  };
}

function leadPayload(payload) {
  const notes = clean(payload.notes || payload.message, 1500);
  return {
    name: clean(payload.name, 120),
    phone: clean(payload.phone, 60),
    email: clean(payload.email, 160),
    instagram: clean(payload.instagram || payload.Instagram, 240),
    tiktok: clean(payload.tiktok || payload.TikTok, 240),
    address: clean(payload.address, 300),
    source: clean(payload.source || "marketplace_manager", 120),
    service: clean(payload.service, 120),
    city: clean(payload.city, 80),
    notes,
    message: notes,
    status: normalizeLeadStatus(payload.status),
    preferredDate: clean(payload.preferredDate, 60),
    qualification: qualification(payload.service, notes)
  };
}

async function intakeWebsiteLead(payload = {}) {
  const record = {
    ...leadPayload({ ...payload, status: "new", source: payload.source || "website_form" }),
    serviceArea: clean(payload.serviceArea || payload.city, 120),
    pageUrl: clean(payload.pageUrl || payload.page_url, 500),
    timeline: clean(payload.timeline, 120),
    utmSource: clean(payload.utmSource, 120),
    utmMedium: clean(payload.utmMedium, 120),
    utmCampaign: clean(payload.utmCampaign, 160),
    gclid: clean(payload.gclid, 200),
    fbclid: clean(payload.fbclid, 200),
    submittedAt: clean(payload.submittedAt || payload.timestamp, 80) || new Date().toISOString()
  };
  if (!record.name || !record.phone || !record.service) {
    throw new Error("Website lead is missing required Marketplace fields.");
  }
  const saved = await insert("leads", record);
  await logActivity("website_lead_created", `Website lead created for ${saved.service}.`, {
    leadId: saved.id,
    source: saved.source,
    pageUrl: saved.pageUrl
  });
  return saved;
}

function money(value) {
  return Math.max(0, Number(value || 0));
}

function estimateUnits(payload) {
  return Math.max(1, Number(payload.units || payload.quantity || payload.numberOfCamerasDevices || payload.camerasDevices || payload.deviceCount || payload.cameraCount || 1));
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

function readJsonLines(file, limit = 20) {
  try {
    return fs.readFileSync(file, "utf8")
      .split(/\r?\n/)
      .filter(Boolean)
      .slice(-limit)
      .map((line) => JSON.parse(line));
  } catch (_) {
    return [];
  }
}

function writeJson(file, data) {
  return safeStorage.writeJson(file, data);
}

function tryWriteJson(file, data) {
  try {
    const written = writeJson(file, data);
    return { ok: true, warnings: written.warnings || [] };
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
    crmStages: Array.isArray(seed.crmStages) && seed.crmStages.length ? seed.crmStages : DEFAULT_MARKETPLACE.crmStages,
    vendorCategories: Array.isArray(seed.vendorCategories) && seed.vendorCategories.length ? seed.vendorCategories : DEFAULT_MARKETPLACE.vendorCategories,
    vendors: Array.isArray(seed.vendors) ? seed.vendors : [],
    leads: Array.isArray(seed.leads) ? seed.leads : [],
    customers: Array.isArray(seed.customers) ? seed.customers : [],
    customerNotes: Array.isArray(seed.customerNotes) ? seed.customerNotes : [],
    customerTimeline: Array.isArray(seed.customerTimeline) ? seed.customerTimeline : [],
    jobs: Array.isArray(seed.jobs) ? seed.jobs : [],
    jobTimeline: Array.isArray(seed.jobTimeline) ? seed.jobTimeline : [],
    jobAssignments: Array.isArray(seed.jobAssignments) ? seed.jobAssignments : [],
    estimates: Array.isArray(seed.estimates) ? seed.estimates : [],
    invoices: Array.isArray(seed.invoices) ? seed.invoices : [],
    payments: Array.isArray(seed.payments) ? seed.payments : [],
    quoteRequests: Array.isArray(seed.quoteRequests) ? seed.quoteRequests : [],
    commissions: Array.isArray(seed.commissions) ? seed.commissions : [],
    projects: Array.isArray(seed.projects) ? seed.projects : [],
    marketingIdeas: Array.isArray(seed.marketingIdeas) ? seed.marketingIdeas : [],
    mediaReviews: Array.isArray(seed.mediaReviews) ? seed.mediaReviews : [],
    sourceLeads: Array.isArray(seed.sourceLeads) ? seed.sourceLeads : [],
    dispatches: Array.isArray(seed.dispatches) ? seed.dispatches : [],
    followUps: Array.isArray(seed.followUps) ? seed.followUps : [],
    technicians: Array.isArray(seed.technicians) ? seed.technicians : [],
    messageQueue: Array.isArray(seed.messageQueue) ? seed.messageQueue : [],
    optOuts: Array.isArray(seed.optOuts) ? seed.optOuts : [],
    activityLogs: Array.isArray(seed.activityLogs) ? seed.activityLogs : [],
    deploymentRuns: Array.isArray(seed.deploymentRuns) ? seed.deploymentRuns : []
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
  if (!hasConfiguredSecret && process.env.MARKETPLACE_DEMO_MODE === "true") {
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
  if (role) return { ok: true, role, demoMode: !hasAnyRoleSecretConfigured() && process.env.MARKETPLACE_DEMO_MODE === "true" };
  return { ok: false, status: 401, error: "Invalid code" };
}

function requireRole(req, allowed) {
  const role = resolveRole(req);
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

function normalizeRecipient(value) {
  return clean(value, 180).toLowerCase().replace(/\s+/g, "");
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function humanDelayMinutes(index = 0) {
  return 12 + ((index * 17 + Math.floor(Math.random() * 29)) % 76);
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

async function logActivity(type, message, metadata = {}) {
  const record = {
    type: clean(type, 80),
    message: clean(message, 1000),
    metadata,
    actor: clean(metadata.actor || "system", 120),
    status: clean(metadata.status || "logged", 80)
  };
  try {
    return await insert("activityLogs", record);
  } catch (error) {
    logError(`activity:${type}`, error);
    return { ...record, storage: "failed" };
  }
}

async function queueSafety(input = {}) {
  const recipient = normalizeRecipient(input.recipient || input.phone || input.email);
  const body = clean(input.body || input.message, 2000);
  const kind = clean(input.kind || "outreach", 50);
  const channel = clean(input.channel || "draft", 40);
  const approved = input.approved === true || input.approved === "true";
  const dailyLimit = kind === "followup" ? Number(process.env.FOLLOWUP_DAILY_LIMIT || 20) : Number(process.env.OUTREACH_DAILY_LIMIT || 10);
  const [queue, optOuts] = await Promise.all([list("messageQueue"), list("optOuts")]);
  const errors = [];
  const day = todayKey();
  const sentToday = queue.filter((item) => {
    return clean(item.kind, 50) === kind && clean(item.status, 50) === "sent" && clean(item.sentAt || item.sent_at || item.createdAt || item.created_at, 40).startsWith(day);
  }).length;
  const recentCutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const contactedRecently = queue.some((item) => {
    const itemRecipient = normalizeRecipient(item.recipient);
    const time = Date.parse(item.sentAt || item.sent_at || item.createdAt || item.created_at || "");
    return itemRecipient && itemRecipient === recipient && time && time >= recentCutoff && clean(item.status, 50) !== "replied";
  });
  const duplicate = queue.some((item) => {
    return normalizeRecipient(item.recipient) === recipient && clean(item.body, 2000).toLowerCase() === body.toLowerCase() && !["failed", "cancelled"].includes(clean(item.status, 50));
  });
  const optedOut = optOuts.some((item) => normalizeRecipient(item.recipient) === recipient);
  if (!recipient) errors.push("Recipient is required.");
  if (!body) errors.push("Message body is required.");
  if (optedOut) errors.push("Recipient is opted out.");
  if (duplicate) errors.push("Duplicate message already exists.");
  if (contactedRecently && !input.replied) errors.push("Recipient was contacted within 7 days.");
  if (sentToday >= dailyLimit) errors.push(`Daily ${kind} limit reached.`);
  if (input.cold !== false && !approved) errors.push("Cold outreach requires approval.");
  if (/\bguaranteed\b|\blimited time only\b|\bact now\b/i.test(body)) errors.push("Message contains risky promotional wording.");
  return { ok: errors.length === 0, errors, dailyLimit, sentToday, channel, kind, recipient, body, approved };
}

async function queueMessage(payload = {}) {
  const safety = await queueSafety(payload);
  const queue = await list("messageQueue");
  const paused = process.env.OUTREACH_PAUSED !== "false" || payload.paused === true;
  const status = safety.ok && !paused ? "queued" : "needs_approval";
  const body = safety.channel === "sms" && !/stop to opt out/i.test(safety.body)
    ? `${safety.body} Reply STOP to opt out.`
    : safety.body;
  const record = {
    kind: safety.kind,
    channel: safety.channel,
    recipient: safety.recipient,
    body,
    status,
    approved: safety.approved,
    safety,
    sendAfter: new Date(Date.now() + humanDelayMinutes(queue.length) * 60 * 1000).toISOString(),
    source: clean(payload.source || "marketplace", 80)
  };
  const saved = await insert("messageQueue", record);
  await logActivity("message_queue", `Message ${status} for ${safety.channel}.`, { status, recipient: safety.recipient, kind: safety.kind });
  return saved;
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

function estimateFallback(payload) {
  const rules = readSeed().estimateRules?.[payload.service] || { base: 99, perUnit: 50, unit: "unit" };
  const units = estimateUnits(payload);
  const laborHours = Math.max(0, Number(payload.laborHours || 0));
  const materialEstimate = money(payload.materialEstimate || payload.materialCost);
  const laborCost = money(payload.laborCost || laborHours * 45);
  const profitMargin = Math.min(80, Math.max(0, Number(payload.profitMargin || 30)));
  const commissionPercent = Math.min(60, Math.max(0, Number(payload.commissionPercent || 10)));
  const urgencyMultiplier = /same|urgent|today|emergency/i.test(payload.urgency || "") ? 1.25 : 1;
  const jobSize = clean(payload.jobSize || payload.size, 120) || (units > 1 ? `${units} ${rules.unit || "units"}` : "Small job");
  const sizeMultiplier = /large|multi|commercial|warehouse|office|restaurant/i.test(jobSize) ? 1.18 : /small|simple|basic/i.test(jobSize) ? 0.95 : 1;
  const baseLow = (rules.base + Math.max(0, units - 1) * rules.perUnit + laborHours * 65 + materialEstimate) * sizeMultiplier;
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
    jobSize,
    propertyType: clean(payload.propertyType, 120),
    units,
    unitLabel: rules.unit,
    numberOfCamerasDevices: units,
    laborHours,
    laborCost,
    materialEstimate,
    materialCost: materialEstimate,
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
    customerQuoteText: `Based on the details provided, your ${clean(payload.service, 120).toLowerCase()} estimate in ${clean(payload.city, 80) || "Los Angeles"} is approximately $${low} - $${high}. A recommended planning number is $${recommended}. Final pricing depends on site conditions, equipment, access, and final scope.`,
    internalNotes: `Units: ${units}; labor hours: ${laborHours}; labor cost: $${laborCost}; materials: $${materialEstimate}; profit target: ${profitMargin}%; commission: ${commissionPercent}%; urgency: ${clean(payload.urgency, 100) || "standard"}.`,
    notes: clean(payload.notes, 1500),
    disclaimer: "Final pricing depends on site conditions, equipment, wiring, access, urgency, and vendor availability.",
    createdAt: new Date().toISOString()
  };
}

async function calculateEstimate(payload) {
  const fallback = estimateFallback(payload);
  const ai = await openaiJson(
    "Return JSON for a CompHelp Service estimate with customerQuoteText and internalNotes only. Be concise, professional, and do not invent site facts. Keep prices from the provided estimate.",
    { input: payload, estimate: fallback },
    {}
  );
  return {
    ...fallback,
    customerQuoteText: clean(ai.customerQuoteText, 1500) || fallback.customerQuoteText,
    internalNotes: clean(ai.internalNotes, 1500) || fallback.internalNotes,
    aiEnhanced: Boolean(ai.customerQuoteText || ai.internalNotes)
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
  const city = clean(payload.city, 80).toLowerCase();
  const vendors = (await list("vendors")).filter((vendor) => {
    const services = Array.isArray(vendor.services) ? vendor.services : String(vendor.services || "").split(",");
    const serviceMatch = services.some((item) => clean(item).toLowerCase().includes(service.toLowerCase())) || clean(vendor.category).toLowerCase().includes(service.toLowerCase());
    const status = clean(vendor.status || "active", 80).toLowerCase();
    const cityMatch = !city || clean(vendor.city, 80).toLowerCase().includes(city) || clean(vendor.serviceArea || vendor.service_area, 240).toLowerCase().includes(city);
    return serviceMatch && cityMatch && !["inactive", "paused", "blocked"].includes(status);
  });
  const ranked = vendors.map((vendor) => {
    const rating = Number(vendor.rating || 4);
    const distance = Number(vendor.distanceMiles || 25);
    const commission = Number(vendor.commissionPercent || 0);
    const availabilityBoost = /same|next|today|tomorrow|3/i.test(vendor.availability || "") ? 12 : 4;
    const cityBoost = city && clean(vendor.city, 80).toLowerCase().includes(city) ? 10 : 0;
    const score = Math.round(rating * 18 - distance * 0.7 + availabilityBoost + cityBoost + Math.min(commission, 20) * 0.4);
    return { ...vendor, recommendationScore: score, reason: `Service match; rating ${rating}, distance ${distance} miles, availability ${vendor.availability || "unknown"}, commission ${commission}%, city fit ${cityBoost ? "strong" : "service-area"}.` };
  }).sort((a, b) => b.recommendationScore - a.recommendationScore).slice(0, 3);
  const fallback = {
    top3: ranked,
    explanation: ranked.length ? `Recommended ${ranked[0].name} first based on service fit, rating, distance, availability, and commission.` : "No matching vendors found yet."
  };
  return openaiJson("Return JSON with top3Summary and explanation for vendor recommendations for CompHelp Service. Never use old branding.", { project: payload, vendors: ranked }, fallback);
}

async function vendorProjectMatch(payload) {
  const recommendation = await recommendVendors(payload);
  const topVendors = recommendation.top3 || recommendation.top3Summary || [];
  const selected = topVendors[0] || null;
  const projectValue = money(payload.projectValue || payload.budget || payload.customerPrice);
  const commissionPercent = money(payload.commissionPercent || selected?.commissionPercent || 10);
  const expectedCommission = Math.round(projectValue * (commissionPercent / 100));
  return {
    service: clean(payload.service, 120),
    city: clean(payload.city || "Los Angeles", 80),
    projectValue,
    selectedVendor: selected,
    topVendors,
    quoteRequestDraft: selected ? `Hi ${selected.name}, can you quote this ${clean(payload.service, 120)} project in ${clean(payload.city || "Los Angeles", 80)}? Scope: ${clean(payload.scope || payload.notes, 1000)}` : "No matching vendor found. Add or approve vendors before sending a quote request.",
    commissionDraft: {
      vendorSelected: selected?.name || "",
      projectValue,
      commissionPercent,
      expectedCommission,
      paymentStatus: "expected",
      status: "expected"
    },
    ownerApprovalRequired: true,
    status: "draft"
  };
}

function marketingIdeas(payload) {
  const service = clean(payload.service, 120);
  const city = clean(payload.city, 80) || "Los Angeles";
  return {
    competitorAngles: [`Compare response time for ${service} in ${city}.`, "Highlight free estimates, local support, and clean installation.", "Build trust with recent project galleries and real job notes."],
    contentIdeas: [`${service} checklist for ${city} homeowners`, `How much does ${service.toLowerCase()} cost in ${city}?`, `Before and after: ${service.toLowerCase()} project walkthrough`],
    facebookPost: `Need ${service.toLowerCase()} in ${city}? CompHelp Service helps local homes and small businesses with clear estimates and professional support.`,
    instagramPost: `Recent ${service.toLowerCase()} work in ${city}. Clean setup, local support, and free estimate requests available.`,
    reelsIdeas: ["Before/after walkthrough", "Common problem and fix", "Finished project reveal", "One-minute buying tip"],
    reelScript: `Open with the finished ${service.toLowerCase()} result, show one problem detail, explain the customer benefit, and close with a free estimate CTA.`,
    voiceover: `CompHelp Service helps ${city} customers with ${service.toLowerCase()} and reliable local support.`,
    hashtags: ["#CompHelpService", `#${city.replace(/\s+/g, "")}`, `#${service.replace(/[^A-Za-z0-9]/g, "")}`, "#LosAngelesCounty"],
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
    ],
    weeklyContentCalendar: [
      { day: "Monday", idea: `${service} tip for ${city} customers`, format: "short educational post" },
      { day: "Tuesday", idea: "Recent project highlight", format: "before/after carousel" },
      { day: "Wednesday", idea: "Common mistake to avoid", format: "reel" },
      { day: "Thursday", idea: "Customer FAQ answer", format: "story or post" },
      { day: "Friday", idea: "Weekend free estimate reminder", format: "Facebook and Instagram post" }
    ],
    schedulingRecommendations: ["Use drafts first.", "Post during local business hours or early evening.", "Do not auto-post unless AUTO_POST=true.", "Review captions for customer privacy before publishing."]
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
    keywordSuggestions: [`${service} ${city}`, `${service} near me`, `${city} ${service} cost`, `${service} free estimate`, `local ${service.toLowerCase()} company`],
    metaTitle: `${service} ${city} | CompHelp Service`,
    metaDescription: `CompHelp Service provides ${service.toLowerCase()} for homes and small businesses in ${city}. Request a free estimate.`,
    faqIdeas: [`How much does ${service.toLowerCase()} cost?`, `Do you serve ${city}?`, "How soon can service be scheduled?"],
    internalLinks: ["/", "/security-camera-installation", "/smart-home-setup", "/wifi-network-installation", "/computer-repair", "/data-recovery"],
    schemaMarkup: {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": `${service} in ${city}`,
      "provider": { "@type": "LocalBusiness", "name": "CompHelp Service" },
      "areaServed": city
    },
    blogDraft: {
      title: `${service} in ${city}: What Local Customers Should Know`,
      intro: `If you need ${service.toLowerCase()} in ${city}, CompHelp Service can help you understand the project, estimate the scope, and plan next steps.`,
      sections: ["What affects price", "What to prepare before service", "When to request a free estimate", "Why local support matters"]
    },
    proposedSlug: `/${slug}`,
    nextAction: "Review, create the page with the SEO page tool, then update sitemap.xml."
  };
}

function deploymentStatus() {
  const logs = readJsonLines(AUTOMATION_LOG_FILE, 25);
  const latest = logs[logs.length - 1] || null;
  return {
    githubConfigured: Boolean(process.env.GITHUB_TOKEN && process.env.GITHUB_REPO),
    vercelConfigured: Boolean(process.env.VERCEL_TOKEN && (process.env.VERCEL_PROJECT_ID || process.env.VERCEL_DEPLOY_HOOK_URL)),
    autoDeploy: process.env.AUTO_DEPLOY !== "false",
    branch: process.env.GITHUB_BRANCH || "main",
    repo: process.env.GITHUB_REPO || "comphelper22-cell/comphelp-service",
    latest,
    recentLogs: logs.reverse(),
    workflow: ["Validate project", "Commit changed files through GitHub API", "Push to main", "Trigger Vercel deployment", "Report deployment status"]
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
  const estimate = await calculateEstimate(payload);
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

function signedQuoteUrl(estimateId) {
  const secret = clean(process.env.MARKETPLACE_QUOTE_SECRET || process.env.MARKETPLACE_ADMIN_SECRET || process.env.ADMIN_UPLOAD_SECRET, 500);
  if (!secret) return "";
  const idValue = clean(estimateId, 120);
  if (!idValue) return "";
  const expires = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const token = crypto.createHmac("sha256", secret).update(`${idValue}.${expires}`).digest("hex");
  const base = clean(process.env.PUBLIC_SITE_URL || "https://comphelp-service.vercel.app", 240).replace(/\/$/, "");
  return `${base}/api/marketplace-quote?id=${encodeURIComponent(idValue)}&expires=${expires}&token=${token}`;
}

async function emailEstimate(payload) {
  if (!payload.approved) return { skipped: true, reason: "Email not sent. Approval is required." };
  if (!process.env.RESEND_API_KEY || !process.env.LEAD_FROM_EMAIL) return { skipped: true, reason: "RESEND_API_KEY and LEAD_FROM_EMAIL are required." };
  const email = clean(payload.email, 180);
  if (!email) return { skipped: true, reason: "Customer email is missing." };
  const quoteUrl = signedQuoteUrl(payload.estimateId);
  if (!quoteUrl) return { skipped: true, reason: "Secure quote links are not configured." };
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

const MAX_JSON_BODY_BYTES = 256 * 1024;

function payloadTooLarge() {
  const error = new Error("Request body exceeds 256 KB.");
  error.code = "payload_too_large";
  return error;
}

async function readBody(req) {
  const declaredLength = Number(req.headers && req.headers["content-length"] || 0);
  if (declaredLength > MAX_JSON_BODY_BYTES) throw payloadTooLarge();
  if (typeof req.body === "object" && req.body) {
    if (Buffer.byteLength(JSON.stringify(req.body), "utf8") > MAX_JSON_BODY_BYTES) throw payloadTooLarge();
    return req.body;
  }
  if (typeof req.body === "string") {
    if (Buffer.byteLength(req.body, "utf8") > MAX_JSON_BODY_BYTES) throw payloadTooLarge();
    return JSON.parse(req.body || "{}");
  }
  const chunks = [];
  let totalBytes = 0;
  for await (const chunk of req) {
    totalBytes += chunk.length;
    if (totalBytes > MAX_JSON_BODY_BYTES) throw payloadTooLarge();
    chunks.push(chunk);
  }
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
      config: { services: seed.services, vendorCategories: seed.vendorCategories, estimateRules: seed.estimateRules, crmStages: seed.crmStages || CRM_STAGES },
      summary: { leads: 0, vendors: 0, projects: 0, openProjects: 0, revenue: 0, expectedCommission: 0, publishedGalleryItems: galleryCount(), smmDrafts: 0, conversionRate: 0, crm: crmSummary([]) },
      recentLeads: [],
      topVendors: [],
      vendors: [],
      projects: []
    };
  }
  const [leads, vendors, commissions, projects, mediaReviews, sourceLeads, dispatches, followUps, messageQueue, activityLogs, customers, jobs, estimates, invoices, payments] = await Promise.all([
    list("leads"),
    list("vendors"),
    list("commissions"),
    list("projects"),
    list("mediaReviews"),
    list("sourceLeads"),
    list("dispatches"),
    list("followUps"),
    list("messageQueue"),
    list("activityLogs"),
    list("customers"),
    list("jobs"),
    list("estimates"),
    list("invoices"),
    list("payments")
  ]);
  const paidInvoices = invoices.filter((invoice) => /paid/i.test(clean(invoice.paymentStatus || invoice.status, 80)));
  const openInvoices = invoices.filter((invoice) => !/paid|refunded/i.test(clean(invoice.paymentStatus || invoice.status, 80)));
  const overdueInvoices = invoices.filter((invoice) => /overdue/i.test(clean(invoice.paymentStatus || invoice.status, 80)));
  const openJobs = jobs.filter((job) => !["completed", "cancelled", "archived"].includes(clean(job.status, 40)));
  const completedJobs = jobs.filter((job) => clean(job.status, 40) === "completed");
  const approvedEstimates = estimates.filter((estimate) => /approved|converted|won|accepted/i.test(clean(estimate.status, 80)));
  const revenue = paidInvoices.reduce((sum, invoice) => sum + money(invoice.total || invoice.amount), 0);
  const expectedCommission = commissions.reduce((sum, item) => sum + money(item.expectedCommission || item.expected_commission), 0);
  const openProjects = projects.filter((project) => !["completed", "cancelled", "closed"].includes(clean(project.status, 40))).length;
  const crm = crmSummary(leads);
  return {
    ok: true,
    role,
    warnings: dbConnected ? [] : ["Database not connected"],
    config: { services: seed.services, vendorCategories: seed.vendorCategories, estimateRules: seed.estimateRules, crmStages: seed.crmStages || CRM_STAGES },
    summary: {
      leads: leads.length,
      crm,
      newLeads: crm.newLeads,
      contactedLeads: crm.contacted,
      quoteSentLeads: crm.quoteSent,
      followUpLeads: crm.followUp,
      wonLeads: crm.won,
      lostLeads: crm.lost,
      sourceLeads: sourceLeads.length,
      vendors: vendors.length,
      customers: customers.length,
      projects: projects.length,
      openProjects: openJobs.length || openProjects,
      openJobs: openJobs.length,
      completedJobs: completedJobs.length,
      estimates: estimates.length,
      invoices: invoices.length,
      paidInvoices: paidInvoices.length,
      outstandingInvoices: openInvoices.length,
      overdueInvoices: overdueInvoices.length,
      outstandingBalance: Math.round(openInvoices.reduce((sum, invoice) => sum + money(invoice.outstandingBalance ?? invoice.total ?? invoice.amount), 0)),
      dispatches: dispatches.length,
      followUps: followUps.length,
      queuedMessages: messageQueue.filter((item) => ["queued", "needs_approval"].includes(clean(item.status, 50))).length,
      messagesSentToday: messageQueue.filter((item) => clean(item.status, 50) === "sent" && clean(item.sentAt || item.sent_at || item.createdAt || item.created_at, 40).startsWith(todayKey())).length,
      activityLogs: activityLogs.length,
      revenue: Math.round(revenue),
      expectedCommission: Math.round(expectedCommission),
      publishedGalleryItems: galleryCount(),
      smmDrafts: mediaReviews.length,
      conversionRate: estimates.length ? Math.round((approvedEstimates.length / estimates.length) * 100) : leads.length ? Math.round((projects.length / leads.length) * 100) : 0,
      technicianWorkload: technicianWorkload(jobs),
      businessScore: businessScore({ openJobs, completedJobs, overdueInvoices, customers }),
      vendorPerformance: vendors.slice().sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0)).slice(0, 5),
      marketingPerformance: { smmDrafts: mediaReviews.length, seoPlans: (await list("marketingIdeas")).length }
    },
    recentLeads: leads.slice(0, 8).map((lead) => ({ ...lead, status: normalizeLeadStatus(lead.status) })),
    topVendors: vendors.slice().sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0)).slice(0, 8),
    vendors,
    projects: projects.slice(0, 12),
    activityLogs: activityLogs.slice(0, 20),
    messageQueue: messageQueue.slice(0, 20),
    demoData: demoDataFromSeed({ customers, jobs, estimates, invoices, revenue }),
    deployment: deploymentStatus()
  };
}

function technicianWorkload(jobs = []) {
  return jobs.reduce((map, job) => {
    const technician = clean(job.assignedTechnician || "Unassigned", 140);
    if (!["completed", "cancelled", "archived"].includes(clean(job.status, 40))) map[technician] = (map[technician] || 0) + 1;
    return map;
  }, {});
}

function businessScore({ openJobs = [], completedJobs = [], overdueInvoices = [], customers = [] }) {
  let score = 92;
  score -= Math.min(18, overdueInvoices.length * 4);
  score -= Math.min(12, openJobs.filter((job) => clean(job.priority, 40) === "emergency").length * 3);
  score += Math.min(5, completedJobs.length);
  score += customers.length >= 100 ? 3 : 0;
  return Math.max(0, Math.min(100, score));
}

function demoDataFromSeed({ customers = [], jobs = [], estimates = [], invoices = [], revenue = 0 }) {
  return {
    demoCustomers: customers.slice(0, 8).map((customer) => ({ name: customer.fullName || customer.name, city: customer.city, status: customer.status, serviceNeed: customer.notes })),
    demoJobs: jobs.slice(0, 8).map((job) => ({ title: job.title, customerName: job.customerName, status: job.status, priority: job.priority, value: job.value || 0 })),
    demoEstimates: estimates.slice(0, 8).map((estimate) => ({ service: estimate.service, customerName: estimate.customerName, low: Math.round((estimate.total || 0) * 0.9), high: Math.round((estimate.total || 0) * 1.15), recommended: estimate.total || estimate.recommended || 0, status: estimate.status })),
    demoInvoices: invoices.slice(0, 8).map((invoice) => ({ id: invoice.invoiceNumber || invoice.id, customerName: invoice.customerName, amount: invoice.total || invoice.amount || 0, status: invoice.paymentStatus || invoice.status })),
    revenue
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
    city: clean(payload.city || payload.serviceArea, 80),
    rating: Math.min(5, Math.max(1, Number(payload.rating || 4))),
    availability: clean(payload.availability, 120),
    commissionPercent: money(payload.commissionPercent),
    distanceMiles: Math.max(0, Number(payload.distanceMiles || 0)),
    notes: clean(payload.notes, 1200),
    status: clean(payload.status, 80) || "active",
    contact: clean(payload.email || payload.phone, 180)
  };
}

function vendorPatch(payload) {
  const patch = {};
  const stringFields = {
    name: 140,
    category: 80,
    phone: 80,
    email: 180,
    website: 240,
    serviceArea: 240,
    city: 80,
    availability: 120,
    notes: 1200,
    status: 80
  };
  Object.entries(stringFields).forEach(([field, max]) => {
    if (payload[field] !== undefined && clean(payload[field], max)) patch[field] = clean(payload[field], max);
  });
  if (payload.rating !== undefined && clean(payload.rating, 30)) patch.rating = Math.min(5, Math.max(1, Number(payload.rating)));
  if (payload.commissionPercent !== undefined && clean(payload.commissionPercent, 30)) patch.commissionPercent = money(payload.commissionPercent);
  if (payload.distanceMiles !== undefined && clean(payload.distanceMiles, 30)) patch.distanceMiles = Math.max(0, Number(payload.distanceMiles));
  if (patch.category || clean(payload.service, 120)) patch.services = [patch.category, clean(payload.service, 120)].filter(Boolean);
  if (patch.email || patch.phone) patch.contact = patch.email || patch.phone;
  return patch;
}

async function handleAction(action, payload) {
  if (action === "queueMessage") {
    return { ok: true, message: await queueMessage(payload) };
  }
  if (action === "optOut") {
    const record = await insert("optOuts", {
      recipient: clean(payload.recipient || payload.phone || payload.email, 180),
      reason: clean(payload.reason || "manual", 500),
      source: clean(payload.source || "marketplace", 80),
      status: "active"
    });
    await logActivity("opt_out", "Opt-out saved.", { recipient: record.recipient, status: "active" });
    return { ok: true, optOut: record };
  }
  if (action === "approveMessage") {
    const messageId = clean(payload.id || payload.messageId, 120);
    const patch = { approved: true, status: "queued", approvedAt: new Date().toISOString() };
    const message = await updateRecord("messageQueue", messageId, patch);
    await logActivity("message_approved", "Message approved and queued.", { messageId, status: "queued" });
    return { ok: true, message };
  }
  if (action === "activityLogs") {
    return { ok: true, activityLogs: (await list("activityLogs")).slice(0, 100) };
  }
  if (action === "deploymentStatus") {
    return { ok: true, deployment: deploymentStatus() };
  }
  if (action === "leadSourceSearch") {
    const plans = leadSourceSearchPlan(payload);
    const saved = [];
    for (const plan of plans) saved.push(await insert("sourceLeads", plan));
    await logActivity("lead_source_search", "Lead source search plans created.", { count: saved.length, city: payload.city, category: payload.category });
    return {
      ok: true,
      sourceLeads: saved,
      note: "Lead source searches were saved for review. No scraping or contact was performed."
    };
  }
  if (action === "lead") {
    const lead = leadPayload(payload);
    const saved = await insert("leads", lead);
    await logActivity("lead_saved", `Lead saved: ${saved.name || "New lead"}`, { leadId: saved.id, service: saved.service, status: saved.status });
    return { ok: true, lead: saved, hubspot: await createHubSpotContact(lead), n8n: await callWebhook("N8N_LEAD_WEBHOOK_URL", { lead }) };
  }
  if (action === "estimate") {
    const estimate = await calculateEstimate(payload);
    const saved = await insert("estimates", estimate);
    await logActivity("estimate_created", `Estimate created for ${saved.service}.`, { estimateId: saved.id, recommended: saved.recommended });
    return { ok: true, estimate: saved, quoteUrl: signedQuoteUrl(saved.id || estimate.id) };
  }
  if (action === "emailEstimate") return { ok: true, email: await emailEstimate(payload) };
  if (action === "vendorSearch") {
    const vendor = await insert("vendors", { ...vendorPayload(payload), source: "vendor_finder", status: "needs_approval" });
    await logActivity("vendor_found", `Vendor profile saved: ${vendor.name || "Vendor"}`, { vendorId: vendor.id, category: vendor.category, status: vendor.status });
    return { ok: true, vendor, note: "Vendor profile saved for approval and ranking." };
  }
  if (action === "vendor") {
    const vendor = await insert("vendors", vendorPayload(payload));
    await logActivity("vendor_saved", `Vendor saved: ${vendor.name || "Vendor"}`, { vendorId: vendor.id, category: vendor.category });
    return { ok: true, vendor };
  }
  if (action === "vendorUpdate") return { ok: true, vendor: await updateRecord("vendors", clean(payload.id, 120), vendorPatch(payload)) };
  if (action === "vendorDelete") return { ok: true, vendor: await deleteRecord("vendors", clean(payload.id, 120)) };
  if (action === "vendorMatch") return { ok: true, match: await vendorProjectMatch(payload) };
  if (action === "quoteRequest") {
    const recommendation = await recommendVendors(payload);
    const request = { leadId: clean(payload.leadId, 120), projectId: clean(payload.projectId, 120), service: clean(payload.service, 120), category: clean(payload.category, 80), city: clean(payload.city, 80), scope: clean(payload.scope, 1600), status: "draft", vendorResponses: [], vendorOptions: recommendation.top3 || recommendation.top3Summary || [] };
    const saved = await insert("quoteRequests", request);
    await logActivity("quote_request_created", "Vendor quote request draft created.", { quoteRequestId: saved.id, service: saved.service, status: saved.status });
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
    await logActivity("dispatcher_plan", "Dispatcher plan created.", { dispatchId: saved.id, service: saved.service, status: saved.status });
    return { ok: true, dispatch: saved, quoteRequest, plan };
  }
  if (action === "recommendation") return { ok: true, recommendation: await recommendVendors(payload) };
  if (action === "commission") {
    const projectValue = money(payload.projectValue || payload.revenue);
    const rate = money(payload.commissionPercent || payload.commissionRate);
    const commission = { projectValue, vendorSelected: clean(payload.vendorSelected || payload.vendorName, 140), commissionPercent: rate, expectedCommission: Math.round(projectValue * (rate / 100)), paidCommission: money(payload.paidCommission), paymentStatus: clean(payload.paymentStatus || payload.status, 80), followUpDate: clean(payload.followUpDate, 60), jobName: clean(payload.jobName, 140), revenue: projectValue, status: clean(payload.paymentStatus || payload.status, 80) };
    const saved = await insert("commissions", commission);
    await logActivity("commission_tracked", "Commission record saved.", { commissionId: saved.id, expectedCommission: saved.expectedCommission });
    return { ok: true, commission: saved };
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
    await logActivity("followup_plan", "Customer follow-up drafts created.", { count: saved.length, service: payload.service });
    return { ok: true, followUps: saved, note: "Follow-up drafts saved. Sending still requires approval and business-hours checks." };
  }
  if (action === "project") {
    const project = { customerName: clean(payload.customerName, 120), service: clean(payload.service, 120), title: clean(payload.title, 160), city: clean(payload.city, 80), status: clean(payload.status, 80), completionDate: clean(payload.completionDate, 60), followUpDate: clean(payload.followUpDate, 60), beforeAfterNotes: clean(payload.beforeAfterNotes, 1000), customerReview: clean(payload.customerReview, 1200), notes: clean(payload.notes, 1500), reminders: [payload.followUpDate ? `Follow up on ${payload.followUpDate}.` : "Set follow-up date.", "Confirm customer has estimate and next step.", "Send review request only after completed work and approval."] };
    const saved = await insert("projects", project);
    await logActivity("project_saved", `Project saved: ${saved.title || saved.service || "Project"}`, { projectId: saved.id, service: saved.service, status: saved.status });
    return { ok: true, project: saved, vapi: await callWebhook("VAPI_PROJECT_WEBHOOK_URL", { project: saved }) };
  }
  throw new Error("Unknown marketplace action.");
}

const PERMISSIONS = {
 

  


  admin: ["queueMessage", "optOut", "approveMessage", "activityLogs", "deploymentStatus", "leadSourceSearch", "lead", "estimate", "emailEstimate", "vendorSearch", "vendor", "vendorUpdate", "vendorDelete", "quoteRequest", "vendorResponse", "dispatcher", "recommendation", "commission", "marketing", "seo", "smm", "followupPlan", "project"],
  manager: ["queueMessage", "optOut", "activityLogs", "deploymentStatus", "leadSourceSearch", "lead", "estimate", "vendorSearch", "vendor", "vendorUpdate", "quoteRequest", "dispatcher", "recommendation", "marketing", "seo", "smm", "followupPlan", "project"],
  viewer: ["recommendation", "activityLogs", "deploymentStatus"]
  
};

async function handler(req, res) {
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
      if (error.code === "payload_too_large") {
        return sendJson(res, 413, { ok: false, error: "payload_too_large", message: "Request body exceeds 256 KB.", where: "handler:POST:parseBody" });
      }
      logError("handler:POST:parseBody", error);
      return sendJson(res, 400, { ok: false, error: "invalid_json", message: clean(error.message || "Invalid JSON body.", 500), where: "handler:POST:parseBody" });
    }
    const action = clean(body.action, 80);
    if (action === "login") {
      try {
        const login = loginStatus(req);
        return sendJson(res, login.ok ? 200 : login.status, login.ok ? { ok: true, role: login.role, demoMode: Boolean(login.demoMode) } : { ok: false, error: login.error, where: "handler:POST:login" });
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
}

module.exports = handler;
module.exports.resolveRole = resolveRole;
module.exports.intakeWebsiteLead = intakeWebsiteLead;
module.exports.signedQuoteUrl = signedQuoteUrl;
module.exports.vendorPayload = vendorPayload;
module.exports.vendorPatch = vendorPatch;
