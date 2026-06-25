const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const MAX_FILE_BYTES = 25 * 1024 * 1024;
const MAX_FILES = 12;
const DATA_FILE = path.join(process.cwd(), "data", "marketplace.json");
const GALLERY_FILE = path.join(process.cwd(), "data", "gallery.json");

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Access-Control-Allow-Origin", process.env.ALLOWED_ORIGIN || "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-marketplace-admin-secret");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

function clean(value, max = 1000) {
  return String(value || "").trim().slice(0, max);
}

function slugify(value) {
  return clean(value, 120).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "project";
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
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf8");
}

async function githubRequest(pathname, options = {}) {
  if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_REPO) throw new Error("GitHub gallery commit is not configured.");
  const response = await fetch(`https://api.github.com${pathname}`, {
    ...options,
    headers: {
      "Accept": "application/vnd.github+json",
      "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`,
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(options.headers || {})
    }
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || "GitHub request failed.");
  return body;
}

function requireAdmin(req) {
  const secret = clean(req.headers["x-marketplace-admin-secret"], 500);
  const allowed = [
    process.env.MARKETPLACE_ADMIN_SECRET || process.env.ADMIN_UPLOAD_SECRET,
    process.env.MARKETPLACE_MANAGER_SECRET
  ].filter(Boolean);
  if (!allowed.length) return { ok: false, status: 500, error: "MARKETPLACE_ADMIN_SECRET is not configured." };
  if (!allowed.includes(secret)) return { ok: false, status: 401, error: "Invalid admin code." };
  return { ok: true };
}

function rawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_FILE_BYTES * MAX_FILES) {
        reject(new Error("Upload is too large."));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function parseMultipart(req, body) {
  const match = String(req.headers["content-type"] || "").match(/boundary=(?:"([^"]+)"|([^;]+))/i);
  if (!match) throw new Error("Multipart boundary is missing.");
  const boundary = Buffer.from(`--${match[1] || match[2]}`);
  const fields = {};
  const files = [];
  let cursor = body.indexOf(boundary);
  while (cursor !== -1) {
    const next = body.indexOf(boundary, cursor + boundary.length);
    if (next === -1) break;
    let part = body.slice(cursor + boundary.length, next);
    cursor = next;
    if (part.slice(0, 2).toString() === "--") break;
    if (part.slice(0, 2).toString() === "\r\n") part = part.slice(2);
    if (part.slice(-2).toString() === "\r\n") part = part.slice(0, -2);
    const headerEnd = part.indexOf(Buffer.from("\r\n\r\n"));
    if (headerEnd === -1) continue;
    const headerText = part.slice(0, headerEnd).toString("utf8");
    const content = part.slice(headerEnd + 4);
    const name = (headerText.match(/name="([^"]+)"/i) || [])[1];
    const fileName = (headerText.match(/filename="([^"]*)"/i) || [])[1];
    const contentType = (headerText.match(/content-type:\s*([^\r\n]+)/i) || [])[1] || "application/octet-stream";
    if (!name) continue;
    if (fileName) {
      files.push({ fieldName: name, fileName: clean(fileName, 180), contentType: clean(contentType, 120), buffer: content, size: content.length });
    } else {
      fields[name] = content.toString("utf8").trim();
    }
  }
  return { fields, files };
}

function analyze(files) {
  const seen = new Set();
  return files.map((file) => {
    const mediaType = /^video\//.test(file.contentType) ? "video" : "image";
    const warnings = [];
    let score = /^image\//.test(file.contentType) || /^video\//.test(file.contentType) ? 0.82 : 0;
    if (file.size < 80 * 1024) {
      score -= 0.35;
      warnings.push("Possible low resolution.");
    }
    if (/blur|blurry|bad|test/i.test(file.fileName)) {
      score -= 0.35;
      warnings.push("Filename suggests blur or test media.");
    }
    const duplicateKey = `${file.fileName.toLowerCase()}-${file.size}`;
    const duplicate = seen.has(duplicateKey);
    seen.add(duplicateKey);
    if (duplicate) {
      score -= 0.5;
      warnings.push("Duplicate media detected.");
    }
    return { ...file, mediaType, duplicate, qualityScore: Math.max(0, Math.min(1, Number(score.toFixed(2)))), warnings };
  }).sort((a, b) => b.qualityScore - a.qualityScore).slice(0, MAX_FILES);
}

async function uploadCloudinary(file, folder) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) throw new Error("Cloudinary is not configured.");
  const timestamp = Math.floor(Date.now() / 1000);
  const publicId = `${slugify(file.fileName.replace(/\.[^.]+$/, ""))}-${timestamp}`;
  const signature = crypto.createHash("sha1").update(`folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`).digest("hex");
  const form = new FormData();
  form.append("file", new Blob([file.buffer], { type: file.contentType }), file.fileName);
  form.append("api_key", apiKey);
  form.append("timestamp", String(timestamp));
  form.append("folder", folder);
  form.append("public_id", publicId);
  form.append("signature", signature);
  const resourceType = file.mediaType === "video" ? "video" : "image";
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, { method: "POST", body: form });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error && body.error.message ? body.error.message : "Cloudinary upload failed.");
  return { mediaUrl: body.secure_url, cloudinaryPublicId: body.public_id };
}

async function supabaseInsert(record) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const seed = readJson(DATA_FILE, {});
    seed.projects = Array.isArray(seed.projects) ? seed.projects : [];
    seed.projects.unshift({
      id: record.id,
      createdAt: record.created_at,
      customerName: record.customer_name,
      service: record.service,
      title: record.title,
      city: record.city,
      status: record.status,
      completionDate: record.completion_date,
      followUpDate: record.follow_up_date,
      notes: record.notes,
      beforeAfterNotes: record.before_after_notes,
      customerReview: record.customer_review,
      galleryItems: record.gallery_items,
      mediaPlan: record.media_plan
    });
    seed.updatedAt = new Date().toISOString();
    try {
      writeJson(DATA_FILE, seed);
      return { ...record, storage: "data/marketplace.json" };
    } catch (_) {
      return { ...record, storage: "memory_only", warning: "Database not connected and local JSON could not be written in this environment." };
    }
  }
  const base = String(process.env.SUPABASE_URL).replace(/\/$/, "");
  const response = await fetch(`${base}/rest/v1/marketplace_projects`, {
    method: "POST",
    headers: {
      "apikey": process.env.SUPABASE_SERVICE_ROLE_KEY,
      "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation"
    },
    body: JSON.stringify(record)
  });
  const rows = await response.json().catch(() => []);
  if (!response.ok) throw new Error(rows.message || "Supabase project save failed.");
  return rows[0] || record;
}

function fallbackMediaPlan(files, fields) {
  const best = files[0];
  const hasBeforeAfter = files.some((file) => /before/i.test(file.fileName)) && files.some((file) => /after/i.test(file.fileName));
  return {
    bestMedia: best ? best.fileName : "",
    qualityScores: files.map((file) => ({ fileName: file.fileName, score: file.qualityScore, warnings: file.warnings })),
    recommendation: hasBeforeAfter ? "Before/After" : (files.some((file) => file.mediaType === "video") ? "Reel" : "Slideshow"),
    formats: ["Reel", "Slideshow", "Before/After", "TikTok", "Instagram Post", "Facebook Post"],
    recommendedPosts: ["Reel", "Slideshow", hasBeforeAfter ? "Before/After" : "Instagram Post", "TikTok video", "Facebook post"],
    caption: `Completed ${clean(fields.service, 120).toLowerCase()} project in ${clean(fields.city, 80) || "Los Angeles"} by CompHelp Service.`,
    hashtags: ["#CompHelpService", "#LosAngelesCounty", `#${clean(fields.service, 120).replace(/[^A-Za-z0-9]/g, "")}`],
    reelScript: "Show the final result, one quick problem detail, the clean work, then a free estimate CTA.",
    voiceover: `CompHelp Service completed this ${clean(fields.service, 120).toLowerCase()} project in ${clean(fields.city, 80) || "Los Angeles"}.`,
    tiktokScript: "Start with the finished result, show one detail, then add a local service CTA.",
    instagramCaption: `Recent ${clean(fields.service, 120)} project in ${clean(fields.city, 80) || "Los Angeles"} by CompHelp Service.`,
    facebookPost: `CompHelp Service completed a ${clean(fields.service, 120).toLowerCase()} project in ${clean(fields.city, 80) || "Los Angeles"}. Call +1 (747) 295-1440 for a free estimate.`,
    googleBusinessPost: `${clean(fields.service, 120)} in ${clean(fields.city, 80) || "Los Angeles"}: completed local project by CompHelp Service.`,
    postingSchedule: [
      { platform: "Instagram", format: "Reel or carousel", bestTime: "6:00 PM local time", autoPost: process.env.AUTO_POST === "true" },
      { platform: "Facebook", format: "Project post", bestTime: "12:00 PM local time", autoPost: process.env.AUTO_POST === "true" },
      { platform: "TikTok", format: "Short vertical video", bestTime: "7:30 PM local time", autoPost: process.env.AUTO_POST === "true" }
    ]
  };
}

async function mediaPlan(files, fields) {
  const fallback = fallbackMediaPlan(files, fields);
  if (!process.env.OPENAI_API_KEY) return fallback;
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "Return JSON for CompHelp Service project media. Include recommendation, recommendedPosts, caption, hashtags, reelScript, voiceover, tiktokScript, instagramCaption, facebookPost, googleBusinessPost, postingSchedule. Do not claim anything was posted." },
          { role: "user", content: JSON.stringify({ fields, qualityScores: fallback.qualityScores, media: files.map((file) => ({ fileName: file.fileName, mediaType: file.mediaType, warnings: file.warnings })) }) }
        ]
      })
    });
    const body = await response.json();
    return { ...fallback, ...JSON.parse(body.choices?.[0]?.message?.content || "{}") };
  } catch (_) {
    return fallback;
  }
}

function serviceKey(service) {
  const map = {
    "Security Camera Installation": "security-camera-installation",
    "Smart Home Setup": "smart-home-setup",
    "WiFi & Network Installation": "wifi-network-installation",
    "Computer Repair": "computer-repair",
    "Data Recovery": "data-recovery"
  };
  return map[service] || slugify(service);
}

async function appendGallery(items) {
  if (process.env.GITHUB_TOKEN && process.env.GITHUB_REPO) {
    const branch = process.env.GITHUB_BRANCH || "main";
    const dataPath = process.env.GITHUB_GALLERY_PATH || "data/gallery.json";
    const apiPath = `/repos/${process.env.GITHUB_REPO}/contents/${encodeURIComponent(dataPath).replace(/%2F/g, "/")}`;
    let sha = "";
    let gallery = { version: 1, items: [] };
    try {
      const file = await githubRequest(`${apiPath}?ref=${encodeURIComponent(branch)}`);
      sha = file.sha;
      gallery = JSON.parse(Buffer.from(file.content || "", "base64").toString("utf8"));
    } catch (_) {
      gallery = { version: 1, items: [] };
    }
    gallery.items = items.concat(Array.isArray(gallery.items) ? gallery.items : []);
    gallery.updatedAt = new Date().toISOString();
    const body = {
      message: `Add project gallery media: ${items[0]?.title || "CompHelp Service project"}`,
      content: Buffer.from(JSON.stringify(gallery, null, 2) + "\n", "utf8").toString("base64"),
      branch
    };
    if (sha) body.sha = sha;
    await githubRequest(apiPath, { method: "PUT", body: JSON.stringify(body) });
    return { storage: "github", count: gallery.items.length };
  }
  const gallery = readJson(GALLERY_FILE, { version: 1, items: [] });
  gallery.items = Array.isArray(gallery.items) ? gallery.items : [];
  gallery.items = items.concat(gallery.items);
  gallery.updatedAt = new Date().toISOString();
  try {
    writeJson(GALLERY_FILE, gallery);
    return { storage: "data/gallery.json", count: gallery.items.length };
  } catch (error) {
    return { storage: "memory_only", count: gallery.items.length, warning: "Gallery file could not be written in this environment." };
  }
}

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") return json(res, 204, {});
  if (req.method !== "POST") return json(res, 405, { ok: false, error: "Method not allowed." });
  const auth = requireAdmin(req);
  if (!auth.ok) return json(res, auth.status, { ok: false, error: auth.error });
  try {
    const parsed = parseMultipart(req, await rawBody(req));
    if (parsed.fields.privacyConfirmed !== "on" && parsed.fields.privacyConfirmed !== "true") {
      return json(res, 400, { ok: false, error: "Privacy confirmation is required before uploading project media." });
    }
    const selected = analyze(parsed.files || []).filter((file) => file.qualityScore >= 0.45 && !file.duplicate);
    const uploaded = [];
    for (const file of selected) {
      uploaded.push({ ...file, ...(await uploadCloudinary(file, `comphelp-service/projects/${slugify(parsed.fields.service)}`)) });
    }
    const plan = await mediaPlan(uploaded, parsed.fields);
    const galleryItems = uploaded.filter((file) => file.mediaUrl).map((file, index) => ({
      id: `gallery_${Date.now()}_${index}`,
      title: clean(parsed.fields.title || parsed.fields.projectTitle, 160) || `${clean(parsed.fields.service, 120)} project`,
      description: clean(parsed.fields.description || parsed.fields.notes, 700),
      service: clean(parsed.fields.service, 120),
      serviceKey: serviceKey(clean(parsed.fields.service, 120)),
      city: clean(parsed.fields.city, 80),
      date: clean(parsed.fields.completionDate || parsed.fields.projectDate, 60) || new Date().toISOString().slice(0, 10),
      mediaType: file.mediaType,
      mediaUrl: file.mediaUrl,
      caption: plan.caption,
      altText: `${clean(parsed.fields.title || parsed.fields.service, 160)} in ${clean(parsed.fields.city, 80)} by CompHelp Service`,
      source: "marketplace_project_upload",
      status: "published",
      qualityScore: file.qualityScore,
      qualityWarnings: file.warnings,
      cloudinaryPublicId: file.cloudinaryPublicId
    }));
    const gallerySave = await appendGallery(galleryItems);
    const project = {
      id: `project_${Date.now()}`,
      created_at: new Date().toISOString(),
      customer_name: clean(parsed.fields.customerName, 120),
      service: clean(parsed.fields.service, 120),
      title: clean(parsed.fields.title, 160),
      city: clean(parsed.fields.city, 80),
      status: clean(parsed.fields.status, 80),
      completion_date: clean(parsed.fields.completionDate, 60),
      follow_up_date: clean(parsed.fields.followUpDate, 60),
      notes: clean(parsed.fields.notes, 1500),
      before_after_notes: clean(parsed.fields.beforeAfterNotes, 1200),
      customer_review: clean(parsed.fields.customerReview, 1200),
      gallery_items: galleryItems,
      media_plan: plan
    };
    const saved = await supabaseInsert(project);
    return json(res, 200, { ok: true, project: saved, selectedMedia: uploaded.length, galleryItems, gallerySave, mediaPlan: plan });
  } catch (error) {
    return json(res, 500, { ok: false, error: error.message || "Project upload failed." });
  }
};

module.exports.config = {
  api: {
    bodyParser: false
  }
};
