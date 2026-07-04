# CompHelp AI Deployment

## Local Development

Use Node.js 18 or newer.

Before every commit:

```powershell
npm run check-project
git status
git diff --stat
```

The app is static-first. HTML pages live at the repository root, browser assets live in `assets/`, and Vercel serverless functions live in `api/`.

## Environment Variables

Never commit `.env` or `.env.local`.

Core production variables:

```env
OPENAI_API_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
GITHUB_TOKEN=
GITHUB_REPO=
GITHUB_BRANCH=main
VERCEL_TOKEN=
VERCEL_PROJECT_ID=
```

Optional integration variables:

```env
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=
RESEND_API_KEY=
LEAD_FROM_EMAIL=
VAPI_PROJECT_WEBHOOK_URL=
```

## Branch Model

- `main`: production branch.
- `staging`: staging branch for future release testing.
- feature branches: optional for risky or large changes.

`main` must remain deployable.

## GitHub Workflow

Safe workflow:

```powershell
npm run check-project
git status
git diff --stat
git add .
git commit -m "Phase X - short description"
```

Do not stage:

- `.env`
- `.env.local`
- `logs/*.jsonl`
- backup ZIP files unless explicitly approved

## Vercel Deployment

Vercel serves static pages and serverless API routes.

Deploy only after owner approval:

```powershell
npm run vercel-deploy
```

If local environment loading is needed:

```powershell
Get-Content .env | ForEach-Object {
if ($_ -match "^\s*([^#][^=]+)=(.*)$") {
[Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim(), "Process")
}
}
```

## Rollback Process

1. Identify the last known good commit or Vercel deployment.
2. Confirm rollback scope with the owner.
3. Restore or redeploy the known good version.
4. Run `npm run check-project`.
5. Verify homepage, service pages, Marketplace dashboard, and critical APIs.
6. Record the rollback reason in an activity or deployment report.

## Release Tagging

Use tags for stable milestones:

```powershell
git tag v0.6.0
git push origin v0.6.0
```

Only tag after validation and approval.

