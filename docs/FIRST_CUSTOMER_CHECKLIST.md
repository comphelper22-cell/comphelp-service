# First Customer Checklist

## Product

- Beta Center loads.
- Founder dashboard is understandable in under 60 seconds.
- Sales, Operations, Finance, Marketing, Analytics, Dispatch, SaaS, Billing, and Integrations centers are visible.
- Known limitations are documented.

## Safety

- No `.env` or `.env.local` files are staged.
- No `logs/*.jsonl` files are staged.
- No real customer data is used in demo mode.
- No external services are connected without approval.

## Demo

- Demo script reviewed.
- Demo company selected.
- Feedback questions prepared.
- Follow-up action defined.

## Validation

```powershell
npm run check-project
git status
git diff --stat
```
