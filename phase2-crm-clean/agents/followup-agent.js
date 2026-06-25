const {
  FOLLOWUP_STEPS,
  clean,
  containsOptOutIntent,
  addOptOut,
  createMessageDraft,
  enqueueMessage,
  logCommunication
} = require("./outreach-core");

function followupBody(lead = {}, step = FOLLOWUP_STEPS[0], channel = "sms") {
  const name = clean(lead.businessName || lead.name || "there", 120);
  const service = clean(lead.serviceNeed || lead.service || "your service request", 160);
  const variants = {
    thank_you: `Hi ${name}, thanks for contacting CompHelp Service about ${service}. What is the best day to take a quick look?`,
    estimate_reminder: `Hi ${name}, just checking if you still want a free estimate for ${service}. What city is the job in?`,
    soft_follow_up: `Hi ${name}, no rush. Do you still need help with ${service}?`,
    final_check_in: `Hi ${name}, final check-in from CompHelp Service. Should I close this request for now?`
  };
  const body = variants[step.label] || createMessageDraft({ businessName: name, serviceNeed: service, channel });
  return channel === "sms" ? `${body} Reply STOP to opt out.` : body;
}

function createFollowupDrafts(lead = {}) {
  const recipient = clean(lead.phone || lead.email, 180);
  return FOLLOWUP_STEPS.map((step, index) => enqueueMessage({
    kind: "followup",
    channel: lead.email ? "email" : "sms",
    recipient,
    businessName: lead.businessName || lead.name,
    body: followupBody(lead, step, lead.email ? "email" : "sms"),
    approved: false,
    cold: false,
    followupStep: index + 1
  }));
}

function recordReply(recipient, text) {
  if (containsOptOutIntent(text)) {
    addOptOut(recipient, "reply_opt_out");
    logCommunication({ kind: "reply", recipient, status: "opted_out", body: clean(text, 500) });
    return { optedOut: true, status: "opted_out" };
  }
  logCommunication({ kind: "reply", recipient, status: "replied", body: clean(text, 500) });
  return { optedOut: false, status: "replied" };
}

function main() {
  const result = createFollowupDrafts({ name: process.argv[2] || "Customer", phone: process.argv[3] || "" });
  console.log(JSON.stringify({ drafts: result }, null, 2));
}

if (require.main === module) main();

module.exports = { createFollowupDrafts, recordReply, followupBody };
