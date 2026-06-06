const fs = require("fs");
const path = require("path");
const { updateWebsite } = require("./tools/updateWebsite");
const { createSeoPage } = require("./tools/createSeoPage");
const { createBlogPost } = require("./tools/createBlogPost");
const { saveLead } = require("./tools/saveLead");
const { analyzeMarket } = require("./tools/analyzeMarket");
const { findBusinessIdeas } = require("./tools/findBusinessIdeas");
const { createSocialPost } = require("./tools/createSocialPost");
const { createTikTokScript } = require("./tools/createTikTokScript");
const { createContentCalendar } = require("./tools/createContentCalendar");
const { createOutreachMessage } = require("./tools/createOutreachMessage");
const { sendFollowUp } = require("./tools/sendFollowUp");
const { githubCommit } = require("./tools/githubCommit");
const { vercelDeploy } = require("./tools/vercelDeploy");
const { postToFacebook } = require("./tools/postToFacebook");
const { postToInstagram } = require("./tools/postToInstagram");
const { createTikTokDraft } = require("./tools/createTikTokDraft");
const { logAction } = require("./tools/logAction");

const PROJECT_ROOT = __dirname;
const CONFIG_PATH = path.join(PROJECT_ROOT, "config.json");
const PROMPT_DIR = path.join(PROJECT_ROOT, "prompts");
const DEFAULT_MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readPrompt(name) {
  return fs.readFileSync(path.join(PROMPT_DIR, name), "utf8");
}

function clean(value, max = 5000) {
  return String(value || "").trim().slice(0, max);
}

function loadInstructions(mode = "system") {
  const prompts = [readPrompt("system-prompt.txt")];
  const promptMap = {
    market: "market-research.txt",
    social: "social-media.txt",
    ideas: "business-ideas.txt",
    seo: "seo-page.txt",
    blog: "blog-post.txt",
    customer: "customer-assistant.txt"
  };
  if (promptMap[mode]) prompts.push(readPrompt(promptMap[mode]));
  return prompts.join("\n\n");
}

const config = readJson(CONFIG_PATH);

const toolHandlers = {
  updateWebsite,
  createSeoPage,
  createBlogPost,
  saveLead,
  analyzeMarket,
  findBusinessIdeas,
  createSocialPost,
  createTikTokScript,
  createContentCalendar,
  createOutreachMessage,
  sendFollowUp,
  githubCommit,
  vercelDeploy,
  postToFacebook,
  postToInstagram,
  createTikTokDraft,
  createQuote: async (input = {}) => {
    const service = clean(input.service, 140);
    const details = clean(input.details, 1200);
    const startingPrice = config.approvedStartingPrices[service] || "Free estimate required";
    return {
      ok: true,
      quoteDraft: {
        service,
        startingPrice,
        details,
        disclaimer: "Final pricing depends on property details, equipment, wiring, access, and appointment scope.",
        nextStep: "Collect name, phone, email, address, and preferred date for a free estimate."
      }
    };
  },
  summarizeDailyLeads: async (input = {}) => ({
    ok: true,
    reportType: "daily",
    leads: clean(input.leads || input.leadsSummary || "No lead data provided.", 5000),
    websiteChanges: clean(input.websiteChanges || "No website changes provided.", 3000),
    socialPostsCreated: clean(input.socialPostsCreated || "No social drafts provided.", 3000),
    marketOpportunities: clean(input.marketOpportunities || "Review camera, WiFi, and smart home demand by area.", 3000),
    recommendedNextActions: [
      "Call new leads with phone numbers.",
      "Follow up with leads missing address or preferred date.",
      "Create one local SEO or social draft for the highest-demand service.",
      "Review any pending approvals before commit, deploy, send, or post."
    ]
  }),
  summarizeWeeklyBusiness: async (input = {}) => ({
    ok: true,
    reportType: "weekly",
    bestKeywords: input.bestKeywords || [
      "security camera installation Los Angeles",
      "security camera installation Burbank",
      "WiFi installation Los Angeles",
      "computer repair Los Angeles"
    ],
    bestContentIdeas: input.bestContentIdeas || [
      "How many cameras does a small business need?",
      "Why security cameras need strong WiFi",
      "Smart home setup checklist for Los Angeles homes"
    ],
    newRevenueIdeas: input.newRevenueIdeas || [
      "Monthly camera health checks",
      "WiFi optimization add-on",
      "Small business tech care plan"
    ],
    competitorUpdates: clean(input.competitorUpdates || "No live competitor updates provided.", 3000),
    seoSuggestions: [
      "Create service-area pages for WiFi and smart home setup.",
      "Add internal links from blog posts to local service pages.",
      "Keep sitemap updated after each approved page."
    ]
  }),
  prepareGoogleBusinessPost: async (input = {}) => {
    const service = clean(input.service, 140) || "Security Camera Installation";
    const city = clean(input.city, 120) || "Los Angeles";
    return {
      ok: true,
      draftOnly: true,
      post: `Need ${service} in ${city}? CompHelp Service helps with security cameras, smart home setup, WiFi installation, and computer repair. Request a free estimate: +1 (747) 295-1440`
    };
  },
  checkBrokenLinks: async () => {
    const htmlFiles = fs.readdirSync(PROJECT_ROOT).filter((file) => file.endsWith(".html"));
    const links = [];
    for (const file of htmlFiles) {
      const html = fs.readFileSync(path.join(PROJECT_ROOT, file), "utf8");
      const matches = html.matchAll(/href=["']([^"']+)["']/g);
      for (const match of matches) {
        const href = match[1];
        if (href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("#")) continue;
        links.push({ file, href });
      }
    }
    return {
      ok: true,
      checkedMode: "local_href_scan",
      links,
      note: "Live broken-link validation requires crawling the deployed website."
    };
  }
};

const tools = [
  {
    type: "function",
    name: "saveLead",
    description: "Save a qualified customer lead to Google Sheets.",
    parameters: {
      type: "object",
      properties: {
        name: { type: "string" },
        phone: { type: "string" },
        email: { type: "string" },
        address: { type: "string" },
        service: { type: "string" },
        preferredDate: { type: "string" },
        message: { type: "string" },
        source: { type: "string" },
        pageUrl: { type: "string" }
      },
      required: ["name", "phone", "service"]
    }
  },
  {
    type: "function",
    name: "createQuote",
    description: "Create a safe quote draft using approved price language only.",
    parameters: {
      type: "object",
      properties: { service: { type: "string" }, details: { type: "string" } },
      required: ["service"]
    }
  },
  {
    type: "function",
    name: "updateWebsite",
    description: "Preview or apply website edits. Requires approved=true to write.",
    parameters: {
      type: "object",
      properties: {
        filePath: { type: "string" },
        content: { type: "string" },
        replacements: { type: "array", items: { type: "object", properties: { find: { type: "string" }, replace: { type: "string" } }, required: ["find", "replace"] } },
        approved: { type: "boolean" }
      },
      required: ["filePath"]
    }
  },
  {
    type: "function",
    name: "createSeoPage",
    description: "Preview or create a local SEO page. Requires approved=true to write.",
    parameters: {
      type: "object",
      properties: { city: { type: "string" }, service: { type: "string" }, slug: { type: "string" }, approved: { type: "boolean" } },
      required: ["city"]
    }
  },
  {
    type: "function",
    name: "createBlogPost",
    description: "Preview or create a blog article. Requires approved=true to write.",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string" },
        topic: { type: "string" },
        city: { type: "string" },
        description: { type: "string" },
        slug: { type: "string" },
        sections: { type: "array", items: { type: "object", properties: { heading: { type: "string" }, body: { type: "string" } }, required: ["heading", "body"] } },
        approved: { type: "boolean" }
      },
      required: ["title"]
    }
  },
  { type: "function", name: "analyzeMarket", description: "Create a local market and keyword report.", parameters: { type: "object", properties: { service: { type: "string" }, areas: { type: "array", items: { type: "string" } }, query: { type: "string" } } } },
  { type: "function", name: "findBusinessIdeas", description: "Find new money ideas, upsells, recurring plans, partnerships, and B2B targets.", parameters: { type: "object", properties: { focus: { type: "string" } } } },
  { type: "function", name: "createSocialPost", description: "Create Instagram/Facebook/Google Business social post drafts.", parameters: { type: "object", properties: { platform: { type: "string" }, service: { type: "string" }, city: { type: "string" }, postType: { type: "string" } } } },
  { type: "function", name: "createTikTokScript", description: "Create a short TikTok/Reels video script.", parameters: { type: "object", properties: { service: { type: "string" }, city: { type: "string" }, topic: { type: "string" } } } },
  { type: "function", name: "createContentCalendar", description: "Create a weekly social media content calendar.", parameters: { type: "object", properties: { weeks: { type: "number" } } } },
  { type: "function", name: "createOutreachMessage", description: "Create outreach email, SMS, Nextdoor, or Marketplace drafts.", parameters: { type: "object", properties: { audience: { type: "string" }, service: { type: "string" }, city: { type: "string" }, channel: { type: "string" } } } },
  { type: "function", name: "sendFollowUp", description: "Preview or send follow-up SMS/email. Requires approved=true to send.", parameters: { type: "object", properties: { type: { type: "string" }, mode: { type: "string" }, name: { type: "string" }, phone: { type: "string" }, email: { type: "string" }, service: { type: "string" }, approved: { type: "boolean" } } } },
  { type: "function", name: "githubCommit", description: "Preview Git diff or commit/push approved changes.", parameters: { type: "object", properties: { message: { type: "string" }, push: { type: "boolean" }, approved: { type: "boolean" } }, required: ["message"] } },
  { type: "function", name: "vercelDeploy", description: "Preview or trigger Vercel deployment. Requires approved=true to deploy.", parameters: { type: "object", properties: { projectId: { type: "string" }, teamId: { type: "string" }, target: { type: "string" }, approved: { type: "boolean" } } } },
  { type: "function", name: "postToFacebook", description: "Preview or post to Facebook Page. Requires approval unless AUTO_POST=true.", parameters: { type: "object", properties: { message: { type: "string" }, caption: { type: "string" }, approved: { type: "boolean" } } } },
  { type: "function", name: "postToInstagram", description: "Preview or post to Instagram. Requires imageUrl and approval unless AUTO_POST=true.", parameters: { type: "object", properties: { caption: { type: "string" }, message: { type: "string" }, imageUrl: { type: "string" }, approved: { type: "boolean" } } } },
  { type: "function", name: "createTikTokDraft", description: "Create a TikTok draft payload. Requires approval before scheduler/API submission.", parameters: { type: "object", properties: { caption: { type: "string" }, script: { type: "string" }, videoUrl: { type: "string" }, hashtags: { type: "array", items: { type: "string" } }, approved: { type: "boolean" } } } },
  { type: "function", name: "summarizeDailyLeads", description: "Create a daily business report.", parameters: { type: "object", properties: { leads: { type: "string" }, websiteChanges: { type: "string" }, socialPostsCreated: { type: "string" }, marketOpportunities: { type: "string" } } } },
  { type: "function", name: "summarizeWeeklyBusiness", description: "Create a weekly business report.", parameters: { type: "object", properties: { competitorUpdates: { type: "string" } } } },
  { type: "function", name: "prepareGoogleBusinessPost", description: "Draft a Google Business Profile post.", parameters: { type: "object", properties: { service: { type: "string" }, city: { type: "string" } } } },
  { type: "function", name: "checkBrokenLinks", description: "Scan local HTML href values.", parameters: { type: "object", properties: {} } }
];

function extractText(responseJson) {
  if (responseJson.output_text) return responseJson.output_text;
  const parts = [];
  for (const item of responseJson.output || []) {
    for (const content of item.content || []) {
      if (content.type === "output_text" && content.text) parts.push(content.text);
    }
  }
  return parts.join("\n").trim();
}

function getFunctionCalls(responseJson) {
  return (responseJson.output || []).filter((item) => item.type === "function_call");
}

async function callOpenAI(input, previousResponseId, mode) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      instructions: loadInstructions(mode),
      input,
      tools,
      previous_response_id: previousResponseId,
      max_output_tokens: 1100
    })
  });

  const body = await response.json();
  if (!response.ok) throw new Error(body.error?.message || "OpenAI request failed.");
  return body;
}

async function runToolCall(call) {
  const handler = toolHandlers[call.name];
  if (!handler) {
    return { type: "function_call_output", call_id: call.call_id, output: JSON.stringify({ ok: false, error: `Unknown tool: ${call.name}` }) };
  }

  try {
    const args = call.arguments ? JSON.parse(call.arguments) : {};
    const result = await handler(args);
    logAction(`tool.${call.name}`, { args, result });
    return { type: "function_call_output", call_id: call.call_id, output: JSON.stringify(result) };
  } catch (error) {
    const result = { ok: false, error: error.message };
    logAction(`tool.${call.name}.error`, result);
    return { type: "function_call_output", call_id: call.call_id, output: JSON.stringify(result) };
  }
}

async function runAgent(message, options = {}) {
  if (!process.env.OPENAI_API_KEY) {
    return {
      ok: false,
      reply: "OPENAI_API_KEY is not configured. Add it to your environment before running CompHelp Service Business Manager."
    };
  }

  const mode = options.mode || "system";
  const history = Array.isArray(options.history) ? options.history.slice(-12) : [];
  const input = [
    ...history.map((item) => ({ role: item.role === "assistant" ? "assistant" : "user", content: clean(item.content, 5000) })),
    { role: "user", content: clean(message, 5000) }
  ];

  let response = await callOpenAI(input, undefined, mode);
  let calls = getFunctionCalls(response);

  while (calls.length) {
    const outputs = [];
    for (const call of calls) outputs.push(await runToolCall(call));
    response = await callOpenAI(outputs, response.id, mode);
    calls = getFunctionCalls(response);
  }

  const reply = extractText(response);
  logAction("agent.reply", { mode, message, reply });
  return { ok: true, mode, reply, responseId: response.id };
}

async function runCommand(command, args) {
  const text = args.join(" ");
  const commandMap = {
    agent: { mode: "system", message: text || "Act as CompHelp Service Business Manager. What should I do next?" },
    "market-report": { mode: "market", message: text || "Create a weekly market report for CompHelp Service." },
    "create-social-calendar": { mode: "social", message: text || "Create a one-week social content calendar." },
    "create-seo-page": { mode: "seo", message: text || "Create a local SEO page draft. Ask what service and city if missing." },
    "create-blog-post": { mode: "blog", message: text || "Create a blog post draft. Ask for the topic if missing." },
    "update-website": { mode: "seo", message: text || "Help update the website. Ask what change is needed and preview a diff first." },
    "daily-report": { mode: "system", message: text || "Create a daily summary report for CompHelp Service." }
  };
  const selected = commandMap[command] || commandMap.agent;
  return runAgent(selected.message, { mode: selected.mode });
}

async function main() {
  const [command = "agent", ...args] = process.argv.slice(2);
  const result = await runCommand(command, args);
  process.stdout.write(`${result.reply || JSON.stringify(result, null, 2)}\n`);
}

if (require.main === module) {
  main().catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}

module.exports = {
  runAgent,
  runCommand,
  tools,
  toolHandlers,
  config
};
