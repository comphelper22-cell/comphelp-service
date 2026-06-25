const { logAction } = require("./logAction");

function clean(value, max = 1000) {
  return String(value || "").trim().slice(0, max);
}

function createOutreachMessage(input = {}) {
  const audience = clean(input.audience, 160) || "local small businesses";
  const service = clean(input.service, 140) || "Security Camera Installation";
  const channel = clean(input.channel, 40) || "email";
  const city = clean(input.city, 120) || "Los Angeles";

  const messages = {
    email: {
      subject: `${service} help for ${city} businesses`,
      body: `Hi,\n\nI'm reaching out from CompHelp Service. We help ${audience} with ${service}, WiFi setup, smart home devices, and computer repair.\n\nIf you are planning upgrades or want better coverage for entrances, parking, or work areas, we can provide a free estimate.\n\nCompHelp Service\n+1 (747) 295-1440\ncomphelper22@gmail.com`
    },
    sms: {
      body: `Hi, this is CompHelp Service. We help ${city} businesses with ${service}, WiFi, smart devices, and computer repair. Reply if you want a free estimate.`
    },
    nextdoor: {
      body: `Local ${city} service: CompHelp Service helps with security camera installation, smart home setup, WiFi installation, and computer repair. Free estimates available.`
    },
    marketplace: {
      title: `${service} - CompHelp Service`,
      body: `CompHelp Service provides ${service}, smart home setup, WiFi installation, and computer repair in ${city} and nearby areas. Call +1 (747) 295-1440 for a free estimate.`
    }
  };

  const result = {
    ok: true,
    draftOnly: true,
    channel,
    audience,
    service,
    city,
    message: messages[channel] || messages.email,
    safety: "Do not send to opted-out contacts. Do not mass-message without consent and local compliance review."
  };

  logAction("createOutreachMessage", result);
  return result;
}

module.exports = {
  createOutreachMessage
};
