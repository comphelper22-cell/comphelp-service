# AI Operations Assistant Guide

The AI Operations Assistant is the first data-backed assistant layer for CompHelp AI. It does not call OpenAI, Anthropic, Gemini, Supabase, or any production database. It reads the existing JSON fallback data used by Customer CRM, Job Dispatch, Revenue Flow, and Operations.

## Purpose

The assistant helps owners, dispatchers, office managers, and technicians ask practical business questions in natural language:

- Show today's jobs.
- Who owes us money?
- What should I do today?
- Which technician is overloaded?
- Which customers have overdue invoices?

## Data Sources

- `customers`
- `customerNotes`
- `customerTimeline`
- `jobs`
- `jobTimeline`
- `jobAssignments`
- `estimates`
- `invoices`
- `payments`
- `tasks`
- `vendors`

All data comes from the current JSON fallback store through `JsonStore`.

## Dashboard Widgets

- Today's Summary
- Business Health
- Revenue Snapshot
- Dispatch Status
- Top Priorities
- Alerts
- Recommendations

## Safety

- No external AI provider is connected.
- No real payment processor is connected.
- No card data is stored.
- No messages are sent.
- Recommendations are advisory only.

