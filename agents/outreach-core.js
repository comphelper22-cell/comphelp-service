const fs = require("fs");
const path = require("path");
const safeStorage = require("../storage/safe-storage");

const ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(ROOT, "data");
const FILES = {
  leads: path.join(DATA_DIR, "leads.json"),
  vendors: path.join(DATA_DIR, "vendors.json"),
  log: path.join(DATA_DIR, "outreach-log.json"),
  optOuts: path.join(DATA_DIR, "opt-outs.json"),
  queue: path.join(DATA_DIR, "message-queue.json")
};

const DEFAULT_DAILY_LIMIT = 10;
const DEFAULT_FOLLOWUP_LIMIT = 20;
const FOLLOWUP_STEPS = [
  { day: 0, label: "thank_you", purpose: "thank you message" },
  { day: 1, label: "estimate_reminder", purpose: "estimate reminder" },
  { day: 3, label: "soft_follow_up", purpose: "soft follow-up" },
  { day: 7, label: "final_check_in", purpose: "final check-in" }
];

function clean(value, max = 1000) {
  return String(value || "").trim().slice(0, max);
}

function id(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
}

function readJson(file, fallback = { version: 1, items: [] }) {
  return safeStorage.readJson(file, fallback);
}

function writeJson(file, data) {
  data.updatedAt = new Date().toISOString();
  safeStorage.writeJson(file, data);
  return data;
}

function readCollection(name) {
  return readJson(FILES[name], { version: 1, items: [] });
}

function writeCollection(name, data) {
  return writeJson(FILES[name], data);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function normalizeRecipient(value) {
  return clean(value, 180).toLowerCase().replace(/\s+/g, "");
}

function isOptedOut(recipient) {
  const key = normalizeRecipient(recipient);
  if (!key) return false;
  return (readCollection("optOuts").items || []).some((item) => normalizeRecipient(item.recipient) === key);
}

function addOptOut(recipient, reason = "manual") {
  const data = readCollection("optOuts");
  const key = normalizeRecipient(recipient);
  if (!key) return data;
  if (!data.items.some((item) => normalizeRecipient(item.recipient) === key)) {
    data.items.unshift({ id: id("optout"), recipient: clean(recipient, 180), reason: clean(reason, 300), createdAt: new Date().toISOString() });
    writeCollection("optOuts", data);
  }
  return data;
}

function logCommunication(entry) {
  const data = readCollection("log");
  data.items.unshift({
    id: entry.id || id("log"),
    timestamp: new Date().toISOString(),
    ...entry
  });
  writeCollection("log", data);
  return data.items[0];
}

function messagesSentToday(kind = "outreach") {
  return (readCollection("log").items || []).filter((item) => {
    return item.status === "sent" && item.kind === kind && String(item.timestamp || "").startsWith(today());
  }).length;
}

function wasContactedRecently(recipient, days = 7) {
  const key = normalizeRecipient(recipient);
  if (!key) return false;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return (readCollection("log").items || []).some((item) => {
    const contacted = normalizeRecipient(item.recipient) === key;
    const time = Date.parse(item.timestamp || item.createdAt || "");
    return contacted && time && time >= cutoff && item.status !== "replied";
  });
}

function duplicateQueued(recipient, body) {
  const key = normalizeRecipient(recipient);
  const text = clean(body, 1000).toLowerCase();
  return (readCollection("queue").items || []).some((item) => {
    return normalizeRecipient(item.recipient) === key && clean(item.body, 1000).toLowerCase() === text && !["failed", "cancelled"].includes(item.status);
  });
}

function containsOptOutIntent(text) {
  return /\b(stop|unsubscribe|not interested|no thanks|remove me|do not contact)\b/i.test(String(text || ""));
}

function humanDelayMinutes(index = 0) {
  return 17 + ((index * 13 + Math.floor(Math.random() * 23)) % 71);
}

function assertSafeMessage(input = {}) {
  const errors = [];
  const recipient = clean(input.recipient, 180);
  const body = clean(input.body, 2000);
  const kind = clean(input.kind || "outreach", 50);
  const dailyLimit = Number(process.env.OUTREACH_DAILY_LIMIT || DEFAULT_DAILY_LIMIT);
  const followupLimit = Number(process.env.FOLLOWUP_DAILY_LIMIT || DEFAULT_FOLLOWUP_LIMIT);
  const limit = kind === "followup" ? followupLimit : dailyLimit;

  if (!recipient) errors.push("Recipient is required.");
  if (!body) errors.push("Message body is required.");
  if (isOptedOut(recipient)) errors.push("Recipient is opted out.");
  if (wasContactedRecently(recipient, 7) && !input.replied) errors.push("Recipient was contacted within 7 days.");
  if (duplicateQueued(recipient, body)) errors.push("Duplicate message already exists.");
  if (messagesSentToday(kind) >= limit) errors.push(`Daily ${kind} limit reached.`);
  if (/\bguaranteed\b|\blimited time only\b|\bact now\b/i.test(body)) errors.push("Message contains spammy or overpromising wording.");
  if (input.cold && input.approved !== true) errors.push("Cold outreach requires approval.");

  return { ok: errors.length === 0, errors, limit, sentToday: messagesSentToday(kind) };
}

function createMessageDraft(input = {}) {
  const businessName = clean(input.businessName || "there", 120);
  const serviceNeed = clean(input.serviceNeed || "security camera or WiFi support", 160);
  const variants = [
    `Hi ${businessName}, this is CompHelp Service. We help local businesses with ${serviceNeed}. Would it be okay if I sent a quick free estimate question?`,
    `Hi ${businessName}, CompHelp Service helps local shops with ${serviceNeed}. Are you the right person to ask about service needs?`,
    `Hi ${businessName}, quick question from CompHelp Service: do you need help with ${serviceNeed} this month?`
  ];
  const body = variants[Math.abs(businessName.length + serviceNeed.length) % variants.length];
  return input.channel === "sms" ? `${body} Reply STOP to opt out.` : body;
}

function enqueueMessage(input = {}) {
  const safety = assertSafeMessage(input);
  const queue = readCollection("queue");
  const paused = process.env.OUTREACH_PAUSED !== "false" || queue.paused === true;
  const item = {
    id: id("msg"),
    kind: clean(input.kind || "outreach", 50),
    channel: clean(input.channel || "draft", 30),
    recipient: clean(input.recipient, 180),
    businessName: clean(input.businessName, 140),
    body: clean(input.body, 2000),
    status: safety.ok && !paused ? "queued" : "needs_approval",
    approved: input.approved === true,
    safety,
    sendAfter: new Date(Date.now() + humanDelayMinutes((queue.items || []).length) * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString()
  };
  queue.items.unshift(item);
  writeCollection("queue", queue);
  logCommunication({ kind: item.kind, channel: item.channel, recipient: item.recipient, status: item.status, body: item.body, messageId: item.id });
  return item;
}

function pauseOutreach(paused = true) {
  const queue = readCollection("queue");
  queue.paused = Boolean(paused);
  writeCollection("queue", queue);
  logCommunication({ kind: "system", status: paused ? "paused" : "resumed", recipient: "system", body: paused ? "All outreach paused." : "Outreach resumed." });
  return queue;
}

function complianceSummary() {
  const queue = readCollection("queue");
  const log = readCollection("log");
  const leads = readCollection("leads");
  const vendors = readCollection("vendors");
  const optOuts = readCollection("optOuts");
  return {
    paused: process.env.OUTREACH_PAUSED !== "false" || queue.paused === true,
    messagesSentToday: messagesSentToday("outreach") + messagesSentToday("followup"),
    pendingApprovals: (queue.items || []).filter((item) => item.status === "needs_approval" || item.status === "draft").length,
    optOuts: (optOuts.items || []).length,
    failedMessages: (log.items || []).filter((item) => item.status === "failed").length,
    bouncedEmails: (log.items || []).filter((item) => item.status === "bounced").length,
    leadsWaiting: (leads.items || []).filter((item) => item.status === "needs_approval").length,
    vendorsWaiting: (vendors.items || []).filter((item) => item.status === "needs_approval").length,
    followUpsDue: (queue.items || []).filter((item) => item.kind === "followup" && ["queued", "needs_approval"].includes(item.status)).length
  };
}

module.exports = {
  FILES,
  FOLLOWUP_STEPS,
  clean,
  id,
  readCollection,
  writeCollection,
  addOptOut,
  isOptedOut,
  containsOptOutIntent,
  createMessageDraft,
  enqueueMessage,
  pauseOutreach,
  complianceSummary,
  logCommunication,
  assertSafeMessage
};
