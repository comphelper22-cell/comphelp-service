const { complianceSummary, pauseOutreach, addOptOut, readCollection } = require("./outreach-core");

function dashboard() {
  return {
    ...complianceSummary(),
    statuses: ["draft", "needs_approval", "approved", "queued", "sent", "replied", "opted_out", "failed"],
    safetyRules: [
      "No mass sending.",
      "Cold outreach default limit is 10 per day.",
      "No more than 3 follow-ups per lead.",
      "No repeated contact within 7 days unless replied.",
      "Approval required before SMS/email unless existing customer.",
      "Opt-outs are always honored."
    ]
  };
}

function main() {
  const command = process.argv[2] || "dashboard";
  if (command === "pause") {
    console.log(JSON.stringify({ paused: true, queue: pauseOutreach(true) }, null, 2));
    return;
  }
  if (command === "resume") {
    console.log(JSON.stringify({ paused: false, queue: pauseOutreach(false) }, null, 2));
    return;
  }
  if (command === "optout") {
    console.log(JSON.stringify(addOptOut(process.argv[3], "manual"), null, 2));
    return;
  }
  console.log(JSON.stringify(dashboard(), null, 2));
}

if (require.main === module) main();

module.exports = { dashboard, pauseOutreach, addOptOut };
