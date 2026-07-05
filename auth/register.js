const { validateIdentity } = require("../identity/identity-validator");

function register(input = {}) {
  const validation = validateIdentity(input);
  if (!validation.ok) return { ok: false, error: validation.errors.join(",") };
  return {
    ok: true,
    data: {
      registered: false,
      architectureOnly: true,
      organizationId: input.organizationId || "demo-org",
      role: input.role || "Guest",
      passwordStored: false,
      message: "Registration validates shape only; no real account is created."
    }
  };
}

module.exports = {
  register
};
