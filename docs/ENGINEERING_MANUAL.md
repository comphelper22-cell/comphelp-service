# Project Titan Engineering Manual

Project Titan is the internal operating system for building CompHelp AI like a world-class SaaS company.

## Engineering Principles

- Keep the repository deployable.
- Extend existing architecture instead of replacing it.
- Preserve JSON fallback compatibility.
- Require validation before commit.
- Require owner approval before push or deploy.
- Never expose secrets.
- Never auto-run external outreach or publishing.

## Engineering Workflow

```powershell
npm run check-project
git status
git diff --stat
```

If validation passes, prepare a focused commit. Do not commit `.env`, `.env.local`, `logs/*.jsonl`, or backup ZIPs.

## Review Areas

- Product quality.
- API safety.
- Database compatibility.
- Performance.
- Reliability.
- Security.
- AI output quality.
- Documentation accuracy.

## Quality Rule

Any failed validation, secret exposure risk, data loss risk, or broken dashboard workflow blocks release.

