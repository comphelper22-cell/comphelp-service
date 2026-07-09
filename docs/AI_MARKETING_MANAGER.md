# AI Marketing Manager

The AI Marketing Manager helps CompHelp Service identify local business opportunities, review market signals, prepare owner-approved outreach drafts, and recommend weekly marketing actions.

## Mission

Find realistic growth opportunities from public business context without spamming, scraping prohibited sites, buying lead lists, or sending messages automatically.

## Capabilities

- Lead intelligence from public-source placeholders and owner-reviewed manual research.
- Market watcher summaries for competitor offers, local demand, common price ranges, and seasonal opportunities.
- Lead scoring by business type, urgency, budget fit, service fit, distance, review signals, website quality, and contact availability.
- Strategy recommendations for weekly service focus, customer segment, neighborhood, content idea, price offer, and follow-up timing.
- CRM handoff that can save selected leads as Prospect, Lead, Warm Lead, Cold Lead, or Follow-up Required.

## Safety Rules

- No auto-contact.
- No scraping sites that prohibit scraping.
- No private personal data collection unless required for a legitimate business workflow.
- No purchased lead lists.
- No emails, SMS, calls, or DMs without owner approval.
- All outreach is draft-only by default.

## Dashboard

The Marketing & Growth Center now includes:

- Top Leads Today
- Best Neighborhoods
- Best Industries
- Competitor Alerts
- Recommended Campaign
- Follow-up Queue
- Market Opportunity Score

## API Actions

- `marketing.leadIntelligence`
- `marketing.marketWatcher`
- `marketing.scoreLead`
- `marketing.strategy`
- `marketing.saveLeadToCrm`
- `marketing.outreachPolicy`

All actions are routed through `/api/system`.

