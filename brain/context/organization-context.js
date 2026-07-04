function organizationContext(input = {}) {
  const organization = input.currentOrganization || input.organization || { name: "CompHelp AI", serviceArea: "Los Angeles" };
  return {
    key: "organization",
    label: "Organization",
    score: organization ? 95 : 70,
    missing: organization ? [] : ["currentOrganization"],
    data: organization
  };
}

module.exports = { organizationContext };
