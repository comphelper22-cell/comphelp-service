# CompHelp AI Coding Standards

## Folder Structure

- `api/`: Vercel serverless API routes.
- `agents/`: AI and business automation agents.
- `assets/`: browser JavaScript, admin scripts, and static assets.
- `database/`: Supabase and JSON fallback database modules.
- `data/`: JSON fallback data files.
- `scripts/`: validation, deployment, backup, and automation scripts.
- `logs/`: generated reports and local diagnostics.
- root HTML files: homepage, service pages, SEO pages, and dashboards.

## Naming Conventions

- HTML pages use kebab-case.
- JavaScript variables and functions use camelCase.
- Classes use PascalCase.
- Environment variables use uppercase snake case.
- API actions should be short, explicit, and stable.

## API Response Format

Success:

```json
{ "ok": true, "data": {} }
```

Failure:

```json
{ "ok": false, "error": "safe_error_message" }
```

API responses must be JSON. Do not return raw stack traces to the browser.

## Error Handling

- Wrap serverless handlers in `try/catch`.
- Use safe error messages.
- Log server-side errors with clear prefixes.
- Do not expose secret values.
- Fall back to JSON storage when Supabase is unavailable.

## Logging

- JSON reports belong in `logs/*.json`.
- Append-only local streams may use `logs/*.jsonl`.
- Do not commit `logs/*.jsonl`.
- Do not log tokens, passwords, private customer data, or API keys.

## Validation

Run before every commit:

```powershell
npm run check-project
```

Review:

```powershell
git status
git diff --stat
```

## Testing

Minimum test expectations:

- JavaScript syntax checks.
- JSON validity checks.
- `package.json` script checks.
- `vercel.json` route checks.
- API smoke checks when API routes change.
- Dashboard browser checks when UI behavior changes.

## Git Commit Rules

- Commit one coherent phase or feature at a time.
- Use messages like `Phase 6.1 - database layer`.
- Never commit `.env`, `.env.local`, secrets, or private customer exports.
- Never push without owner approval.
- Never deploy without owner approval.

## Compatibility Rules

- Do not break Phase 5 Developer Center.
- Do not break Phase 6.1 database fallback.
- Do not remove existing service pages, SEO pages, chatbot, lead form, marketplace APIs, or automation scripts.
- Prefer additive changes over rewrites.

## Project Titan Standards

- Titan agents must export `name`, `role`, `mission`, `responsibilities`, `inputs`, `outputs`, `KPIs`, `escalationRules`, and `run()`.
- Titan API responses must use `{ "ok": true, "data": ... }` or `{ "ok": false, "error": "message" }`.
- Titan Alpha must use safe internal/default reports only.
- Titan dashboard actions must run only on owner click, not automatically on page load.
