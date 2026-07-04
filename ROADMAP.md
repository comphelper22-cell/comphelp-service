# CompHelp AI Roadmap

## v0.6 Database Foundation

Goal: complete the reusable database layer.

Scope:

- Supabase client using native `fetch`.
- JSON fallback using `data/marketplace.json`.
- Soft deletes with `deleted_at`.
- Database health reports.
- Developer Center database status.

Exit criteria:

- `npm run check-project` passes.
- All database modules expose `create`, `list`, `getById`, `update`, `remove`, and `search`.
- Supabase absence does not crash the app.

## v0.7 CRM v2

Goal: turn leads, customers, vendors, projects, estimates, invoices, tasks, notes, and activity into one operational CRM.

Scope:

- Core platform foundation: organizations, users, roles, permissions, sessions, audit logs, notifications, and preferences.
- CRM pipeline stages.
- Search and filtering.
- Customer timeline.
- Lead to customer conversion.
- Task assignment and reminders.
- Activity logging.

## v0.8 AI Estimate Engine

Goal: generate accurate, explainable estimate drafts.

Scope:

- Labor, materials, travel, tax, markup, commission, profit, and margin.
- Service templates.
- PDF-ready quote output.
- Internal notes and customer-facing quote copy.
- Owner approval before customer delivery.

## v0.9 Dispatcher and Scheduling

Goal: route jobs to the best provider or internal technician.

Scope:

- Vendor matching.
- Arrival estimates.
- Quote request drafts.
- Availability tracking.
- Commission tracking.
- Dispatch status pipeline.

## v1.0 Business OS MVP

Goal: run CompHelp AI operations from one dashboard.

Scope:

- Lead manager.
- CRM.
- Estimates.
- Vendor network.
- Project manager.
- Gallery manager.
- Follow-up queue.
- SMM drafts.
- SEO planning.
- Developer Center.

## v2.0 Multi-Tenant SaaS

Goal: support multiple service businesses.

Scope:

- Tenant isolation.
- Tenant roles and permissions.
- Industry templates.
- Billing plans.
- Usage limits.
- Audit logs.
- Tenant-level integrations.

## v3.0 AI Agent Marketplace

Goal: let businesses install specialized agents.

Scope:

- Agent catalog.
- Permission-scoped tools.
- Agent metrics.
- Marketplace billing.
- Industry-specific agent packs.
- Approval workflows for autonomous actions.

## Project Titan Roadmap

Titan Alpha: engineering operating system, AI Constitution, AI Executive Board foundation, CompHelp AI Score, quality gates, and internal review dashboard.

Titan Beta: AI Executive Board reports with deeper product, security, reliability, and customer success reviews.

Titan Gamma: CompHelp Brain shared memory for approved company knowledge, decisions, lessons, and operating context.

Titan Delta: AI company daily briefing covering product, engineering, sales, support, marketing, reliability, security, and recommended next actions.

## Project Control Center

The Project Control Center is the planning layer that prevents scope creep. It owns the current sprint, next sprints, release plan, ideas backlog, decision log, focus rules, blocked items, and deploy checklist.

## Project Titan Beta

Sprint 1: CompHelp Brain Kernel architecture with context, memory interfaces, recommendations, decisions, knowledge registry, and executive summary.

Sprint 2: Shared Memory Engine with local JSON providers, memory registry, Memory Agent diagnostics, and System API module `memory`.

Sprint 3: approved memory governance, privacy rules, retention policy, and audit logging for memory operations.

Sprint 4: Context Intelligence governance, live data connectors, and model-ready prompt assembly after owner approval.

## Project Titan Gamma

Sprint 4: Business Decision Engine with explainable decisions, policy layer, scoring, validation, history, and dashboard status.

Sprint 4.5: Integration and Stabilization with Brain Orchestrator, Memory -> Context -> Decision pipeline validation, health monitoring, diagnostics, performance metrics, and integration tests.

Sprint 5: Recommendation Intelligence with explainable business recommendations, revenue opportunities, operational improvements, sales opportunities, customer attention, priority scoring, and recommendation history.

Epic C Sprint 6: Executive Intelligence with daily executive briefings, KPI monitoring, business health scoring, forecasting, risk detection, growth opportunities, and Executive Dashboard UI.

Epic D Sprint 7: AI Sales Manager with sales pipeline intelligence, estimate priority, deal probability, revenue prediction, follow-up queue, upsell/cross-sell detection, and Sales Dashboard UI.

Epic D Sprint 7.5: Workflow & Automation Engine with event triggers, approval workflows, task queues, retry policies, notifications, execution history, and audit trail.

Sprint 8: Founder Dashboard UI polish with owner-facing command center, business health, AI actions, revenue opportunities, sales status, workflow activity, and AI workforce status.

Sprint 9: Operations Center with today's jobs, technician board, urgent jobs, at-risk work, dispatch suggestions, schedule health, customer waiting, inventory needs, and operations KPIs.

Sprint 10: Finance Center with revenue overview, invoices, cash flow, expenses, profit estimate, forecast, financial health, recommendations, and alerts.

Sprint 11: Customer Success Center with health score, VIP customers, at-risk customers, lost customers, LTV, timeline, repeat revenue opportunities, follow-up/review needs, and AI recommendations.

Sprint 12: Marketing & Growth Center with lead sources, campaign performance, local SEO health, reviews, social performance, email campaign drafts, ROI, and AI growth recommendations.

Sprint 13: Analytics & Reporting Center with business scorecard, revenue trends, sales trends, operations trends, customer trends, marketing trends, AI insights, weekly reports, and monthly reports.

Sprint 14: Scheduling & Dispatch AI with schedule optimization, technician matching, route suggestions, ETA, capacity planning, emergency dispatch, and Dispatch AI dashboard.

Sprint 15: Decision governance, approval queue, conflict resolution, and safe handoff to recommendation, sales, workflow, operations, finance, customer success, marketing, analytics, and dispatch actions.

## API Consolidation Hotfix

Internal modules developer, business-os, platform, titan, and brain route through `/api/system` to stay compatible with the Vercel Hobby serverless function limit. Module code is preserved in `server/api-modules/`.
