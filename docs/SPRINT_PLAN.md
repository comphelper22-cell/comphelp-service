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
