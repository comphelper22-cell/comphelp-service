# AI Demo Commands

The AI Operations Assistant is deterministic in beta mode. It reads the shared JSON fallback data and does not call external AI providers.

## Recommended Demo Commands

- `Show today's jobs`
- `Who owes us money?`
- `What should I do today?`
- `Which technician is overloaded?`
- `Which customers need follow up?`
- `How much revenue this month?`
- `Show overdue invoices`
- `Show open estimates`

## Expected Behavior

The assistant should return:

- The detected intent
- A concise answer
- Relevant data rows
- Metrics when available
- Recommendations when useful

## Data Sources

- Customers
- Jobs
- Estimates
- Invoices
- Payments
- Technicians
- Customer notes
- Job timelines

## Known Limits

- No OpenAI, Anthropic, or Gemini API is connected.
- Natural-language understanding is rules-based.
- The assistant does not modify records.
- The assistant does not send customer messages.
