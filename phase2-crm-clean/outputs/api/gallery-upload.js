const crypto = require("crypto");

const MAX_FILE_BYTES = 25 * 1024 * 1024;
const MAX_FILES = 8;

const SERVICE_LABELS = {
  "security-camera-installation": "Security Camera Installation",
  "smart-home-setup": "Smart Home Setup",
  "wifi-network-installation": "WiFi & Network Installation",
  "computer-repair": "Computer Repair",
  "data-recovery": "Data Recovery"
};

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

function clean(value, max = 500) {
  return String(value || "").trim().slice(0, max);
}

function slugify(value) {
  return clean(value, 120)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "project";
}

function getRawBody(req) {
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
  const contentType = req.headers["content-type"] || "";
  const match = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
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
    const nameMatch = headerText.match(/name="([^"]+)"/i);
    if (!nameMatch) continue;
    const fieldName = nameMatch[1];
    const fileNameMatch = headerText.match(/filename="([^"]*)"/i);
    const typeMatch = headerText.match(/content-type:\s*([^\r\n]+)/i);

    if (fileNameMatch && fileNameMatch[1]) {
      files.push({
        fieldName,
        fileName: clean(fileNameMatch[1], 180),
        contentType: clean(typeMatch && typeMatch[1], 120) || "application/octet-stream",
        buffer: content,
        size: content.length
      });
    } else {
      fields[fieldName] = content.toString("utf8").trim();
    }
  }

  return { fields, files };
}

function analyzeMedia(files) {
  return files.map((file) => {
    const isImage = /^image\//.test(file.contentType);
    const isVideo = /^video\//.test(file.contentType);
    const warnings = [];
    let qualityScore = 0.78;

    if (!isImage && !isVideo) {
      qualityScore = 0;
      warnings.push("Unsupported media type.");
    }
    if (file.size < 80 * 1024) {
      qualityScore -= 0.35;
      warnings.push("File may be low resolution.");
    }
    if (/blur|blurry|bad|duplicate|test/i.test(file.fileName)) {
      qualityScore -= 0.3;
      warnings.push("Filename suggests review may be needed.");
    }

    return {
      ...file,
      mediaType: isVideo ? "video" : "image",
      qualityScore: Math.max(0, Math.min(1, qualityScore)),
      warnings
    };
  });
}

function selectBestMedia(files) {
  const seen = new Set();
  return files
    .filter((file) => {
      const key = `${file.fileName.toLowerCase()}-${file.size}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return file.qualityScore >= 0.45;
    })
    .sort((a, b) => b.qualityScore - a.qualityScore || b.size - a.size)
    .slice(0, MAX_FILES);
}

function cloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary environment variables are required.");
  }
  return { cloudName, apiKey, apiSecret };
}

async function uploadToCloudinary(file, folder) {
  const config = cloudinaryConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const publicId = `${slugify(file.fileName.replace(/\.[^.]+$/, ""))}-${timestamp}`;
  const resourceType = file.mediaType === "video" ? "video" : "image";
  const signaturePayload = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${config.apiSecret}`;
  const signature = crypto.createHash("sha1").update(signaturePayload).digest("hex");
  const form = new FormData();
  const blob = new Blob([file.buffer], { type: file.contentType });

  form.append("file", blob, file.fileName);
  form.append("api_key", config.apiKey);
  form.append("timestamp", String(timestamp));
  form.append("folder", folder);
  form.append("public_id", publicId);
  form.append("signature", signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/${resourceType}/upload`, {
    method: "POST",
    body: form
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error && data.error.message ? data.error.message : "Cloudinary upload failed.");
  }
  return {
    mediaUrl: data.secure_url,
    cloudinaryPublicId: data.public_id,
    width: data.width || null,
    height: data.height || null,
    bytes: data.bytes || file.size
  };
}

async function githubRequest(path, options = {}) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN is required.");
  const response = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      "Accept": "application/vnd.github+json",
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(options.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "GitHub API request failed.");
  }
  return data;
}

async function readGalleryData() {
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || "main";
  const dataPath = process.env.GITHUB_GALLERY_PATH || "data/gallery.json";
  if (!repo) throw new Error("GITHUB_REPO is required.");

  try {
    const file = await githubRequest(`/repos/${repo}/contents/${encodeURIComponent(dataPath).replace(/%2F/g, "/")}?ref=${encodeURIComponent(branch)}`);
    const content = Buffer.from(file.content || "", "base64").toString("utf8");
    return {
      repo,
      branch,
      dataPath,
      sha: file.sha,
      data: JSON.parse(content)
    };
  } catch (error) {
    if (/not found/i.test(error.message)) {
      return {
        repo,
        branch,
        dataPath,
        sha: null,
        data: { version: 1, updatedAt: new Date().toISOString(), items: [] }
      };
    }
    throw error;
  }
}

async function commitGalleryData(items, metadata) {
  const current = await readGalleryData();
  const data = current.data && typeof current.data === "object" ? current.data : {};
  data.version = data.version || 1;
  data.updatedAt = new Date().toISOString();
  data.items = Array.isArray(data.items) ? data.items.concat(items) : items;

  const body = {
    message: `Add gallery project: ${metadata.projectName}`,
    content: Buffer.from(JSON.stringify(data, null, 2) + "\n", "utf8").toString("base64"),
    branch: current.branch
  };
  if (current.sha) body.sha = current.sha;

  await githubRequest(`/repos/${current.repo}/contents/${encodeURIComponent(current.dataPath).replace(/%2F/g, "/")}`, {
    method: "PUT",
    body: JSON.stringify(body)
  });

  return data;
}

function createSocialDrafts(metadata, item) {
  const tags = [
    "#CompHelpService",
    `#${metadata.city.replace(/\s+/g, "")}`,
    `#${metadata.service.replace(/[^A-Za-z0-9]/g, "")}`,
    "#LosAngelesCounty"
  ];
  return {
    instagram: `${metadata.description}\n\n${metadata.service} in ${metadata.city} by CompHelp Service.\n\n${tags.join(" ")}`,
    facebook: `${metadata.projectName}: ${metadata.description} Need help with ${metadata.service.toLowerCase()}? Call CompHelp Service at +1 (747) 295-1440.`,
    tiktok: [
      `Show the completed ${metadata.service.toLowerCase()} result.`,
      `Voiceover: "CompHelp Service completed this ${metadata.service.toLowerCase()} project in ${metadata.city}."`,
      "End with: Call +1 (747) 295-1440 for a free estimate."
    ],
    googleBusinessProfile: `${metadata.service} in ${metadata.city}: ${metadata.description} Contact CompHelp Service for a free estimate.`,
    hashtags: tags,
    primaryMediaUrl: item.mediaUrl
  };
}

async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { success: false, error: "Method not allowed." });
  }

  try {
    const expectedSecret = process.env.ADMIN_UPLOAD_SECRET;
    if (!expectedSecret) {
      return json(res, 500, { success: false, error: "ADMIN_UPLOAD_SECRET is not configured." });
    }

    const body = await getRawBody(req);
    const parsed = parseMultipart(req, body);
    const adminSecret = clean(req.headers["x-admin-upload-secret"] || parsed.fields.adminSecret, 500);

    if (!adminSecret || adminSecret !== expectedSecret) {
      return json(res, 401, { success: false, error: "Invalid admin code." });
    }

    if (parsed.fields.privacyConfirmed !== "on" && parsed.fields.privacyConfirmed !== "true") {
      return json(res, 400, { success: false, error: "Privacy confirmation is required." });
    }

    const serviceKey = clean(parsed.fields.serviceKey, 80);
    const service = SERVICE_LABELS[serviceKey] || clean(parsed.fields.service, 120);
    if (!Object.values(SERVICE_LABELS).includes(service)) {
      return json(res, 400, { success: false, error: "Valid service type is required." });
    }

    const metadata = {
      projectName: clean(parsed.fields.projectName, 140),
      city: clean(parsed.fields.city, 80),
      service,
      serviceKey: serviceKey || slugify(service),
      date: clean(parsed.fields.projectDate, 30),
      description: clean(parsed.fields.description, 700),
      pageUrl: clean(parsed.fields.pageUrl, 500)
    };

    if (!metadata.projectName || !metadata.city || !metadata.date || !metadata.description) {
      return json(res, 400, { success: false, error: "Project name, city, date, and description are required." });
    }

    const analyzed = analyzeMedia(parsed.files || []);
    const selected = selectBestMedia(analyzed);
    if (!selected.length) {
      return json(res, 400, { success: false, error: "No publishable photos or videos were selected." });
    }

    const folder = `comphelp-service/${metadata.serviceKey}`;
    const uploaded = [];
    for (const file of selected) {
      uploaded.push({ ...file, ...(await uploadToCloudinary(file, folder)) });
    }

    const galleryItems = uploaded.map((file, index) => ({
      id: `${metadata.serviceKey}-${Date.now()}-${index}`,
      title: index === 0 ? metadata.projectName : `${metadata.projectName} ${index + 1}`,
      description: metadata.description,
      service: metadata.service,
      serviceKey: metadata.serviceKey,
      city: metadata.city,
      date: metadata.date,
      mediaType: file.mediaType,
      mediaUrl: file.mediaUrl,
      caption: `${metadata.service} project completed in ${metadata.city}.`,
      altText: `${metadata.projectName} - ${metadata.service} in ${metadata.city} by CompHelp Service`,
      source: "admin_upload_panel",
      status: "published",
      createdAt: new Date().toISOString(),
      cloudinaryPublicId: file.cloudinaryPublicId,
      qualityScore: file.qualityScore,
      qualityWarnings: file.warnings
    }));

    await commitGalleryData(galleryItems, metadata);

    return json(res, 200, {
      success: true,
      selectedCount: selected.length,
      savedCount: galleryItems.length,
      items: galleryItems,
      socialDrafts: createSocialDrafts(metadata, galleryItems[0])
    });
  } catch (error) {
    return json(res, 500, {
      success: false,
      error: error.message || "Gallery upload failed."
    });
  }
}

module.exports = handler;
module.exports.config = {
  api: {
    bodyParser: false
  }
};
