const assert = require("assert");
const fs = require("fs");
const path = require("path");

const homepage = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
assert.ok(homepage.includes('chatEndpoint: "/api/system"'), "Homepage chatbot must use the deployed public system endpoint.");
assert.ok(!homepage.includes('chatEndpoint: "/api/chat"'), "Homepage must not use the broken /api/chat alias.");

console.log(JSON.stringify({ ok: true, publicChatRoute: "configured" }, null, 2));
