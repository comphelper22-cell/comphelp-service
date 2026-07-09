const DAILY_DRAFT_LIMIT = 10;

function evaluateOutreachPolicy(input = {}) {
  const lead = input.lead || {};
  const draftsToday = Number(input.draftsToday || 0);
  const reasons = [];
  if (draftsToday >= DAILY_DRAFT_LIMIT) reasons.push("daily_draft_limit_reached");
  if (lead.optedOut) reasons.push("lead_opted_out");
  if (lead.outreachApproved !== true) reasons.push("owner_approval_required");
  if (lead.lastContactedAt && !lead.replied) reasons.push("seven_day_duplicate_contact_window");
  return {
    ok: true,
    data: {
      canSendAutomatically: false,
      canCreateDraft: draftsToday < DAILY_DRAFT_LIMIT && !lead.optedOut,
      approvalRequired: true,
      ownerApprovalRequired: true,
      dailyDraftLimit: DAILY_DRAFT_LIMIT,
      draftsToday,
      blockedReasons: reasons,
      policy: [
        "No auto-DM, auto-email, or auto-SMS.",
        "Owner approval is required before any outreach leaves the system.",
        "Use only public business information and manual research placeholders.",
        "Do not message opted-out contacts or duplicate the same contact within 7 days.",
        "Cold outreach drafts are limited to 10 per day by default."
      ],
      generatedAt: new Date().toISOString()
    }
  };
}

function createOutreachDrafts(lead = {}) {
  return {
    callScript: `Hi, this is CompHelp Service. I noticed ${lead.businessName || "your business"} may need help with ${lead.possibleServiceNeed || "technology support"}. Would you like a free estimate?`,
    smsDraft: `Hi, this is CompHelp Service. We help local LA businesses with cameras, WiFi, computers, and data recovery. Would you like a free estimate? Reply STOP to opt out.`,
    emailDraft: {
      subject: `Free estimate for ${lead.possibleServiceNeed || "local tech service"}`,
      body: `Hi ${lead.businessName || "there"},\n\nCompHelp Service helps Los Angeles businesses with security cameras, WiFi, computer repair, and data recovery. If you need help, I can prepare a free estimate.\n\nThank you,\nCompHelp Service`
    },
    instagramDmDraft: `Hi, I saw your business page. CompHelp Service helps local LA businesses with camera, WiFi, computer, and data recovery work. Would you like a free estimate?`
  };
}

module.exports = {
  DAILY_DRAFT_LIMIT,
  createOutreachDrafts,
  evaluateOutreachPolicy
};
