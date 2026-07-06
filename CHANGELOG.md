# Changelog

## Project Titan Epic 3 - Real Job Dispatch & Scheduling

- Added working JSON-backed job dispatch service.
- Added job create, update, assignment, scheduling, status, timeline, completion, dashboard, details, and AI dispatch actions.
- Added Marketplace Manager Job Dispatch UI.
- Added scheduling conflict detection and double-booking prevention.
- Added invoice placeholder and AI recommendation events when jobs are completed.
- Added job dispatch tests and documentation.

## Project Titan Epic 2.1 - CRM Integration & Cleanup

- Added end-to-end customer CRM integration test.
- Standardized Customer CRM response envelopes with `ok`, `data`, `error`, `warnings`, and `generatedAt`.
- Added dedicated customer archive timeline events.
- Improved Customer CRM loading, empty, success, and error states.
- Updated CRM API, user guide, customer model, and technical debt documentation.

## Project Titan Epic 2 - Real Customer CRM

- Added real JSON-backed customer CRM service with create, edit, delete, archive, restore, search, profile, timeline, notes, dashboard, and AI summary actions.
- Added `/api/system` customer actions.
- Added Customer CRM screen to Marketplace Manager.
- Added CRM user, API, and customer model documentation.
- Added customer CRUD, search, timeline, notes, and summary tests.

## Project Titan Phase 2 Epic 1 - Identity & Authentication Platform

- Added identity, authentication, organization, RBAC, and user architecture modules.
- Added Identity Agent diagnostics for auth readiness, roles, sessions, organization isolation, and security.
- Added `/api/system` actions for identity, auth, session, organization, and roles status.
- Added authentication, RBAC, organization, session, and security model documentation.
- Added focused tests for authentication, roles, organization, and session architecture.

## Project Titan Sprint 21.5 - Database Foundation Hardening

- Added security audit documentation for secret keyword findings.
- Added archive ignore rules for zip, 7z, and rar files.
- Added lightweight lint script and `npm run lint`.
- Added GitHub Actions workflow for project check and lint.
- Added security audit and code quality tests.
- Updated quality gates and technical debt documentation.

## Project Titan Sprint 21 - Database Foundation

- Added database core modules for config, client wrapper, validation, health, migrations, seed status, and structured errors.
- Added SaaS-ready schema definitions and repositories for core business tables.
- Added review-only SQL migration drafts, indexes, RLS policy examples, and demo seed SQL.
- Added Supabase readiness placeholders without connecting a production database.
- Added Database Agent and `/api/system` database actions.
- Added database foundation, repository, and Supabase readiness tests.
- Documented the data model, repository pattern, Supabase readiness, and migration plan.

## Project Titan Sprint 20 - V1.0 Release Candidate

- Added Release Center dashboard UI.
- Added release utilities for system health, validation, reporting, versioning, quality score, and performance review.
- Added V1 release notes, user guide, admin guide, architecture guide, deployment guide, known issues, and technical debt docs.
- Added `tests/release-candidate.test.js`.
- Updated README, roadmap, architecture, project control, and sprint plan for V1.0 RC readiness.

## Project Titan Sprint 19 - Beta Launch Package

- Added beta launch modules for demo mode, demo data, scenarios, checklist, feedback, feature tour, release readiness, customer demo, and known limitations.
- Added Beta Manager Agent.
- Added Beta Center dashboard UI.
- Added beta launch documentation, demo script, customer demo guide, known limitations, and first customer checklist.
- Added `tests/beta-launch.test.js`.

## Project Titan Sprint 18 - Production Hardening

- Added production hardening modules for health checks, error boundaries, security checklist, performance audit, deployment audit, and release readiness.
- Added Production Readiness Agent.
- Extended `scripts/check-project.js` with API file count, large file, missing test, missing docs, security keyword, and environment variable warnings.
- Added `tests/production-hardening.test.js`.
- Updated sprint quality gates and deployment workflow for beta release safety.

## Project Titan Sprint 17 - Public API & Integrations Foundation

- Added integrations architecture modules for public API registry, API key metadata, webhooks, integration logs, and integration dashboard.
- Added Integration Manager Agent.
- Added `integrations.*` actions to `/api/system`.
- Added Integrations Center dashboard UI.
- Added `tests/public-api-integrations.test.js`.
- Documented integrations architecture, roadmap, sprint plan, and project control updates.

## Project Titan Sprint 16 - Billing & Subscriptions

- Added billing architecture modules for plans, subscriptions, invoices, usage tracking, payment status, and billing dashboard.
- Added Billing Agent.
- Added `billing.*` actions to `/api/system`.
- Added Billing Center dashboard UI.
- Added `tests/billing-subscriptions.test.js`.
- Documented billing architecture, roadmap, sprint plan, and project control updates.

## Project Titan Sprint 15 - SaaS Multi-Tenant Foundation

- Added SaaS foundation modules for organizations, teams, tenant context, permissions, settings, and tenant dashboard.
- Added SaaS Agent.
- Added `saas.*` actions to `/api/system`.
- Added SaaS Admin Center dashboard UI.
- Added `tests/saas-multitenant.test.js`.
- Documented SaaS foundation architecture, roadmap, sprint plan, and project control updates.

## Project Titan Sprint 14 - Scheduling & Dispatch AI

- Added Dispatch AI modules for schedule optimization, technician matching, route suggestions, ETA, capacity planning, emergency dispatch, and dispatch dashboard.
- Added AI Dispatcher Agent.
- Added `dispatchAI.*` actions to `/api/system`.
- Added Dispatch AI Center dashboard UI.
- Added `tests/dispatch-ai.test.js`.
- Documented Dispatch AI architecture, roadmap, sprint plan, and project control updates.

## Project Titan Sprint 13 - Analytics & Reporting Center

- Added Analytics & Reporting Center modules for KPIs, trends, performance reports, business scorecard, exports, and AI insights.
- Added Analytics Agent.
- Added `analytics.*` actions to `/api/system`.
- Added Analytics & Reports dashboard UI.
- Added `tests/analytics-reporting.test.js`.
- Documented Analytics & Reporting architecture, roadmap, sprint plan, and project control updates.

## Project Titan Sprint 12 - Marketing & Growth Center

- Added Marketing & Growth Center modules for lead sources, campaigns, local SEO, reviews, social performance, email campaigns, ROI, and growth recommendations.
- Added Marketing Manager Agent.
- Added `marketing.*` actions to `/api/system`.
- Added Marketing & Growth Center dashboard UI.
- Added `tests/marketing-growth.test.js`.
- Documented Marketing & Growth architecture, roadmap, sprint plan, and project control updates.

## Project Titan Sprint 11 - Customer Success Center

- Added Customer Success Center modules for health, timeline, lifetime value, risk, segmentation, VIP customers, lost customers, and recommendations.
- Added Customer Success Manager Agent.
- Added `customerSuccess.*` actions to `/api/system`.
- Added Customer Success Center dashboard UI.
- Added `tests/customer-success-center.test.js`.
- Documented Customer Success architecture, roadmap, sprint plan, and project control updates.
