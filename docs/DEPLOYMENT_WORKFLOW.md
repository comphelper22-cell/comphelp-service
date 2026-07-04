# Deployment Workflow

## Safety Rules

- Do not push automatically.
- Do not deploy automatically.
- Do not commit `.env`.
- Do not commit `.env.local`.
- Do not commit `logs/*.jsonl`.
- Do not expose secrets.
- Validate before commit.

## Local Workflow

```powershell
npm run check-project
git status
git diff --stat
```

Review all `check-project` warnings before commit. Sprint 18 adds API file count, large file, missing test, missing documentation, security keyword, and environment variable warnings.

## Commit Workflow

```powershell
git add .
git status
git commit -m "Phase X - short description"
```

Before committing, confirm secret files and local logs are not staged.

## Push Workflow

Only after approval:

```powershell
git push origin main
```

## Vercel Workflow

Only after approval:

```powershell
Get-Content .env | ForEach-Object {
if ($_ -match "^\s*([^#][^=]+)=(.*)$") {
[Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim(), "Process")
}
}

npm run vercel-deploy
```

## Release Checklist

- Validation passes.
- Production hardening warnings reviewed.
- API function count reviewed for Vercel Hobby compatibility.
- Large files reviewed.
- Security keyword findings confirmed placeholder/masked or fixed.
- Required environment variables documented in `.env.example`.
- Git status reviewed.
- Diff stat reviewed.
- Commit message approved.
- Push approved.
- Deploy approved.
- Production smoke test completed.
- Rollback path identified.

## Rollback Workflow

1. Identify the last known good commit.
2. Confirm rollback with owner.
3. Restore or redeploy known good version.
4. Run validation.
5. Verify homepage, dashboard, API health, and lead form.

## Beta Readiness Workflow

1. Run `npm run check-project`.
2. Run focused production test: `node tests\production-hardening.test.js`.
3. Review `production/release-readiness.js` output through the Production Readiness Agent.
4. Confirm no `.env`, `.env.local`, or `logs/*.jsonl` files are staged.
5. Request owner approval before push.
6. Request owner approval before deployment.
