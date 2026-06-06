const fs = require("fs");
const path = require("path");
const { loadMediaConfig, ensureMediaFolders, listUploadFiles, watchUploads, PROJECT_ROOT } = require("./tools/watchUploads");
const { analyzeMedia } = require("./tools/analyzeMedia");
const { selectBestMedia } = require("./tools/selectBestMedia");
const { privacyBlur } = require("./tools/privacyBlur");
const { optimizeImages } = require("./tools/optimizeImages");
const { createGalleryItem } = require("./tools/createGalleryItem");
const { updateServicePage } = require("./tools/updateServicePage");
const { createSocialDrafts } = require("./tools/createSocialDrafts");
const { githubCommit } = require("./tools/githubCommit");
const { vercelDeploy } = require("./tools/vercelDeploy");
const { logAction } = require("./tools/logAction");

const PLAN_FILE = path.join(PROJECT_ROOT, "logs", "media-last-plan.json");

function parseArgs(argv) {
  const args = { _: [] };
  for (const arg of argv) {
    if (arg.startsWith("--")) {
      const [key, rawValue] = arg.slice(2).split("=");
      args[key] = rawValue === undefined ? true : rawValue;
    } else {
      args._.push(arg);
    }
  }
  return args;
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

function readPlan() {
  if (!fs.existsSync(PLAN_FILE)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(PLAN_FILE, "utf8"));
}

function compactForConsole(value) {
  return JSON.stringify(value, null, 2);
}

function missingInfoMessage(selected) {
  const missing = new Set();
  for (const item of selected) {
    if (!item.city) missing.add("city");
    if (!item.serviceKey) missing.add("service type");
    if (item.requiresPrivacyReview) missing.add("customer privacy check");
  }
  return [...missing];
}

async function buildPlan(options = {}) {
  const config = loadMediaConfig();
  ensureMediaFolders(config);

  if (options.service && !config.services[options.service]) {
    return {
      ok: false,
      error: `Unknown service "${options.service}". Use one of: ${Object.keys(config.services).join(", ")}`
    };
  }

  const files = listUploadFiles(config);
  if (!files.length) {
    return {
      ok: true,
      empty: true,
      message: "No new uploads found in uploads/new."
    };
  }

  const analysis = analyzeMedia(files, {
    config,
    city: options.city,
    serviceKey: options.service,
    note: options.note
  });
  const selection = selectBestMedia(analysis, {
    maxItems: config.workflow.maxSelectedMedia
  });
  const missingInfo = missingInfoMessage(selection.selected);
  if (!options.privacyOk) {
    missingInfo.push("customer privacy check");
  }

  if (missingInfo.length && !options.allowMissing) {
    const reviewPlan = {
      ok: false,
      needsOwnerInfo: true,
      questions: [
        missingInfo.includes("city") ? "What city should be used for these job photos/videos?" : "",
        missingInfo.includes("service type") ? "Which service type should these files be added under?" : "",
        missingInfo.includes("customer privacy check") ? "Have faces, addresses, license plates, passwords, serial numbers, and documents been checked or approved for blurring?" : ""
      ].filter(Boolean),
      selected: selection.selected.map((item) => ({
        fileName: item.fileName,
        guessedService: item.serviceLabel || "(unknown)",
        qualityScore: item.qualityScore,
        privacyFlags: item.privacyFlags
      })),
      rejected: selection.rejected.map((item) => ({
        fileName: item.fileName,
        reason: item.rejectReason
      }))
    };
    writeJson(PLAN_FILE, reviewPlan);
    return reviewPlan;
  }

  const privacyChecked = await privacyBlur(selection.selected, {
    config,
    privacyOk: options.privacyOk
  });
  const optimizedResult = await optimizeImages(privacyChecked, { config });
  const grouped = new Map();

  for (const item of optimizedResult.optimized) {
    const serviceKey = item.serviceKey;
    if (!grouped.has(serviceKey)) grouped.set(serviceKey, []);
    grouped.get(serviceKey).push(item);
  }

  const updates = [];
  for (const [serviceKey, items] of grouped.entries()) {
    const service = config.services[serviceKey];
    const lead = items[0];
    const beforeItem = items.find((item) => /before/i.test(item.fileName));
    const afterItem = items.find((item) => /after/i.test(item.fileName));
    const galleryLead = {
      ...lead,
      beforeMediaUrl: beforeItem && afterItem ? beforeItem.mediaUrl : "",
      afterMediaUrl: beforeItem && afterItem ? afterItem.mediaUrl : ""
    };
    const title = options.title || `${service.label} job in ${lead.city || options.city || "Los Angeles"}`;
    const description = options.note || lead.ownerNote || `Completed ${service.label.toLowerCase()} project in ${lead.city || options.city || "Los Angeles"}.`;
    const galleryItem = createGalleryItem(galleryLead, {
      title,
      description,
      city: lead.city || options.city || "Los Angeles",
      serviceLabel: service.label,
      caption: options.caption || "Completed job media added by CompHelp Service media manager."
    });
    const pagePreview = updateServicePage({
      config,
      serviceKey,
      galleryItem,
      approved: false
    });

    updates.push({
      serviceKey,
      page: service.page,
      media: items.map((item) => ({
        fileName: item.fileName,
        mediaUrl: item.mediaUrl,
        thumbnailUrl: item.thumbnailUrl,
        backupPath: item.backupPath,
        optimizer: item.optimizer
      })),
      galleryItem,
      diff: pagePreview.diff,
      socialDrafts: createSocialDrafts({
        service: service.label,
        city: lead.city || options.city || "Los Angeles",
        description
      })
    });
  }

  const plan = {
    ok: true,
    createdAt: new Date().toISOString(),
    approvalRequired: true,
    message: "Media has been analyzed and staged. Review the diff and drafts before publishing.",
    analyzed: analysis.length,
    selected: selection.selected.length,
    rejected: selection.rejected.map((item) => ({
      fileName: item.fileName,
      reason: item.rejectReason
    })),
    privacySkipped: optimizedResult.skipped.map((item) => ({
      fileName: item.fileName,
      reviewPath: item.reviewPath,
      privacyFlags: item.privacyFlags
    })),
    updates
  };

  writeJson(PLAN_FILE, plan);
  logAction("media_plan_created", {
    analyzed: plan.analyzed,
    selected: plan.selected,
    updateCount: updates.length
  });
  return plan;
}

async function applyPlan(options = {}) {
  const config = loadMediaConfig();
  const plan = readPlan();
  if (!plan || !plan.ok || !Array.isArray(plan.updates)) {
    return {
      ok: false,
      error: "No approved-ready media plan found. Run npm run preview-gallery-update first."
    };
  }

  const results = [];
  for (const update of plan.updates) {
    results.push(updateServicePage({
      config,
      serviceKey: update.serviceKey,
      galleryItem: update.galleryItem,
      approved: Boolean(options.approved)
    }));
  }

  const publishResult = {
    ok: results.every((result) => result.ok),
    approved: Boolean(options.approved),
    pageUpdates: results,
    socialDrafts: plan.updates.map((update) => ({
      serviceKey: update.serviceKey,
      page: update.page,
      drafts: update.socialDrafts
    }))
  };

  if (!options.approved) {
    return {
      ...publishResult,
      requiresApproval: true,
      message: "Approval is required. Re-run with --approved to update service pages."
    };
  }

  logAction("media_gallery_published", {
    pages: results.map((result) => result.page),
    updateCount: results.length
  });

  if (options.commit) {
    publishResult.github = await githubCommit({
      message: options.message || "Add approved job media to service gallery",
      approved: true,
      push: Boolean(options.push)
    });
  }

  if (options.deploy) {
    publishResult.vercel = await vercelDeploy({
      approved: true,
      target: "production"
    });
  }

  return publishResult;
}

async function run(command, options = {}) {
  if (command === "media-agent") {
    ensureMediaFolders(loadMediaConfig());
    return {
      ok: true,
      agent: "Auto Media Website Manager Agent",
      business: "CompHelp Service",
      uploadFolder: "uploads/new",
      commands: [
        "npm run media-agent",
        "npm run process-uploads -- --city=Los Angeles --service=security-camera-installation --note=\"Short job note\" --privacy-ok",
        "npm run preview-gallery-update -- --city=Los Angeles --service=data-recovery --note=\"Recovered files from a laptop\" --privacy-ok",
        "npm run approve-publish -- --approved"
      ],
      safety: [
        "Never deletes originals.",
        "Never commits, deploys, or posts without approval.",
        "Copies privacy-risk files to uploads/needs-review.",
        "Saves backups in uploads/original-backups."
      ]
    };
  }

  if (command === "process-uploads" || command === "preview-gallery-update") {
    return buildPlan(options);
  }

  if (command === "approve-publish") {
    return applyPlan(options);
  }

  if (command === "watch") {
    watchUploads((files) => {
      console.log(`Detected ${files.length} uploaded file(s). Run npm run preview-gallery-update with owner details to stage updates.`);
    });
    return {
      ok: true,
      watching: true,
      uploadFolder: "uploads/new"
    };
  }

  return {
    ok: false,
    error: `Unknown command: ${command}`
  };
}

if (require.main === module) {
  const args = parseArgs(process.argv.slice(2));
  const command = args._[0] || "media-agent";
  run(command, args)
    .then((result) => {
      console.log(compactForConsole(result));
      if (result && result.ok === false) process.exitCode = 1;
    })
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}

module.exports = {
  run,
  buildPlan,
  applyPlan
};
