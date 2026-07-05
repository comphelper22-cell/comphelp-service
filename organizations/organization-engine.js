const { organizationModel, organizationStatus } = require("./organization-service");
const { validateOrganization } = require("./organization-validator");

function status(input = {}) {
  return organizationStatus(input);
}

module.exports = {
  organizationModel,
  status,
  validateOrganization
};
