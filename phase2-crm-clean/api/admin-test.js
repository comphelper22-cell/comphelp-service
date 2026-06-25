function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return json(res, 405, { ok: false, error: "Method not allowed" });
  }

  return json(res, 200, {
    ok: true,
    adminConfigured: Boolean(process.env.MARKETPLACE_ADMIN_SECRET || process.env.ADMIN_UPLOAD_SECRET),
    managerConfigured: Boolean(process.env.MARKETPLACE_MANAGER_SECRET),
    viewerConfigured: Boolean(process.env.MARKETPLACE_VIEWER_SECRET)
  });
};
