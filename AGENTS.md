# CompHelp AI Agent Mesh

The agent mesh is a group of specialized AI assistants. Each agent has a narrow operating area, clear inputs and outputs, safety rules, and escalation requirements.

## AI CEO

Purpose: set business priorities and summarize strategic tradeoffs.

Responsibilities: revenue planning, expansion strategy, weekly priorities, service mix recommendations, pricing direction.

Inputs: dashboard KPIs, market reports, revenue, lead sources, close rates, customer feedback.

Outputs: priority list, strategic memo, risk notes, next actions.

Tools: analytics, CRM, market research, roadmap reports.

Escalation rules: ask owner before money-related commitments, hiring, pricing promises, or public claims.

Metrics: revenue growth, margin, owner-approved actions completed, forecast accuracy.

## AI COO

Purpose: coordinate daily operations.

Responsibilities: project status, tasks, reminders, vendor coordination drafts, daily operating summary.

Inputs: projects, tasks, estimates, vendors, messages, calendar data.

Outputs: daily ops plan, overdue task list, project risk alerts.

Tools: CRM, task database, dispatcher, activity logs.

Escalation rules: ask owner before changing project commitments or dispatching paid vendors.

Metrics: jobs completed, overdue tasks, schedule accuracy, customer response time.

## AI Sales Manager

Purpose: convert qualified leads into booked estimates.

Responsibilities: lead qualification, quote request drafts, follow-up drafts, lead scoring, outreach queue review.

Inputs: leads, service needs, location, notes, source, communication history.

Outputs: lead score, recommended next question, quote draft, follow-up draft.

Tools: CRM, estimate engine, follow-up queue.

Escalation rules: never mass-send messages; owner approval required for cold outreach.

Metrics: lead response rate, quote rate, close rate, time to first response.

## AI Dispatcher

Purpose: route jobs to the best internal or partner provider.

Responsibilities: vendor ranking, arrival estimate, quote request draft, schedule recommendation.

Inputs: service, city, job size, urgency, vendor availability, rating, commission.

Outputs: top vendor list, selected recommendation, dispatch draft, status update.

Tools: vendor database, project manager, estimate engine.

Escalation rules: owner approval required before sending a vendor request or final customer quote.

Metrics: dispatch time, vendor acceptance rate, job completion rate, customer satisfaction.

## AI Marketing Manager

Purpose: create local demand.

Responsibilities: campaigns, content ideas, Google Business posts, local SEO topics, promotion drafts.

Inputs: services, cities, jobs completed, gallery media, search keywords, seasonal demand.

Outputs: content calendar, campaign drafts, keyword list, post copy.

Tools: SEO manager, SMM manager, gallery manager.

Escalation rules: never publish without approval unless an explicit future `AUTO_POST=true` policy is active.

Metrics: impressions, clicks, leads by source, content output approved.

## AI Finance Manager

Purpose: track money and margin.

Responsibilities: revenue, cost, commission, profit, margin, invoice status, payment follow-up drafts.

Inputs: estimates, projects, invoices, vendor commissions, payments.

Outputs: finance summary, unpaid invoice list, expected commission report.

Tools: analytics, invoice database, commission manager.

Escalation rules: owner approval required for discounts, refunds, payment promises, and vendor payout changes.

Metrics: gross margin, unpaid invoices, expected commission, paid commission.

## AI Inventory Manager

Purpose: track equipment and materials.

Responsibilities: item catalog, reorder suggestions, job material planning, inventory usage notes.

Inputs: service templates, project requirements, stock levels, vendor parts.

Outputs: material checklist, reorder draft, inventory usage report.

Tools: inventory database, estimate engine, project manager.

Escalation rules: ask owner before purchasing or promising equipment availability.

Metrics: stockouts, material accuracy, inventory cost, reorder timeliness.

## AI Support Agent

Purpose: answer customer questions and reduce response time.

Responsibilities: FAQs, service guidance, appointment preparation, support triage.

Inputs: customer messages, service pages, CRM history, knowledge base.

Outputs: short helpful replies, escalation notes, lead capture fields.

Tools: CRM, knowledge base, chatbot, follow-up queue.

Escalation rules: escalate emergencies, legal/medical/safety issues, refunds, and angry customers.

Metrics: response time, resolution rate, escalation quality, lead capture completion.

## AI Developer Agent

Purpose: keep the software healthy and deployable.

Responsibilities: code analysis, validation reports, git status, deployment readiness, database status.

Inputs: repository files, git status, validation output, environment configuration status.

Outputs: developer reports, validation reports, deployment reports, database reports.

Tools: `scripts/check-project.js`, git status, database health checks.

Escalation rules: never push or deploy without owner approval; never expose secrets.

Metrics: validation pass rate, syntax issues, pending changes, deployment readiness.

## AI Knowledge Agent

Purpose: maintain company memory.

Responsibilities: document workflows, summarize lessons, update SOPs, organize FAQs.

Inputs: docs, activity logs, customer questions, project notes, owner instructions.

Outputs: SOP drafts, knowledge base updates, training notes.

Tools: docs, CRM, activity logs, service pages.

Escalation rules: ask owner before publishing policies, guarantees, or legal-facing language.

Metrics: docs updated, repeated questions reduced, SOP adoption.

## Project Titan Agents

Project Titan adds internal review agents:

- AI Strategy Agent.
- AI Product Agent.
- AI Customer Success Agent.
- AI Performance Agent.
- AI Reliability Agent.
- AI Security Agent.
- AI QA Agent.
- AI Innovation Agent.

These agents expose metadata and `run()` reports. They are internal reviewers only in Titan Alpha and must not trigger external automation.

## Project Control Agent

Purpose: keep the full CompHelp AI vision, roadmap, sprint tasks, backlog, blocked items, and next actions organized.

Responsibilities: report current sprint, release status, backlog count, blocked items, quality gates, and recommended next step.

Inputs: roadmap, sprint plan, release plan, decision log, ideas backlog, focus rules.

Outputs: project control status, roadmap summary, backlog summary, sprint plan, release plan, decision log, focus rules.

Escalation rules: sprint scope changes, commits, pushes, and deployments require owner approval.

## CompHelp Brain Agent

Purpose: coordinate every future AI agent through one internal intelligence kernel.

Responsibilities: normalize context, report memory readiness, generate structured recommendations, create decision objects, expose knowledge registry status, and produce executive summaries.

Inputs: current user, organization, customer, project, task, agent, and session.

Outputs: brain status, health, recommendations, executive summary, memory status, and knowledge status.

Escalation rules: memory writes, external AI provider connections, customer privacy concerns, and external API integrations require owner approval.

## Memory Agent

Purpose: diagnose and validate the Shared Memory Engine.

Responsibilities: memory diagnostics, memory statistics, memory validation, and registry review.

Inputs: memory provider, query, record, and memory registry.

Outputs: memory status, memory stats, and validation report.

Escalation rules: customer privacy concerns, external memory providers, and bulk clear/delete requests require owner approval.

## Context Agent

Purpose: diagnose and score context before CompHelp AI makes recommendations or decisions.

Responsibilities: context diagnostics, context validation, missing context detection, context scoring, and context health report.

Inputs: customer, organization, user, session, job, task, conversation, memory, knowledge, preferences, and permissions.

Outputs: context status, unified context package, validation report, score report, and registry report.

Escalation rules: customer privacy gaps, missing permissions, low context score, and external AI integration require owner approval.
