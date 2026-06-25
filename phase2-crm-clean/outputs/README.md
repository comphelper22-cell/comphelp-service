# CompHelp Service Business Manager

CompHelp Service Business Manager is a Node.js AI business assistant and growth manager for CompHelp Service. It helps with customer questions, lead capture, website updates, local SEO, blog posts, social media drafts, market research, business ideas, outreach, reporting, GitHub commits, and Vercel deployments.

## Business Profile

- Company: CompHelp Service
- Phone: +1 (747) 295-1440
- Email: comphelper22@gmail.com
- Services: Security Camera Installation, Smart Home Setup, WiFi & Network Installation, Computer Repair, Data Recovery
- Areas: Los Angeles, Burbank, Glendale, North Hollywood, Studio City

## Files

- `agent.js` - main OpenAI agent runner and command router.
- `config.json` - business profile, safety defaults, and approved pricing language.
- `package.json` - npm commands.
- `prompts/system-prompt.txt` - main business manager prompt.
- `prompts/market-research.txt` - market research mode.
- `prompts/social-media.txt` - social media mode.
- `prompts/business-ideas.txt` - revenue growth mode.
- `prompts/seo-page.txt` - SEO page mode.
- `prompts/blog-post.txt` - blog content mode.
- `prompts/customer-assistant.txt` - customer assistant mode.
- `tools/updateWebsite.js` - preview or apply website edits with diffs.
- `tools/createSeoPage.js` - preview or create local SEO pages.
- `tools/createBlogPost.js` - preview or create blog posts.
- `tools/saveLead.js` - save leads to Google Sheets.
- `tools/analyzeMarket.js` - local market, keyword, and demand report.
- `tools/findBusinessIdeas.js` - upsells, recurring plans, B2B ideas.
- `tools/createSocialPost.js` - Instagram/Facebook/GBP post drafts.
- `tools/createTikTokScript.js` - short video scripts.
- `tools/createContentCalendar.js` - weekly social calendar.
- `tools/createOutreachMessage.js` - email, SMS, Nextdoor, Marketplace drafts.
- `tools/githubCommit.js` - preview diff, commit, and optionally push after approval.
- `tools/vercelDeploy.js` - preview or trigger approved Vercel deployment.
- `tools/postToFacebook.js` - draft or approved Facebook Page posting.
- `tools/postToInstagram.js` - draft or approved Instagram posting.
- `tools/createTikTokDraft.js` - TikTok draft/scheduler payload.
- `tools/logAction.js` - JSONL action logging.
- `media-agent.js` - auto media website manager for completed job photos/videos.
- `marketplace.html` - admin dashboard for Marketplace Manager V1.
- `api/marketplace.js` - protected marketplace API for leads, estimates, vendors, quote requests, recommendations, commissions, marketing, SMM, analytics, and projects.
- `api/marketplace-quote.js` - printable quote page that can be saved as PDF.
- `assets/marketplace-manager.js` - dashboard JavaScript client.
- `data/marketplace.json` - seed configuration for services, categories, estimate rules, and starter vendors.
- `supabase.marketplace.sql` - Supabase table schema for production storage.
- `config.media.json` - media workflow folders, service mapping, privacy rules, and image settings.
- `tools/watchUploads.js` - watches and lists files in `uploads/new`.
- `tools/analyzeMedia.js` - detects media type, service category, quality warnings, and privacy flags.
- `tools/selectBestMedia.js` - filters duplicates, unsupported files, and low quality uploads.
- `tools/optimizeImages.js` - backs up originals and creates optimized gallery media when possible.
- `tools/privacyBlur.js` - routes privacy-risk media to owner review and blocks publishing until approved.
- `tools/createGalleryItem.js` - creates SEO-friendly gallery JSON and HTML cards.
- `tools/updateServicePage.js` - previews or applies service page gallery updates.
- `tools/createSocialDrafts.js` - creates Instagram, Facebook, TikTok, and Google Business drafts.

## Service Pages

The website includes individual service pages:

- `/security-camera-installation` -> `security-camera-installation.html`
- `/smart-home-setup` -> `smart-home-setup.html`
- `/wifi-network-installation` -> `wifi-network-installation.html`
- `/computer-repair` -> `computer-repair.html`
- `/data-recovery` -> `data-recovery.html`

Each service page includes SEO metadata, canonical URL, OpenGraph tags, LocalBusiness schema, Service schema, hero copy, service details, pricing-starts-at language, FAQ, lead form, contact CTA, and a reusable work gallery section.

## Adding Gallery Media

Use this folder structure:

```text
assets/
gallery/
security-camera-installation/
smart-home-setup/
wifi-network-installation/
computer-repair/
data-recovery/
```

To add a new job photo, before/after image, short video, YouTube embed, or TikTok embed:

1. Put the image/video inside the correct `assets/gallery/service-folder`.
2. Open the matching service page.
3. Find `<!-- ADD NEW JOB MEDIA ITEM HERE -->`.
4. Add a new gallery item and update title, city, date, description, service type, media type, media URL, and caption.
5. Commit and deploy.

Gallery item structure:

```json
{
  "title": "Example job title",
  "description": "Short description of the completed job.",
  "service": "Service name",
  "city": "Los Angeles",
  "date": "2026",
  "mediaType": "image",
  "mediaUrl": "assets/gallery/service-folder/your-file.jpg",
  "caption": "Before/after or job note"
}
```

## Auto Media Website Manager

The Auto Media Website Manager lets the owner upload completed job photos/videos and have the agent stage website gallery updates plus social media drafts.

## Admin Website Gallery Upload Panel

Each individual service page includes an admin-only upload panel that appears only when the URL includes `?admin=true`.

Example:

```text
https://comphelp-service.vercel.app/security-camera-installation?admin=true
```

Admin panel workflow:

1. Open a service page with `?admin=true`.
2. Click `+ Add Project Photos`.
3. Enter the admin code from `ADMIN_UPLOAD_SECRET`.
4. Add project name, city, service type, date, short description, and photos/videos.
5. Confirm privacy safety before uploading.
6. The browser sends the upload to `POST /api/gallery-upload`.

Production architecture:

- Uploaded photos/videos are sent to Cloudinary.
- Approved gallery metadata is committed to `data/gallery.json` through the GitHub API.
- Service pages load additional gallery items from `data/gallery.json`.
- Vercel redeploys from the GitHub commit, depending on the connected project settings.
- Existing static gallery items stay in place.
- The local media-agent upload-folder workflow remains available.

Required production environment variables:

```env
ADMIN_UPLOAD_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
GITHUB_TOKEN=
GITHUB_REPO=owner/repo
GITHUB_BRANCH=main
GITHUB_GALLERY_PATH=data/gallery.json
```

Admin upload security:

- The upload button is hidden unless `?admin=true` is present.
- The API rejects uploads without the correct `ADMIN_UPLOAD_SECRET`.
- Public users cannot upload without the admin code.
- Every upload requires privacy confirmation.
- Do not upload media showing faces, street addresses, license plates, passwords, serial numbers, documents, or customer personal data.
- The API stores social captions as response drafts only; it does not publish social posts.

Gallery data format:

```json
{
  "version": 1,
  "updatedAt": "2026-06-14T00:00:00.000Z",
  "items": [
    {
      "title": "Front entry camera setup",
      "description": "Installed camera coverage for a local home.",
      "service": "Security Camera Installation",
      "serviceKey": "security-camera-installation",
      "city": "Los Angeles",
      "date": "2026-06-14",
      "mediaType": "image",
      "mediaUrl": "https://res.cloudinary.com/example/image/upload/sample.webp",
      "caption": "Security Camera Installation project completed in Los Angeles.",
      "altText": "Front entry camera setup - Security Camera Installation in Los Angeles by CompHelp Service",
      "source": "admin_upload_panel",
      "status": "published"
    }
  ]
}
```

## Marketplace Manager V1

Marketplace Manager V1 turns CompHelp Service into an AI-powered service marketplace and business operating system.

Open the dashboard:

```text
/marketplace
```

Open setup checklist:

```text
/marketplace-setup
```

### Required Vercel Environment Variables

Add these in Vercel under Project Settings -> Environment Variables:

```env
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini

MARKETPLACE_ADMIN_SECRET=
MARKETPLACE_MANAGER_SECRET=
MARKETPLACE_VIEWER_SECRET=

SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

ADMIN_UPLOAD_SECRET=

PUBLIC_SITE_URL=https://comphelp-service.vercel.app
```

Optional:

```env
RESEND_API_KEY=
LEAD_FROM_EMAIL=
HUBSPOT_ACCESS_TOKEN=
N8N_LEAD_WEBHOOK_URL=
N8N_VENDOR_QUOTE_WEBHOOK_URL=
VAPI_PROJECT_WEBHOOK_URL=
```

### Operational Test Checklist

1. Set admin code.
2. Add vendor.
3. Add lead.
4. Generate estimate.
5. Upload project media with privacy confirmation.
6. Generate SMM draft.
7. Check gallery on the matching service page.
8. Check dashboard metrics.

Modules included:

- Admin Login: role-based login for Admin, Manager, and Viewer codes.
- Lead Manager: receive leads, qualify customers, ask project questions, and save to CRM.
- Vendor Manager: store contractor name, category, phone, email, website, service area, commission percent, rating, and status.
- Estimate Manager: create quote ranges, export printable/direct PDF quotes, and email estimates when Resend is configured.
- Quote Request Manager: create vendor quote requests and compare vendors.
- AI Recommendation Engine: recommends top 3 vendors by service match, rating, distance, and availability, with OpenAI reasoning when configured.
- Commission Tracking: track referred jobs, revenue, expected commissions, and paid commissions.
- Marketing Manager: generate local competitor angles, content ideas, social drafts, and SEO page ideas.
- SEO Manager: create city page plans, service page plans, and blog ideas.
- SMM Manager: recommends Reel, Slideshow, Before/After, TikTok, Instagram Post, or Facebook Post formats with captions, hashtags, reel scripts, voiceover, and posting schedule.
- Project Manager: add projects, upload photos/videos, save before/after gallery notes, completion date, and customer review.
- Gallery Manager: every service page supports admin-only project uploads with title, description, service category, city, photos, and videos.
- Analytics Dashboard: total leads, total vendors, open projects, revenue, and expected commissions.
- Safety: no file deletion, no social posting without approval, no estimate email unless approved and Resend is configured, no fake reviews, no private customer data uploads without confirmation.

Service provider categories:

```text
Cameras
WiFi
Computer Repair
Data Recovery
Smart Home
Electrician
HVAC
Plumbing
Roofing
```

Role-based access:

```env
MARKETPLACE_ADMIN_SECRET=
MARKETPLACE_MANAGER_SECRET=
MARKETPLACE_VIEWER_SECRET=
```

- Admin and Manager can create leads, estimates, vendors, quote requests, commissions, marketing drafts, SMM plans, and projects.
- Viewer can use the recommendation endpoint only.
- Without a valid code, the dashboard only shows non-sensitive seed configuration.

Production storage:

1. Create a Supabase project.
2. Run `supabase.marketplace.sql` in the Supabase SQL editor.
3. Add these environment variables in Vercel:

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

Optional integrations:

```env
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
HUBSPOT_ACCESS_TOKEN=
N8N_LEAD_WEBHOOK_URL=
N8N_VENDOR_QUOTE_WEBHOOK_URL=
VAPI_PROJECT_WEBHOOK_URL=
PUBLIC_SITE_URL=https://comphelp-service.vercel.app
RESEND_API_KEY=
LEAD_FROM_EMAIL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Integration behavior:

- OpenAI improves vendor recommendation explanations.
- HubSpot creates contacts from marketplace leads.
- n8n receives lead and vendor quote request webhooks.
- Vapi can receive project status updates for call workflows.
- Cloudinary stores uploaded project photos and videos.
- Resend sends customer estimate emails.
- Supabase is the production source of truth.

Quote PDF workflow:

1. Generate an estimate in the dashboard.
2. Click `Open PDF Quote`.
3. Use the browser print dialog and choose `Save as PDF`.

Upload folder:

```text
uploads/new/
```

The agent creates backups and staged media here:

```text
uploads/original-backups/
uploads/needs-review/
assets/gallery/security-camera-installation/
assets/gallery/smart-home-setup/
assets/gallery/wifi-network-installation/
assets/gallery/computer-repair/
assets/gallery/data-recovery/
logs/media-last-plan.json
```

Basic workflow:

1. Put job photos/videos into `uploads/new/`.
2. Run a preview with city, service, short job note, and privacy approval.
3. Review `logs/media-last-plan.json`, page diffs, and social drafts.
4. Run approved publish only after checking customer privacy.
5. Commit and deploy only after approval.

Preview a gallery update:

```bash
npm run preview-gallery-update -- --city=Los Angeles --service=security-camera-installation --note="Installed front entry camera coverage for a local home." --privacy-ok
```

Approve the website gallery update:

```bash
npm run approve-publish -- --approved
```

Approve, commit, and push:

```bash
npm run approve-publish -- --approved --commit --push --message="Add approved job media gallery update"
```

Approve and trigger Vercel deployment:

```bash
npm run approve-publish -- --approved --deploy
```

Run the upload watcher:

```bash
npm run media-agent
node media-agent.js watch
```

Media services:

```text
security-camera-installation
smart-home-setup
wifi-network-installation
computer-repair
data-recovery
```

Privacy safety:

- Originals are never deleted.
- Every upload is backed up before optimized media is created.
- Publishing requires `--privacy-ok`.
- Media with privacy-risk filenames is copied to `uploads/needs-review`.
- Check and blur faces, addresses, license plates, passwords, serial numbers, documents, WiFi labels, and customer personal data before approval.
- Social media drafts are created only as drafts; the agent does not auto-post.

Image optimization:

- If `sharp` is installed, the agent creates compressed gallery images, WebP versions, and thumbnails.
- Without `sharp`, the agent still backs up originals and copies selected media into the correct gallery folder.

Optional image optimizer install:

```bash
npm install sharp
```

## Environment Variables

```env
OPENAI_API_KEY=
GITHUB_TOKEN=
GITHUB_REPO=
GITHUB_BRANCH=main
GITHUB_GALLERY_PATH=data/gallery.json
VERCEL_TOKEN=
VERCEL_PROJECT_ID=
GOOGLE_SHEETS_WEBHOOK_URL=
META_ACCESS_TOKEN=
FACEBOOK_PAGE_ID=
INSTAGRAM_BUSINESS_ID=
TIKTOK_ACCESS_TOKEN=
AUTO_POST=false
APPROVAL_REQUIRED=true
ADMIN_UPLOAD_SECRET=
MARKETPLACE_ADMIN_SECRET=
MARKETPLACE_MANAGER_SECRET=
MARKETPLACE_VIEWER_SECRET=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
HUBSPOT_ACCESS_TOKEN=
N8N_LEAD_WEBHOOK_URL=
N8N_VENDOR_QUOTE_WEBHOOK_URL=
VAPI_PROJECT_WEBHOOK_URL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Optional:

```env
OPENAI_MODEL=gpt-4.1-mini
ALLOWED_ORIGIN=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=
JOB_COMPLETE_WEBHOOK_SECRET=
VERCEL_TEAM_ID=
SERPAPI_KEY=
```

## Commands

Run from the `outputs` folder:

```bash
npm run agent -- "Help a customer choose a service"
npm run market-report
npm run create-social-calendar
npm run create-seo-page -- "Security Camera Installation in Pasadena"
npm run create-blog-post -- "WiFi troubleshooting tips for Los Angeles homes"
npm run update-website -- "Change the homepage CTA"
npm run daily-report
npm run media-agent
npm run process-uploads -- --city=Los Angeles --service=data-recovery --note="Recovered files from a customer laptop." --privacy-ok
npm run preview-gallery-update -- --city=Los Angeles --service=security-camera-installation --note="Installed camera coverage for a local home." --privacy-ok
npm run approve-publish -- --approved
```

## Safety Rules

- The agent never deletes files automatically.
- Website edits, SEO pages, and blog posts preview a diff first.
- GitHub commits and pushes require `approved: true`.
- Vercel deployment requires `approved: true`.
- SMS/email sending requires `approved: true`.
- Facebook, Instagram, and TikTok posting require approval unless `AUTO_POST=true`.
- The agent does not invent fake reviews.
- The agent does not make false claims.
- The agent does not spam customers or contact opted-out people.
- Money-related decisions require approval.
- Meaningful tool actions are logged in `logs/actions.jsonl`.

## Approval Examples

Preview an SEO page:

```js
const { toolHandlers } = require("./agent");

toolHandlers.createSeoPage({
  city: "Burbank",
  service: "Security Camera Installation"
}).then(console.log);
```

Create it after approval:

```js
toolHandlers.createSeoPage({
  city: "Burbank",
  service: "Security Camera Installation",
  approved: true
}).then(console.log);
```

Preview a Facebook post:

```js
toolHandlers.postToFacebook({
  message: "Need security camera installation in Burbank? CompHelp Service offers free estimates."
}).then(console.log);
```

Post only after approval:

```js
toolHandlers.postToFacebook({
  message: "Need security camera installation in Burbank? CompHelp Service offers free estimates.",
  approved: true
}).then(console.log);
```

## Notes

Live competitor research requires `SERPAPI_KEY`. Without it, market reports are clearly labeled as strategic local-model reports.

Instagram publishing requires a public `imageUrl`. TikTok direct posting depends on approved API permissions, so the TikTok tool creates a draft/scheduler payload by default.
