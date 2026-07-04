# Project Control Center

The Project Control Center is the permanent planning source for CompHelp AI. It keeps the vision, roadmap, sprint tasks, backlog ideas, completed work, blocked items, and next actions organized.

## Current Mission

Build CompHelp AI into an AI Business Operating System for service businesses while preserving safety, validation, owner approval, customer trust, and deployability.

## Current Release

v0.7 Platform Foundation.

## Current Sprint

Project Control Center Sprint.

## Completed Milestones

- Marketplace dashboard foundation.
- Phase 6.1 database layer with Supabase readiness and JSON fallback.
- Release v0.7 Sprint 1 core platform foundation.
- Project Titan Sprint Alpha engineering operating system foundation.

## Active Work

- Project Control Center documentation.
- Project control dashboard tab.
- Titan API planning actions.
- Project control agent foundation.
- CompHelp Brain Kernel architecture for Project Titan Beta Sprint 1.
- Shared Memory Engine for Project Titan Beta Sprint 2.
- Context Intelligence Engine for Project Titan Beta Sprint 3.
- API consolidation hotfix for Vercel Hobby compatibility.

## Next 3 Sprints

1. v0.7 Sprint 2 - Supabase readiness and platform health checks.
2. Project Titan Beta Sprint 4 - context governance and live data connector policy.
3. v0.9 Sprint 1 - CRM Core pipeline and activity timeline.

## Blocked Items

- Production Supabase verification requires configured environment variables.
- GitHub push requires owner approval.
- Vercel deployment requires owner approval.

## Decisions Made

- New ideas go to the backlog before implementation.
- Project Titan remains internal and approval-only.
- JSON fallback must remain compatible through SaaS preparation.

## Commands Checklist

```powershell
npm run check-project
git status
git diff --stat
```

## Review Checklist

- Scope matches sprint goal.
- No `.env` or `.env.local` changes.
- No `logs/*.jsonl` staged.
- No external API calls added.
- No messaging automation added.
- Internal dashboard modules route through `/api/system`.
- Documentation updated.

## Deploy Checklist

- Validation passed.
- Git status reviewed.
- Diff stat reviewed.
- Commit approved.
- Push approved.
- Vercel deploy approved.
- Production smoke test planned.
