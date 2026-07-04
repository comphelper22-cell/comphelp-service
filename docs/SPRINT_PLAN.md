# Sprint Plan

## Current Sprint

API Consolidation Hotfix - Vercel Hobby Compatibility.

## Sprint Goal

Reduce Vercel Serverless Function count while preserving developer, business-os, platform, titan, and brain functionality behind one System API Router.

## Scope

- `/api/system`.
- Move internal API handlers to `server/api-modules/`.
- Update dashboard calls to use `{ module, action, payload }`.
- Remove consolidated module rewrites from `vercel.json`.
- Add API function count validation.

## Out of Scope

- Runtime automation.
- Feature changes unrelated to consolidation.
- External APIs.
- Messaging.
- Deployment.
- Push/commit.

## Tasks

- Create System API Router.
- Move module API files.
- Update dashboard endpoint calls.
- Update `vercel.json`.
- Update validation and docs.
- Run validation.

## Acceptance Criteria

- `/api` has 10 or fewer JS function entrypoints.
- API actions return safe JSON.
- Dashboard calls internal modules through `/api/system`.
- `npm run check-project` passes.

## Validation Commands

```powershell
npm run check-project
git status
git diff --stat
```

## Commit Message

```powershell
git commit -m "Hotfix - consolidate internal API routes"
```

## Deployment Commands

Deployment requires owner approval:

```powershell
npm run vercel-deploy
```

## Upcoming Sprint: Project Titan Beta Sprint 2

Goal: teach CompHelp AI to remember through local JSON-backed memory providers used by future AI modules.

Scope:

- Shared Memory providers.
- Memory Registry.
- Memory Agent.
- System API module `memory`.
- Dashboard Memory section.
- Documentation updates.

Out of scope:

- External AI providers.
- OpenAI API.
- Supabase Memory.
- External APIs.
- Autonomous AI learning.

Acceptance criteria:

- Memory providers expose `save`, `load`, `update`, `delete`, `search`, and `clear`.
- API actions return safe JSON.
- Dashboard tab renders memory cards.
- `npm run check-project` passes.

Recommended commit:

```powershell
git commit -m "Project Titan Beta Sprint 2 - Shared Memory Engine"
```
