"use strict";

const emergencyStop = require("./emergency-stop");

const RISK_CLASSES = ["observe", "draft", "bounded", "approval_required", "prohibited"];

function rule(riskClass, reason, ownerAgent, requiredContext = [], limits = {}) {
  return { riskClass, reason, ownerAgent, requiredContext, limits };
}

const ACTIONS = {
  "analytics.read": rule("observe", "Read-only analytics cannot create an external side effect.", "AI CEO"),
  "system.health.read": rule("observe", "Read-only health checks are safe to run automatically.", "AI Reliability Agent"),
  "customer.profile.read": rule("observe", "Authorized read-only customer context supports internal service work.", "AI Support Agent", ["organizationId", "authorizedUserId"]),
  "content.draft": rule("draft", "Draft content is internal until a separate publish approval.", "AI Marketing Manager", ["organizationId"]),
  "lead.followup.draft": rule("draft", "A follow-up draft has no external effect until a separate send decision.", "AI Sales Manager"),
  "review.request.draft": rule("draft", "A review-request draft has no external effect until a separate send decision.", "AI Marketing Manager"),
  "quote.draft": rule("draft", "A draft is not a customer price commitment.", "AI Sales Manager", ["customerId", "serviceRequestId"]),
  "workflow.task.record": rule("draft", "Internal workflow task records create no external commitment.", "AI COO"),
  "owner.notification.record": rule("draft", "Internal owner notifications create no customer-facing effect.", "AI COO"),
  "approval.request.record": rule("draft", "Creating an internal approval request does not approve the requested action.", "AI COO"),
  "vendor.recommend": rule("draft", "Vendor recommendations do not dispatch or spend money.", "AI Dispatcher", ["serviceRequestId"]),
  "lead.followup.send": rule("bounded", "Outbound follow-up may run only under an explicit owner-approved volume policy.", "AI Sales Manager", ["leadId", "approvedTemplateId"], { maxAmount: 10 }),
  "appointment.reminder.send": rule("bounded", "Transactional reminders may run only for confirmed appointments and approved templates.", "AI Support Agent", ["customerId", "jobId", "approvedTemplateId"], { maxAmount: 25 }),
  "vendor.dispatch": rule("approval_required", "Dispatch can create a commercial commitment with a vendor.", "AI Dispatcher", ["jobId", "vendorId", "approvedQuoteId"]),
  "customer.quote.send": rule("approval_required", "Sending a quote creates a customer-facing price commitment.", "AI Sales Manager", ["customerId", "estimateId"]),
  "payment.charge": rule("approval_required", "Charging a customer moves money and requires owner-controlled authorization.", "AI Finance Manager", ["customerId", "invoiceId", "amount", "currency"]),
  "vendor.payout": rule("approval_required", "Vendor payouts require completion proof and financial reconciliation.", "AI Finance Manager", ["vendorId", "jobId", "amount", "ledgerEntryId"]),
  "refund.issue": rule("approval_required", "Refunds affect cash, disputes, and customer commitments.", "AI Finance Manager", ["paymentId", "amount", "reason"]),
  "pricing.change": rule("approval_required", "Pricing changes affect margin and public commercial terms.", "AI CEO", ["serviceId", "oldPrice", "newPrice"]),
  "discount.apply": rule("approval_required", "Discounts reduce margin and require an authorized business decision.", "AI Sales Manager", ["estimateId", "amount", "reason"]),
  "social.publish": rule("approval_required", "Public publishing creates brand, privacy, copyright, and reputation risk.", "AI Marketing Manager", ["contentId", "platform", "approvedMediaIds"]),
  "customer.media.publish": rule("approval_required", "Customer media requires verified consent and owner review.", "AI Marketing Manager", ["customerId", "mediaId", "consentId"]),
  "legal.claim.publish": rule("approval_required", "Legal, warranty, licensing, and guarantee claims require qualified review.", "AI Compliance Agent", ["contentId", "reviewEvidence"]),
  "production.deploy": rule("approval_required", "Production deployment changes the live system.", "AI Developer Agent", ["commitSha", "testEvidence", "reviewEvidence"]),
  "database.migrate.production": rule("approval_required", "Production migration can affect durable business data.", "AI Developer Agent", ["migrationId", "backupEvidence", "rollbackPlan"]),
  "credential.expose": rule("prohibited", "Secrets and credentials must never be exposed.", "AI Security Agent"),
  "security.control.disable": rule("prohibited", "Agents may not disable authentication, authorization, audit, or safety controls.", "AI Security Agent"),
  "audit.delete": rule("prohibited", "Agents may not erase audit evidence.", "AI Security Agent"),
  "unapproved.mass-outreach": rule("prohibited", "Unapproved bulk outreach creates legal, reputation, and abuse risk.", "AI Compliance Agent")
};

function decision(action, value, requiresApproval, reason) {
  return { action, decision: value, riskClass: ACTIONS[action] ? ACTIONS[action].riskClass : "prohibited", requiresApproval, reason };
}

function validIdentifier(value) {
  return typeof value === "string" && value.trim().length > 0 && value.trim().length <= 200;
}

const SUPPORTED_CURRENCIES = new Set(["USD"]);

function validRequiredContext(field, value) {
  if (field.endsWith("Id")) return validIdentifier(value);
  if (field.endsWith("Ids")) {
    return Array.isArray(value)
      && value.length > 0
      && Object.keys(value).length === value.length
      && value.every((item, index) => Object.prototype.hasOwnProperty.call(value, index) && validIdentifier(item));
  }
  if (["amount", "oldPrice", "newPrice"].includes(field)) return typeof value === "number" && Number.isFinite(value) && value >= 0;
  if (field === "currency") return typeof value === "string" && SUPPORTED_CURRENCIES.has(value);
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return Number.isFinite(value);
  if (value && typeof value === "object" && !Array.isArray(value)) return Object.keys(value).length > 0;
  return false;
}

function evaluate(action, context = {}) {
  const selected = ACTIONS[action];
  if (!selected) return decision(action, "deny", false, "Unknown actions are denied by default.");
  if (!context || typeof context !== "object" || Array.isArray(context)) return decision(action, "deny", false, "Policy context must be a non-array object.");
  if (emergencyStop.isActive() || context.emergencyStop === true) return decision(action, "deny", false, "Emergency stop is active.");
  if (selected.riskClass === "prohibited") return decision(action, "deny", false, selected.reason);
  const invalidContext = selected.requiredContext.filter((field) => !validRequiredContext(field, context[field]));
  if (invalidContext.length) return decision(action, "deny", false, `Required policy context is missing or invalid: ${invalidContext.join(", ")}.`);
  if (selected.riskClass === "approval_required") return decision(action, "pending_approval", true, selected.reason);
  if (selected.riskClass === "bounded") {
    const amount = context.amount;
    if (typeof amount !== "number" || !Number.isFinite(amount) || amount < 0) return decision(action, "deny", false, "Bounded action amount must be a finite non-negative number.");
    if (selected.limits.maxAmount !== undefined && amount > selected.limits.maxAmount) return decision(action, "deny", false, "Bounded action amount exceeds the configured maximum.");
    return decision(action, "pending_approval", true, `${selected.reason} Verified bounded approvals are not connected.`);
  }
  return decision(action, "allow", false, selected.reason);
}

module.exports = { ACTIONS, RISK_CLASSES, evaluate };
