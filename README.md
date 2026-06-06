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
VERCEL_TOKEN=
VERCEL_PROJECT_ID=
GOOGLE_SHEETS_WEBHOOK_URL=
META_ACCESS_TOKEN=
FACEBOOK_PAGE_ID=
INSTAGRAM_BUSINESS_ID=
TIKTOK_ACCESS_TOKEN=
AUTO_POST=false
APPROVAL_REQUIRED=true
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
