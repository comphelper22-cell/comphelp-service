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

## Current Sprint: Project Titan Beta Sprint 3

Goal: teach CompHelp AI to understand context before making decisions.

Scope:

- Context Engine.
- Context Builder.
- Context Resolver.
- Context Validator.
- Context Registry.
- Customer, organization, session, job, conversation, and technician providers.
- Context Agent.
- System API module `context`.
- Dashboard Context section.

Out of scope:

- External AI providers.
- OpenAI, Anthropic, Gemini.
- Supabase connectors.
- Deployment architecture changes.

Acceptance criteria:

- Context package includes customer, organization, current user, session, job, previous jobs, memory, knowledge, recommendations, preferences, and permissions.
- Context score reports overall and per-section scores.
- Missing context is reported clearly.
- `npm run check-project` passes.

Recommended commit:

```powershell
git commit -m "Project Titan Beta Sprint 3 - Context Intelligence Engine"
```

## Current Sprint: Project Titan Gamma Sprint 4

Goal: teach CompHelp AI to make explainable business decisions from Memory and Context.

Scope:

- Business Decision Engine.
- Decision Builder.
- Decision Evaluator.
- Decision Registry.
- Decision Validator.
- Decision Score.
- Decision History.
- Decision Policy.
- Decision Agent.
- System API module `decision`.
- Dashboard Decision section.

Out of scope:

- External AI providers.
- OpenAI, Anthropic, Gemini.
- Deployment architecture changes.
- Autonomous execution.

Acceptance criteria:

- Every decision returns the required decision model.
- Initial business decision templates are registered.
- Policy layer is configurable.
- Dashboard shows decision status, queue, confidence, recent decisions, and policy health.
- `npm run check-project` passes.

Recommended commit:

```powershell
git commit -m "Project Titan Gamma Sprint 4 - Business Decision Engine"
```

## Current Sprint: Project Titan Sprint 4.5

Goal: transform the AI foundation into one unified Business Brain without changing deployment architecture or connecting external AI providers.

Scope:

- Brain Orchestrator.
- Brain Pipeline.
- Brain Health monitoring.
- Brain Metrics.
- Brain Events.
- Integration Agent.
- System API Brain dotted actions.
- Dashboard Brain controls for pipeline, metrics, and diagnostics.
- Basic integration test for Memory -> Context -> Decision.

Out of scope:

- External AI providers.
- Supabase memory.
- Deployment architecture changes.
- Autonomous execution.
- Git push or Vercel deployment.

Acceptance criteria:

- Pipeline verifies Memory -> Context -> Decision.
- Health response includes module status, pipeline status, missing dependencies, average response time, errors, and warnings.
- Performance response includes memory access time, context build time, decision time, and pipeline time.
- Dashboard can run Brain status, health, pipeline, metrics, and diagnostics through `/api/system`.
- `npm run check-project` passes.

Recommended commit:

```powershell
git commit -m "Project Titan Sprint 4.5 - Brain integration stabilization"
```

## Current Sprint: Project Titan Sprint 5

Goal: increase service company revenue, efficiency, and customer satisfaction through intelligent, explainable recommendations.

Scope:

- Recommendation Intelligence Engine.
- Recommendation Builder.
- Recommendation Registry.
- Recommendation Validator.
- Recommendation History.
- Recommendation Score.
- Recommendation Priority.
- Recommendation Explainer.
- Recommendation Rules.
- Recommendation Agent.
- System API module `recommendation`.
- Dashboard Recommendation Intelligence controls.

Out of scope:

- OpenAI, Anthropic, Gemini, or external AI providers.
- Deployment architecture changes.
- Autonomous execution.
- Customer, vendor, email, SMS, or social publishing without approval.

Acceptance criteria:

- Recommendations support sales, operations, finance, marketing, customer, and management categories.
- Every recommendation returns the required output model.
- Recommendations include confidence, estimated business value, priority score, and explainable reasoning.
- Recommendation history is available through JSON fallback.
- Dashboard shows today's recommendations, revenue opportunities, operational improvements, sales opportunities, customer attention, and AI priority queue.
- `npm run check-project` passes.

Recommended commit:

```powershell
git commit -m "Project Titan Sprint 5 - Recommendation Intelligence"
```

## Current Sprint: Project Titan Epic C Sprint 6

Goal: transform CompHelp AI into an Executive Business Operating System with real-time intelligence, daily executive briefings, KPI monitoring, forecasts, and proactive insights.

Scope:

- Executive Engine.
- Executive Dashboard.
- Executive Briefing.
- Executive KPI Engine.
- Executive Health.
- Executive Risk Detection.
- Executive Forecasts.
- Executive Opportunities.
- Executive Insights.
- Executive Summary.
- Executive Agent.
- System API module `executive`.
- Marketplace Executive Dashboard section.
- Executive Intelligence integration test.

Out of scope:

- OpenAI, Anthropic, Gemini, or external AI providers.
- Deployment architecture changes.
- Supabase-only storage.
- Automated dispatch, collections, outreach, or publishing.
- Git push or Vercel deployment.

Acceptance criteria:

- Executive output includes executive summary, business health score, KPIs, forecasts, risks, opportunities, AI recommendations, and generated timestamp.
- Business health model scores revenue, operations, sales, customers, marketing, technicians, finance, and inventory from 0 to 100.
- Forecast model includes revenue, workload, customer growth, marketing performance, cash flow trend, and technician capacity.
- Risk model detects late estimates, late invoices, idle technicians, missed follow-ups, low conversion, customer churn risk, inventory shortage, and scheduling conflicts.
- Dashboard shows business health, revenue, forecasts, risks, opportunities, and daily executive briefing.
- `npm run check-project` passes.

Recommended commit:

```powershell
git commit -m "Project Titan Epic C Sprint 6 - Executive Intelligence"
```

## Current Sprint: Project Titan Epic D Sprint 7

Goal: build the first AI Employee capable of helping service companies increase revenue by managing the full sales pipeline.

Scope:

- AI Sales Manager Agent.
- Sales Engine.
- Pipeline Manager.
- Estimate Scoring.
- Deal Priority.
- Follow-up Engine.
- Sales Dashboard.
- Conversion Engine.
- Customer Intelligence.
- Revenue Opportunities.
- System API module `sales`.
- Marketplace Sales Manager section.
- Sales Manager integration test.

Out of scope:

- External AI providers.
- Deployment pipeline changes.
- Customer outreach automation.
- Discounting or price changes without owner approval.
- Git push or Vercel deployment.

Acceptance criteria:

- Sales pipeline follows Lead -> Qualification -> Estimate -> Follow-up -> Negotiation -> Won/Lost.
- Sales dashboard returns best next customer, expected revenue, probability, reasoning, priority, and recommended action.
- Sales KPIs include open estimates, won estimates, lost estimates, conversion rate, average deal size, revenue pipeline, follow-up completion, and average close time.
- Features include estimate priority, deal probability, revenue prediction, best customer to call, best follow-up time, lost deal recovery, VIP detection, upsell detection, and cross-sell detection.
- `npm run check-project` passes.

Recommended commit:

```powershell
git commit -m "Project Titan Epic D Sprint 7 - AI Sales Manager"
```

## Current Sprint: Project Titan Epic D Sprint 7.5

Goal: create the unified automation layer used by every AI Employee.

Scope:

- Workflow Engine.
- Workflow Builder.
- Workflow Runner.
- Workflow Registry.
- Workflow Validator.
- Workflow History.
- Workflow Events.
- Workflow Actions.
- Workflow Triggers.
- Workflow Approval.
- Workflow Agent.
- System API module `workflow`.
- Workflow Engine test.

Out of scope:

- External AI providers.
- Messaging providers.
- Deployment pipeline changes.
- Autonomous execution without approval.
- Git push or Vercel deployment.

Acceptance criteria:

- Supported events include New Lead, New Estimate, Estimate Accepted, Invoice Overdue, Job Completed, Customer Created, Technician Assigned, and Inventory Low.
- Workflows include approval checks, retry policies, internal task/notification actions, execution history, warnings, errors, and audit trail.
- Customer-facing workflow actions default to `needs_approval`.
- Workflow layer reuses Context, Decision, Recommendation, and Executive Intelligence.
- `npm run check-project` passes.

Recommended commit:

```powershell
git commit -m "Project Titan Epic D Sprint 7.5 - Workflow Automation Engine"
```

## Current Sprint: Project Titan Sprint 9

Goal: build the daily operations dashboard for service businesses.

Scope:

- Operations Engine.
- Jobs Board.
- Technician Board.
- Dispatch Suggestions.
- Schedule Health.
- Job Priority.
- Customer Timeline.
- Inventory Needs.
- Operations Dashboard.
- Operations Agent.
- System API module `operations`.
- Marketplace Operations Center section.
- Operations Center test.

Out of scope:

- New core Brain engines.
- External AI providers.
- Deployment pipeline changes.
- Automatic technician assignment.
- Automatic customer contact.
- Git push or Vercel deployment.

Acceptance criteria:

- Operations dashboard includes today's jobs, technician board, urgent jobs, late/at-risk jobs, AI dispatch suggestions, schedule health, customer waiting, inventory needed, job priority queue, and operations KPI cards.
- API supports `operations.status`, `operations.dashboard`, `operations.jobs`, `operations.technicians`, `operations.dispatchSuggestions`, `operations.scheduleHealth`, `operations.priorities`, `operations.customerTimeline`, and `operations.inventoryNeeds`.
- Uses JSON/demo fallback safely when real data is missing.
- `npm run check-project` passes.

Recommended commit:

```powershell
git commit -m "Project Titan Sprint 9 - Operations Center"
```

## Current Sprint: Project Titan Sprint 10

Goal: build the Finance Center for service businesses with real-time financial overview using JSON/demo fallback data.

Scope:

- Finance Engine.
- Finance Dashboard.
- Revenue Engine.
- Invoice Engine.
- Cash Flow Engine.
- Expense Engine.
- Profit Engine.
- Forecast Engine.
- Financial Health.
- Financial KPIs.
- Finance Agent.
- System API module `finance`.
- Marketplace Finance Center section.
- Finance Center test.

Out of scope:

- Brain module changes.
- Workflow Engine changes.
- Operations Center changes.
- External financial APIs.
- Payment gateways.
- Git push or Vercel deployment.

Acceptance criteria:

- Finance Center shows revenue today, week, month, outstanding invoices, overdue invoices, paid invoices, cash flow, profit estimate, expenses, monthly forecast, financial health score, revenue trend, expense trend, top customers by revenue, AI recommendations, and financial alerts.
- API supports `finance.status`, `finance.dashboard`, `finance.revenue`, `finance.invoices`, `finance.cashflow`, `finance.expenses`, `finance.profit`, `finance.forecast`, `finance.health`, and `finance.kpis`.
- Uses JSON/demo fallback data safely.
- `npm run check-project` passes.

Recommended commit:

```powershell
git commit -m "Project Titan Sprint 10 - Finance Center"
```

## Current Sprint: Project Titan Sprint 11

Goal: build the Customer Success Center to help service businesses retain customers, increase repeat revenue, detect at-risk customers, and identify VIP customers.

Scope:

- Customer Success Engine.
- Customer Health.
- Customer Dashboard.
- Customer Timeline.
- Customer LTV.
- Customer Risk.
- Customer Segments.
- VIP Customers.
- Lost Customers.
- Customer Recommendations.
- Customer Success Manager Agent.
- System API module `customerSuccess`.
- Marketplace Customer Success Center section.
- Customer Success Center test.

Out of scope:

- New core Brain engines.
- External AI providers.
- Deployment pipeline changes.
- Automatic follow-ups or review requests.
- Git push or Vercel deployment.

Acceptance criteria:

- Customer Success Center shows customer health score, VIP customers, at-risk customers, lost customers, customer lifetime value, customer timeline, repeat revenue opportunities, follow-up needed, reviews needed, and AI recommendations.
- API supports `customerSuccess.status`, `customerSuccess.dashboard`, `customerSuccess.health`, `customerSuccess.timeline`, `customerSuccess.ltv`, `customerSuccess.risks`, `customerSuccess.vip`, `customerSuccess.lost`, and `customerSuccess.recommendations`.
- Uses JSON/demo fallback data safely.
- `npm run check-project` passes.

Recommended commit:

```powershell
git commit -m "Project Titan Sprint 11 - Customer Success Center"
```

## Current Sprint: Project Titan Sprint 12

Goal: build the Marketing & Growth Center to help service businesses generate more leads, understand marketing performance, improve local visibility, and increase revenue.

Scope:

- Marketing Engine.
- Marketing Dashboard.
- Lead Sources.
- Campaigns.
- Local SEO.
- Reviews Engine.
- Social Performance.
- Email Campaigns.
- Marketing ROI.
- Growth Recommendations.
- Marketing Manager Agent.
- System API module `marketing`.
- Marketplace Marketing & Growth Center section.
- Marketing & Growth Center test.

Out of scope:

- Real Google, Facebook, Instagram, TikTok, or advertising APIs.
- Paid service integrations.
- Automatic posting or messaging.
- Deployment pipeline changes.
- Git push or Vercel deployment.

Acceptance criteria:

- Marketing & Growth Center shows leads today, lead sources, campaign performance, marketing ROI, local SEO health, reviews and reputation, social media performance, email campaigns, growth opportunities, and AI marketing recommendations.
- API supports `marketing.status`, `marketing.dashboard`, `marketing.leads`, `marketing.campaigns`, `marketing.localSeo`, `marketing.reviews`, `marketing.social`, `marketing.email`, `marketing.roi`, and `marketing.recommendations`.
- Uses JSON/demo fallback data safely.
- `npm run check-project` passes.

Recommended commit:

```powershell
git commit -m "Project Titan Sprint 12 - Marketing Growth Center"
```

## Current Sprint: Project Titan Sprint 13

Goal: create unified reporting and analytics across Sales, Operations, Finance, Customer Success, and Marketing.

Scope:

- Analytics Engine.
- Reporting Dashboard.
- KPI Summary.
- Trend Analysis.
- Performance Reports.
- Business Scorecard.
- Export Reports.
- AI Insights Report.
- Analytics Agent.
- System API module `analytics`.
- Marketplace Analytics & Reports section.
- Analytics & Reporting test.

Out of scope:

- External analytics services.
- Paid BI tools.
- Real Google, Facebook, or advertising APIs.
- File export downloads.
- Git push or Vercel deployment.

Acceptance criteria:

- Analytics & Reports shows business scorecard, revenue trends, sales trends, operations trends, customer trends, marketing trends, AI insights report, weekly report, and monthly report.
- API supports `analytics.status`, `analytics.dashboard`, `analytics.kpis`, `analytics.trends`, `analytics.reports`, `analytics.scorecard`, `analytics.export`, and `analytics.insights`.
- Uses JSON/demo fallback data safely.
- `npm run check-project` passes.

Recommended commit:

```powershell
git commit -m "Project Titan Sprint 13 - Analytics Reporting Center"
```

## Current Sprint: Project Titan Sprint 14

Goal: improve scheduling, technician assignment, route planning, ETA visibility, emergency dispatch, and dispatch decision support.

Scope:

- Dispatch AI Engine.
- Schedule Optimizer.
- Technician Matcher.
- Route Planner.
- ETA Engine.
- Capacity Planner.
- Emergency Dispatch.
- Dispatch Dashboard.
- AI Dispatcher Agent.
- System API module `dispatchAI`.
- Marketplace Dispatch AI Center section.
- Dispatch AI test.

Out of scope:

- External maps APIs.
- Automatic technician assignment.
- Customer messaging.
- Deployment pipeline changes.
- Git push or Vercel deployment.

Acceptance criteria:

- Dispatch AI Center shows today schedule, technician availability, route suggestions, ETA, emergency jobs, schedule conflicts, and AI dispatch suggestions.
- API supports `dispatchAI.status`, `dispatchAI.dashboard`, `dispatchAI.schedule`, `dispatchAI.optimize`, `dispatchAI.technicians`, `dispatchAI.routes`, `dispatchAI.eta`, `dispatchAI.capacity`, and `dispatchAI.emergency`.
- Uses JSON/demo fallback data safely.
- `npm run check-project` passes.

Recommended commit:

```powershell
git commit -m "Project Titan Sprint 14 - Scheduling Dispatch AI"
```

## Current Sprint: Project Titan Sprint 15

Goal: prepare CompHelp AI for multiple companies, organizations, teams, roles, and tenant-isolated data.

Scope:

- Tenant Engine.
- Organization Manager.
- Team Manager.
- Tenant Context.
- Tenant Permissions.
- Tenant Settings.
- Tenant Dashboard.
- SaaS Agent.
- System API module `saas`.
- Marketplace SaaS Admin Center section.
- SaaS Multi-Tenant Foundation test.

Out of scope:

- Supabase connection.
- PostgreSQL migration.
- Billing.
- Production tenant onboarding.
- Git push or Vercel deployment.

Acceptance criteria:

- SaaS Admin Center shows organizations, teams, roles, permissions, settings, and tenant health.
- API supports `saas.status`, `saas.organizations`, `saas.teams`, `saas.permissions`, `saas.settings`, and `saas.dashboard`.
- Uses JSON fallback only.
- Does not expose secrets.
- `npm run check-project` passes.

Recommended commit:

```powershell
git commit -m "Project Titan Sprint 15 - SaaS Multi-Tenant Foundation"
```

## Current Sprint: Project Titan Sprint 16

Goal: create billing architecture and subscription plan management for future SaaS monetization.

Scope:

- Billing Engine.
- Plans.
- Subscriptions.
- Invoices.
- Usage Tracking.
- Billing Dashboard.
- Payment Status.
- Billing Agent.
- System API module `billing`.
- Marketplace Billing Center section.
- Billing & Subscriptions test.

Out of scope:

- Stripe connection.
- Real payment processing.
- Card data storage.
- Tax/legal payment compliance.
- Git push or Vercel deployment.

Acceptance criteria:

- Billing Center shows plans, subscription status, usage, invoices, payment status, and upgrade recommendations.
- API supports `billing.status`, `billing.plans`, `billing.subscriptions`, `billing.invoices`, `billing.usage`, and `billing.dashboard`.
- No Stripe connection exists.
- No card data is stored.
- `npm run check-project` passes.

Recommended commit:

```powershell
git commit -m "Project Titan Sprint 16 - Billing Subscriptions"
```

## Current Sprint: Project Titan Sprint 17

Goal: create public API architecture and an integration framework for future third-party connections.

Scope:

- Integration Engine.
- Public API Registry.
- API Key Manager.
- Webhook Manager.
- Integration Dashboard.
- Integration Logs.
- Integration Manager Agent.
- System API module `integrations`.
- Marketplace Integrations Center section.
- Public API & Integrations test.

Out of scope:

- External API connections.
- Real API secret storage or exposure.
- Webhook delivery.
- Public endpoint production launch.
- Git push or Vercel deployment.

Acceptance criteria:

- Integrations Center shows API keys, webhooks, connected apps, integration logs, and developer notes.
- API supports `integrations.status`, `integrations.registry`, `integrations.apiKeys`, `integrations.webhooks`, `integrations.logs`, and `integrations.dashboard`.
- No external APIs are connected.
- Real secrets are not exposed.
- `npm run check-project` passes.

Recommended commit:

```powershell
git commit -m "Project Titan Sprint 17 - Public API Integrations Foundation"
```

## Current Sprint: Project Titan Sprint 20

Goal: prepare CompHelp AI for its first production-quality release candidate without adding new business modules or external integrations.

Scope:

- Release Manager.
- Release Validator.
- Release Report.
- System Health.
- Version Manager.
- Quality Score.
- Performance Review.
- Release Center dashboard section.
- V1 release documentation package.
- Release Candidate validation test.

Out of scope:

- New business modules.
- New AI agents.
- Database changes.
- Authentication changes.
- Payment gateway.
- External integrations.
- Git push or Vercel deployment.

Acceptance criteria:

- Release Center shows system health, installed modules, architecture diagram, performance score, security score, test coverage, deployment status, release notes, version history, and overall readiness.
- Release utilities return structured, production-safe reports.
- V1 release notes, user guide, admin guide, architecture guide, deployment guide, known issues, and technical debt docs exist.
- `tests/release-candidate.test.js` passes.
- `npm run check-project` passes.

Validation commands:

```powershell
node tests\release-candidate.test.js
npm run check-project
git status
git diff --stat
```

Recommended commit:

```powershell
git commit -m "Project Titan Sprint 20 - V1 Release Candidate"
```

## Current Sprint: Project Titan Sprint 21

Goal: build the database foundation for real SaaS usage without connecting a production database.

Scope:

- Database core modules.
- SaaS-ready schema definitions.
- Repository pattern.
- Review-only SQL migration drafts.
- Supabase readiness placeholders.
- Database Agent diagnostics.
- `/api/system` database actions.
- Database foundation documentation.
- Database foundation tests.

Out of scope:

- Real Supabase production connection.
- Real credentials.
- Authentication.
- Demo mode removal.
- Existing API rewrites.
- Git push or Vercel deployment.

Acceptance criteria:

- JSON fallback remains compatible.
- Every major table has base audit, status, organization, and metadata fields.
- Repositories support create, findById, findAll, update, remove, search, paginate, and validate.
- Database API actions return structured JSON.
- SQL migrations are present but not auto-executed.
- `npm run check-project` passes.

Validation commands:

```powershell
node tests\database-foundation.test.js
node tests\repositories.test.js
node tests\supabase-ready.test.js
npm run check-project
git status
git diff --stat
```

Recommended commit:

```powershell
git commit -m "Project Titan Sprint 21 - Database Foundation"
```

## Current Sprint: Phase 2 Epic 1

Goal: build enterprise-ready identity and authentication architecture without connecting real authentication services.

Scope:

- Identity engine and validation.
- Auth engine and placeholder flows.
- Session model.
- Organization model.
- RBAC roles and permissions.
- User profile/settings/preferences/activity models.
- Identity Agent diagnostics.
- System API status actions.
- Authentication and security documentation.
- Focused identity tests.

Out of scope:

- Real Supabase Auth connection.
- OAuth providers.
- Password storage.
- Demo mode removal.
- Deployment changes.
- Git push or Vercel deployment.

Validation commands:

```powershell
node tests\authentication.test.js
node tests\roles.test.js
node tests\organization.test.js
node tests\session.test.js
npm run check-project
npm run lint
git status
git diff --stat
```

Recommended commit:

```powershell
git commit -m "Phase 2 Epic 1 - Identity Authentication Platform"
```

## Current Sprint: Project Titan Epic 2

Goal: transform the CRM foundation into a working JSON-backed customer management system.

Scope:

- Customer CRUD.
- Archive and restore.
- Customer search and filters.
- Customer profile details.
- Customer timeline.
- Customer notes.
- Customer dashboard metrics.
- AI customer summary.
- System API customer actions.
- Marketplace Manager Customer CRM UI.
- CRM documentation and tests.

Out of scope:

- Production database connection.
- Authentication enforcement.
- Deployment changes.
- Git push or Vercel deployment.

Validation commands:

```powershell
node tests\customer-crud.test.js
node tests\customer-search.test.js
node tests\customer-timeline.test.js
node tests\customer-notes.test.js
node tests\customer-summary.test.js
npm run check-project
npm run lint
git status
git diff --stat
```

Recommended commit:

```powershell
git commit -m "Project Titan Epic 2 - Real Customer CRM"
```
