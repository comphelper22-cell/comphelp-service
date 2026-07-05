# V1 Architecture

## Overview

CompHelp AI V1.0 RC is a modular business operating system for service businesses.

## Layers

- Frontend: `marketplace.html` and `assets/marketplace-manager.js`.
- API: Vercel API routes, including consolidated `/api/system`.
- Business modules: sales, workflow, operations, finance, customer success, marketing, analytics, dispatch, SaaS, billing, integrations, launch, and production.
- Brain modules: memory, context, decision, recommendation, executive, and orchestrator.
- Data: JSON fallback with Supabase/PostgreSQL prepared for later phases.

## Safety

- External integrations are disabled by default.
- Payment processing is disabled.
- Push and deploy require approval.
