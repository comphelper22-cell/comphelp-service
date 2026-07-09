const assert = require("assert");
const { createOutreachDrafts, evaluateOutreachPolicy } = require("../marketing/outreach-policy");

const policy = evaluateOutreachPolicy({
  lead: { businessName: "Demo Lead", outreachApproved: false },
  draftsToday: 3
});

assert.strictEqual(policy.ok, true);
assert.strictEqual(policy.data.canSendAutomatically, false);
assert.strictEqual(policy.data.ownerApprovalRequired, true);
assert.strictEqual(policy.data.canCreateDraft, true);
assert.ok(policy.data.blockedReasons.includes("owner_approval_required"));

const blocked = evaluateOutreachPolicy({ lead: {}, draftsToday: 10 });
assert.strictEqual(blocked.data.canCreateDraft, false);
assert.ok(blocked.data.blockedReasons.includes("daily_draft_limit_reached"));

const drafts = createOutreachDrafts({ businessName: "Demo Lead", possibleServiceNeed: "WiFi installation" });
assert.ok(drafts.callScript);
assert.ok(drafts.smsDraft.includes("STOP"));
assert.ok(drafts.emailDraft.subject);
assert.ok(drafts.instagramDmDraft);

console.log(JSON.stringify({ ok: true, autoSend: policy.data.canSendAutomatically }, null, 2));

