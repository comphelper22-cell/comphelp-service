# V1 Deployment Guide

## Preflight

```powershell
npm run check-project
git status
git diff --stat
```

## Commit

Do not stage:

- `.env`
- `.env.local`
- `logs/*.jsonl`
- private customer data

## Push

Only after approval:

```powershell
git push origin main
```

## Deploy

Only after approval:

```powershell
npm run vercel-deploy
```

## Smoke Test

- Homepage loads.
- Marketplace dashboard loads.
- Beta Center loads.
- Release Center loads.
- `/api/marketplace?resource=dashboard` returns JSON.
- `/api/system` returns JSON.
