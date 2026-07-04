# Sprint Quality Gates

Every sprint must pass quality gates before commit, push, or deploy.

## Required Gates

- `npm run check-project` passes.
- `git status` reviewed.
- `git diff --stat` reviewed.
- No `.env` or `.env.local` staged.
- No `logs/*.jsonl` staged.
- No secrets exposed.
- API routes return safe JSON.
- JSON fallback remains compatible.
- Dashboard changes remain responsive.
- Documentation updated.

## Release Blockers

- Failed validation.
- Syntax errors.
- Broken admin login.
- Broken database fallback.
- Secret exposure.
- Customer data exposure.
- Missing rollback path.

