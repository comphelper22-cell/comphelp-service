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
SOCIAL_OUTREACH_DAILY_LIMIT=10
FOLLOWUP_DAILY_LIMIT=20
OUTREACH_PAUSED=true
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
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

Create a timestamped project backup:

```bash
npm run backup-project
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
npm run social-lead-finder-agent
npm run social-outreach-agent
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

## Phase 6 Business Operating System

Files:

- `database/index.js`
- `database/leads.js`
- `database/vendors.js`
- `database/projects.js`
- `database/estimates.js`
- `database/customers.js`
- `database/tasks.js`
- `database/activity.js`
- `database/settings.js`
- `agents/business-os-agent.js`
- `api/business-os.js`
- `scripts/backup-project.js`

Responsibilities:

- Use Supabase when `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are configured.
- Fall back to `data/marketplace.json` automatically when Supabase is not configured.
- Manage CRM records for leads, customers, vendors, estimates, projects, tasks, invoices, notes, and activity.
- Generate estimate outputs with labor, materials, travel, tax, markup, commission, profit, margin, and PDF-ready quote content.
- Rank vendors and create dispatcher recommendations.
- Generate daily, weekly, monthly, quarterly, and yearly business analytics.
- Produce `logs/database-report.json`, `logs/business-report.json`, `logs/backup-report.json`, and `logs/phase6-report.json`.
- Extend the Marketplace Developer Center with database, backup, Supabase, JSON, API, and deployment readiness health checks.

API route:

```text
/api/business-os
```

Supported actions:

```text
dashboard
crm
estimate
dispatch
analytics
reports
databaseHealth
```

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

## Instagram and TikTok Customer Finder

Files:

- `agents/social-lead-finder-agent.js`
- `agents/social-outreach-agent.js`
- `api/social-leads.js`
- `data/social-leads.json`
- `data/social-outreach-queue.json`

Dashboard tab: `Social Leads`

What it does:

- Creates review records from public Instagram/TikTok hashtag and profile targets.
- Saves platform, profile name, profile URL, business type, city, possible service need, lead reason, and `needs_review` status.
- Creates short outreach drafts only.
- Generates a 7-day Instagram/TikTok content plan with reels, captions, hashtags, voiceover notes, schedule, and free-estimate CTAs.
- Shows Instagram leads, TikTok leads, draft count, daily limit, sent today, and paused status.

Safety behavior:

- No auto-DMs, auto-comments, likes, follows, or platform scraping.
- No private data collection or platform-limit bypassing.
- Social outreach drafts require owner approval before sending.
- Default cap is 10 new social outreach drafts per day.
- Duplicate draft messages are blocked.
- Spammy or overpromising wording is rejected.
- Outreach can be paused from the Social Leads dashboard tab.

## AI Business Operating System

The Marketplace Manager is now the CompHelp Service business operating system. It runs from `marketplace.html` and the Supabase-aware API route `api/marketplace.js`.

Core modules:

- CRM Pipeline: tracks leads through New Lead, Contacted, Quote Sent, Follow-up, Won, and Lost. Lead records include name, phone, email, Instagram, TikTok, source, service, city, notes, and status.
- AI Estimate Generator: accepts service, city, job size, cameras/devices, labor hours, material cost, urgency, and notes. It returns low/high/recommended pricing, customer quote text, internal cost, expected profit, and a printable/PDF quote page.
- Vendor Network: stores partner vendors with category, phone, email, website, city, service area, rating, availability, commission percentage, notes, and status. It supports add/edit, ranked matching to projects, vendor quote request drafts, and commission draft tracking.
- Developer Center: analyzes changed files, syntax issues, duplicate code, missing imports, possible unused files, validation status, git status, recent commits, and deployment readiness. It writes `logs/developer-report.json`, `logs/validation-report.json`, and `logs/deployment-report.json`. Pushes and deployments require owner approval.
- Lead Finder: creates approval-ready public source searches for Google Maps, Yelp, Facebook, Craigslist, Angi, and Thumbtack. It does not scrape private data or contact leads automatically.
- Vendor Finder: stores vendor profiles by service category, rating, service area, and commission percentage.
- AI Dispatcher: drafts job routing, vendor quote requests, vendor comparison, customer price, and commission revenue.
- Follow-up Agent: creates business-hours SMS/email drafts with human-like timing and approval requirements.
- SMM Manager: creates reels, captions, hashtags, voiceovers, and posting schedules.
- SEO Manager: creates city page ideas, service page ideas, blog ideas, metadata, FAQ ideas, and schema direction.
- Project Manager: stores project details, gallery notes, before/after notes, reviews, and follow-up reminders.
- Commission Marketplace: tracks project value, selected vendor, commission percentage, expected commission, paid commission, and payment status.
- Analytics Dashboard: shows revenue, commissions, leads, conversion rate, vendor performance, marketing drafts, source leads, dispatches, and follow-ups.
- Deployment Dashboard: shows GitHub/Vercel automation readiness, branch, repo, and recent deployment logs.

Run `supabase.marketplace.sql` in Supabase before production launch. The required production tables are:

- `marketplace_leads`
- `marketplace_source_leads`
- `marketplace_vendors`
- `marketplace_estimates`
- `marketplace_quote_requests`
- `marketplace_dispatches`
- `marketplace_commissions`
- `marketplace_projects`
- `marketplace_followups`
- `marketplace_message_queue`
- `marketplace_opt_outs`
- `marketplace_activity_logs`
- `marketplace_marketing_ideas`
- `marketplace_media_reviews`

Vercel environment variables:

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
MARKETPLACE_ADMIN_SECRET=
MARKETPLACE_MANAGER_SECRET=
MARKETPLACE_VIEWER_SECRET=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
PUBLIC_SITE_URL=https://comphelp-service.vercel.app
```

Optional integrations:

```env
GOOGLE_MAPS_API_KEY=
YELP_API_KEY=
META_ACCESS_TOKEN=
RESEND_API_KEY=
LEAD_FROM_EMAIL=
N8N_LEAD_WEBHOOK_URL=
N8N_VENDOR_QUOTE_WEBHOOK_URL=
VAPI_PROJECT_WEBHOOK_URL=
```

Production mode checklist:

1. Run `supabase.marketplace.sql` in Supabase.
2. Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in Vercel.
3. Add admin role secrets in Vercel.
4. Open `/marketplace` and log in with the admin code.
5. Add a lead and confirm it appears in `marketplace_leads`.
6. Add a vendor and confirm it appears in `marketplace_vendors`.
7. Add a project or upload media and confirm it appears in `marketplace_projects`.
8. Create an estimate and open the quote URL.
9. Create a queue draft and confirm it appears in `marketplace_message_queue`.
10. Check Activity Logs for saved lead, estimate, vendor, project, and queue events.
11. Check the Deployment tab for GitHub/Vercel automation readiness.

SMS/email queue safety:

- Queue records are stored in Supabase when configured.
- Cold outreach requires approval.
- Default outreach limit is 10 per day.
- Default follow-up limit is 20 per day.
- Duplicate messages are blocked.
- Recipients contacted within 7 days are blocked unless they replied.
- Opt-outs are checked before queueing.
- SMS queue drafts automatically include STOP opt-out language.
- The system creates drafts/queue records only. Actual sending requires approved integrations and owner-controlled workflow.

Provider compliance:

- Do not use the system to evade Gmail, Facebook, Google, Twilio, Meta, or other provider rules.
- Keep messages permission-based whenever possible.
- Use approval, opt-outs, low daily limits, human review, and business-hours sending.
- Do not bulk-send or repeatedly contact people who did not respond.
- Keep all outreach logs for audits and customer preference tracking.

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
