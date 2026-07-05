# V1 Admin Guide

## Admin Responsibilities

- Run validation before release actions.
- Review warnings.
- Keep `.env`, `.env.local`, and `logs/*.jsonl` out of commits.
- Approve pushes and deployments manually.
- Review known limitations before customer demos.

## Release Commands

```powershell
npm run check-project
git status
git diff --stat
```

## Deployment

Deployment requires owner approval and should follow `docs/DEPLOYMENT_WORKFLOW.md`.
