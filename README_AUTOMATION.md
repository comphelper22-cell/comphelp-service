# CompHelp Service Automation

This repository includes automation and business operations agents for CompHelp Service.

Brand rule: always use `CompHelp Service` in public branding. Never use the old public branding.

## Required Environment Variables

Set these in the automation environment:

```env
GITHUB_TOKEN=
GITHUB_REPO=comphelper22-cell/comphelp-service
GITHUB_BRANCH=main
VERCEL_TOKEN=
VERCEL_PROJECT_ID=
VERCEL_TEAM_ID=
AUTO_DEPLOY=true
AUTO_POST=false
APPROVAL_REQUIRED=true
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=
RESEND_API_KEY=
LEAD_FROM_EMAIL=
OUTREACH_DAILY_LIMIT=10
FOLLOWUP_DAILY_LIMIT=20
OUTREACH_PAUSED=true
```

Optional:

```env
VERCEL_DEPLOY_HOOK_URL=
COMMIT_MESSAGE=Automated CompHelp Service update
```

## Commands

Check deployment configuration:

```bash
npm run setup-env
```

Validate project:

```bash
npm run check-project
```

Validate, push to GitHub, and trigger Vercel deployment:

```bash
npm run auto-deploy
```

Push changed files to GitHub main branch:

```bash
npm run github-push
```

Trigger Vercel deployment:

```bash
npm run vercel-deploy
```

Run business agents:

```bash
npm run marketplace-agent
npm run lead-finder-agent
npm run smm-agent
npm run seo-agent
npm run estimate-agent
npm run vendor-agent
npm run dispatcher-agent
npm run followup-agent
npm run compliance-agent
npm run media-agent
```

## Auto GitHub Push Agent

File: `scripts/github-push.js`

What it does:

- Runs `scripts/check-project.js`.
- Validates JavaScript syntax.
- Validates JSON files.
- Validates `package.json`.
- Validates `vercel.json`.
- Detects changed files by comparing local blob hashes with GitHub tree hashes.
- Creates a GitHub commit through the GitHub API.
- Pushes to `GITHUB_BRANCH`, default `main`.
- Does not delete remote files.
- Does not push if validation fails.

## Auto Vercel Deploy Agent

File: `scripts/vercel-deploy.js`

What it does:

- Triggers deployment through `VERCEL_DEPLOY_HOOK_URL` when present.
- Otherwise uses `VERCEL_TOKEN` and `VERCEL_PROJECT_ID`.
- Checks deployment status when Vercel returns a deployment id.
- Reports live URL and errors.

## Marketplace Operations Agent

File: `agents/marketplace-agent.js`

Responsibilities:

- Manage leads, vendors, estimates, quote requests, and commissions.
- Recommend cheapest qualified vendor.
- Calculate expected commission and profit.
- Create customer quote outputs.

## SMM Agent

File: `agents/smm-agent.js`

Responsibilities:

- Create Instagram posts.
- Create Facebook posts.
- Create TikTok scripts.
- Create reel and slideshow ideas.
- Create captions, hashtags, voiceover scripts, and schedules.
- Never auto-post unless `AUTO_POST=true`.

## Media Agent

File: `media-agent.js`

The root media agent delegates to the existing `outputs/media-agent.js` implementation.

Responsibilities:

- Watch `uploads/new`.
- Analyze uploaded photos/videos.
- Select best media.
- Detect blurry or duplicate media.
- Create gallery items.
- Create SMM drafts.
- Update website gallery after approval.

## SEO Agent

File: `agents/seo-agent.js`

Responsibilities:

- Create city SEO page plans.
- Create service SEO page plans.
- Create blog ideas.
- Recommend sitemap updates.
- Improve metadata and schema ideas.

## Estimate Agent

File: `agents/estimate-agent.js`

Responsibilities:

- Generate customer estimates.
- Generate PDF quote links.
- Generate internal cost estimates.
- Calculate low, high, and recommended pricing.
- Calculate commission and profit.

## Vendor Finder Agent

File: `agents/vendor-finder-agent.js`

Responsibilities:

- Store and compare vendor lists.
- Track vendor categories.
- Track commission percent.
- Track vendor quote response fields.

## Safe Sales Automation

Files:

- `agents/lead-finder-agent.js`
- `agents/vendor-finder-agent.js`
- `agents/estimate-agent.js`
- `agents/dispatcher-agent.js`
- `agents/followup-agent.js`
- `agents/compliance-agent.js`
- `agents/outreach-core.js`
- `api/outreach.js`
- `api/vendor-dispatch.js`
- `api/estimate.js`
- `api/followups.js`

Required production variables:

```env
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=
RESEND_API_KEY=
LEAD_FROM_EMAIL=
OUTREACH_DAILY_LIMIT=10
FOLLOWUP_DAILY_LIMIT=20
OUTREACH_PAUSED=true
APPROVAL_REQUIRED=true
```

Safety behavior:

- Cold outreach is saved as `needs_approval` by default.
- Outreach starts paused unless `OUTREACH_PAUSED=false`.
- Default cold outreach limit is 10 messages per day.
- Default follow-up limit is 20 messages per day.
- No recipient can be messaged twice in 7 days unless they replied.
- Opt-outs are stored in `data/opt-outs.json`.
- Message drafts, queue entries, replies, failures, and opt-outs are logged.
- SMS drafts include STOP opt-out text.
- The compliance dashboard shows sent messages, pending approvals, opt-outs, failures, bounced emails, waiting leads, waiting vendors, and due follow-ups.
- The marketplace dashboard includes Lead Finder, Vendor Finder, Dispatcher, Follow-ups, and Compliance tabs.

## Safety Rules

- Never delete files automatically.
- Never expose secrets.
- Never hardcode API keys.
- Never auto-post social media unless `AUTO_POST=true`.
- Never send customer emails or SMS without approval.
- Never invent fake reviews.
- Never overwrite important files without backup.
- Always create logs.
- Always show a summary after every run.

## Exact Auto Deploy Flow

Run:

```bash
npm run auto-deploy
```

Flow:

1. `scripts/check-project.js` validates JS and JSON.
2. `scripts/auto-deploy.js` validates required env vars: `GITHUB_TOKEN`, `GITHUB_REPO`, `VERCEL_TOKEN`, `VERCEL_PROJECT_ID`.
3. `scripts/github-push.js` compares changed files against GitHub.
4. If validation passes, changed files are committed to `main`.
5. `scripts/vercel-deploy.js` triggers Vercel deployment.
6. The deployment step waits for Vercel status and prints the live URL.
7. Status and logs are written to `logs/automation.jsonl`.

`AUTO_DEPLOY` defaults to `true`. Set `AUTO_DEPLOY=false` only when you want validation without push/deploy.

If credentials are missing, the command fails safely and prints exactly which variable is missing.

## Required Variables By Platform

GitHub:

```env
GITHUB_TOKEN=
GITHUB_REPO=comphelper22-cell/comphelp-service
GITHUB_BRANCH=main
```

Vercel:

```env
VERCEL_TOKEN=
VERCEL_PROJECT_ID=
VERCEL_TEAM_ID=
```

Automation defaults:

```env
AUTO_DEPLOY=true
AUTO_POST=false
APPROVAL_REQUIRED=true
```
