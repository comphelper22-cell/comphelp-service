const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const LOG_DIR = path.join(ROOT, "logs");

function clean(value, max = 1000) {
  return String(value || "").trim().slice(0, max);
}

function log(action, payload) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
  fs.appendFileSync(path.join(LOG_DIR, "agents.jsonl"), `${JSON.stringify({ timestamp: new Date().toISOString(), agent: "smm-agent", action, payload })}\n`);
}

function createDrafts(input = {}) {
  const service = clean(input.service || "Security Camera Installation", 120);
  const city = clean(input.city || "Los Angeles", 80);
  const note = clean(input.note || `Completed ${service.toLowerCase()} project in ${city}.`, 500);
  const hashtags = ["#CompHelpService", "#LosAngelesCounty", `#${city.replace(/\s+/g, "")}`, `#${service.replace(/[^A-Za-z0-9]/g, "")}`];
  return {
    autoPost: process.env.AUTO_POST === "true",
    instagramPost: `${note}\n\nCall +1 (747) 295-1440 for a free estimate.\n\n${hashtags.join(" ")}`,
    facebookPost: `${note} CompHelp Service helps local homes and small businesses with reliable tech services.`,
    tiktokScript: ["Show finished result", "Show one project detail", "Mention customer benefit", "End with free estimate CTA"],
    reelIdea: "7-12 second vertical before/result walkthrough with captions.",
    slideshowIdea: "Problem, process, finished result, call-to-action.",
    caption: note,
    hashtags,
    voiceover: `CompHelp Service completed this ${service.toLowerCase()} project in ${city}. Need help? Call for a free estimate.`,
    postingSchedule: [
      { platform: "Instagram", time: "6:00 PM", format: "Reel or carousel" },
      { platform: "Facebook", time: "12:00 PM", format: "Project post" },
      { platform: "TikTok", time: "7:30 PM", format: "Short video" }
    ],
    safety: process.env.AUTO_POST === "true" ? "AUTO_POST enabled; verify platform tooling before posting." : "Drafts only. Auto-posting disabled."
  };
}

function main() {
  const result = createDrafts({ service: process.argv[2], city: process.argv[3], note: process.argv.slice(4).join(" ") });
  log("smm_drafts_created", result);
  console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) main();

module.exports = { createDrafts };
