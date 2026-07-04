const { readTenantData } = require("./tenant-context");

function settings(input = {}) {
  const data = readTenantData(input);
  const settingRows = data.settings.map((setting) => ({
    key: setting.key || setting.name || "setting",
    value: setting.value !== undefined ? setting.value : "",
    scope: setting.scope || "tenant",
    status: setting.status || "active"
  }));
  return {
    ok: true,
    data: {
      settings: settingRows,
      preferences: data.preferences,
      jsonFallbackOnly: true,
      supabaseReady: false,
      recommendedSettings: [
        "tenant_slug",
        "default_timezone",
        "business_industry",
        "approval_required",
        "data_retention_policy"
      ],
      generatedAt: new Date().toISOString()
    }
  };
}

module.exports = { settings };
