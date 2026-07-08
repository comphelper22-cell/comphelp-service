# Beta Demo Mode

CompHelp AI Beta Demo Mode keeps the deployed Marketplace usable when production secrets or live integrations are not configured.

## Demo Credentials

Use these credentials only for beta demonstrations when Marketplace environment secrets are missing:

- Admin: `123456`
- Manager: `222222`
- Viewer: `111111`

When real `MARKETPLACE_ADMIN_SECRET`, `MARKETPLACE_MANAGER_SECRET`, `MARKETPLACE_VIEWER_SECRET`, or `ADMIN_UPLOAD_SECRET` values are configured, those production secrets take priority.

## Visible Banner

After beta demo login, the Marketplace displays:

`BETA DEMO MODE`

This confirms the dashboard is using safe synthetic demo data and not live business records.

## Demo Workflow

1. Open `/marketplace`.
2. Log in with Admin demo code `123456`.
3. Confirm the `BETA DEMO MODE` banner is visible.
4. Review the main Dashboard metrics.
5. Open Customer CRM and review demo customers.
6. Open Job Dispatch and review demo jobs.
7. Open Estimate Manager and review demo estimates, invoices, and revenue.
8. Open AI Operations Assistant and review summary, health, priorities, alerts, and recommendations.
9. Explain known limitations before showing the customer.

## Demo Data

Demo mode displays synthetic:

- Customers
- Jobs
- Invoices
- Estimates
- Revenue
- AI Assistant dashboard widgets

Demo records are not real customer claims and should not be presented as production performance.

## Chat Endpoint

`/api/chat` is available in beta mode and returns guided fallback replies. It does not connect to OpenAI yet.

## Known Limitations

- No real payment processor is connected.
- No card data is stored.
- No production database is connected.
- External AI providers are not connected.
- Demo data is synthetic.
- Messaging and posting remain approval-first and disabled unless configured.
- Marketplace auth remains secret-code based until the authentication platform is connected.

## Deployment Notes

Beta Demo Mode is intended for first customer demonstrations only. Configure production secrets before live operations.
