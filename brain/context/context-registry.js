const { customerContext } = require("./customer-context");
const { organizationContext } = require("./organization-context");
const { sessionContext } = require("./session-context");
const { jobContext } = require("./job-context");
const { conversationContext } = require("./conversation-context");
const { technicianContext } = require("./technician-context");

const providers = {
  customer: customerContext,
  organization: organizationContext,
  session: sessionContext,
  job: jobContext,
  conversation: conversationContext,
  technician: technicianContext
};

function registry() {
  return Object.keys(providers).map((key) => ({
    key,
    status: "registered",
    provides: `${key} context`
  }));
}

function status() {
  return {
    ok: true,
    status: "ready",
    providerCount: registry().length,
    providers: registry()
  };
}

module.exports = { providers, registry, status };
