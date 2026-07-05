const { identityReadiness } = require("./identity-service");
const { identityHealth } = require("./identity-health");
const { identityAudit } = require("./identity-audit");
const { validateIdentity, validatePermissions, validateRole } = require("./identity-validator");

function status() {
  return identityReadiness();
}

function health() {
  return identityHealth();
}

module.exports = {
  audit: identityAudit,
  health,
  status,
  validateIdentity,
  validatePermissions,
  validateRole
};
