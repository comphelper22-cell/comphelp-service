const path = require("path");

const outputMediaAgent = path.join(__dirname, "outputs", "media-agent.js");

async function main() {
  try {
    const agent = require(outputMediaAgent);
    const command = process.argv[2] || "media-agent";
    const args = Object.fromEntries(process.argv.slice(3).map((arg) => {
      const [key, value = true] = arg.replace(/^--/, "").split("=");
      return [key, value];
    }));
    const result = await agent.run(command, args);
    console.log(JSON.stringify(result, null, 2));
    if (result && result.ok === false) process.exitCode = 1;
  } catch (error) {
    console.error(JSON.stringify({
      ok: false,
      error: error.message,
      note: "Root media-agent delegates to outputs/media-agent.js."
    }, null, 2));
    process.exitCode = 1;
  }
}

if (require.main === module) main();

module.exports = { main };
