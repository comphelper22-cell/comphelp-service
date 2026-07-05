# Sprint Quality Gates

Every sprint must pass quality gates before commit, push, or deploy.

## Required Gates

- `npm run check-project` passes.
- `npm run lint` passes.
- API file count is reviewed for Vercel Hobby compatibility.
- Large file warnings are reviewed.
- Missing test warnings are reviewed.
- Missing documentation warnings are reviewed.
- Security keyword scan findings are reviewed as placeholder/masked or fixed.
- Environment variable warnings are reviewed against `.env.example`.
- `git status` reviewed.
- `git diff --stat` reviewed.
- No `.env` or `.env.local` staged.
- No `logs/*.jsonl` staged.
- No secrets exposed.
- API routes return safe JSON.
- JSON fallback remains compatible.
- Dashboard changes remain responsive.
- Documentation updated.
- GitHub Actions project-check workflow exists for push and pull request validation.
- Archive files are ignored through `.gitignore`.

## Release Blockers

- Failed validation.
- Syntax errors.
- Invalid JSON.
- Missing required deployment routes.
- Broken admin login.
- Broken database fallback.
- Secret exposure.
- Customer data exposure.
- Missing rollback path.

## Production Hardening Gates

- `production/health-checks.js` reports no missing core files.
- `production/security-checklist.js` has no real secret exposure.
- `production/performance-audit.js` large file findings are accepted or reduced.
- `production/deployment-audit.js` confirms `/api` function count is within deployment limits.
- `production/release-readiness.js` produces a release checklist before beta deploy.

## Sprint 21.5 Hardening Gates

- `docs/SECURITY_AUDIT.md` documents keyword scan findings.
- `tests/security-audit.test.js` reports no live token patterns.
- `tests/code-quality.test.js` verifies lint and CI configuration.
- Repository modules expose the consistent repository interface.
- `.gitignore` excludes `backups/`, `*.zip`, `*.7z`, and `*.rar`.
- GitHub Actions runs `npm run check-project` and `npm run lint`.
