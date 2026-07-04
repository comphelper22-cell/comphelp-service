# Sprint Plan

## Current Sprint

Project Control Center Sprint.

## Sprint Goal

Create a permanent project planning and focus system for CompHelp AI.

## Scope

- Project Control Center docs.
- Ideas backlog.
- Sprint plan.
- Release plan.
- Decision log.
- Focus rules.
- Project Control Center dashboard tab.
- Titan API planning actions.
- Project Control agent.

## Out of Scope

- Runtime automation.
- External APIs.
- Competitor scraping.
- Messaging.
- Deployment.
- Push/commit.

## Tasks

- Create planning documents.
- Add project-control agent.
- Extend `/api/titan`.
- Add dashboard cards.
- Update architecture docs.
- Run validation.

## Acceptance Criteria

- All requested docs exist.
- API actions return safe JSON.
- Dashboard tab renders planning cards.
- `npm run check-project` passes.

## Validation Commands

```powershell
npm run check-project
git status
git diff --stat
```

## Commit Message

```powershell
git commit -m "Project Control Center - planning foundation"
```

## Deployment Commands

Deployment requires owner approval:

```powershell
npm run vercel-deploy
```

