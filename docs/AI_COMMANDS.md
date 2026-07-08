# AI Operations Assistant Commands

The assistant uses a lightweight intent parser. Commands are matched by meaning and routed to customer, job, schedule, revenue, or operations insights.

## Customers

- `Show all active customers`
- `Show new customers this week`
- `Who hasn't been contacted recently?`
- `Which customers have overdue invoices?`
- `Which customers have active jobs?`

## Jobs

- `Show today's jobs`
- `Show emergency jobs`
- `Show waiting parts jobs`
- `Show completed jobs today`
- `Which technician has the most work?`

## Scheduling

- `Who is available tomorrow?`
- `Find scheduling conflicts`
- `Recommend best technician`
- `Suggest better schedule`

## Revenue

- `Revenue today`
- `Revenue this month`
- `Outstanding invoices`
- `Paid invoices`
- `Estimate conversion rate`
- `Top paying customers`
- `Who owes us money?`

## Operations

- `Today's summary`
- `Weekly summary`
- `Business health`
- `Open tasks`
- `Jobs requiring attention`
- `Technicians behind schedule`
- `What should I do today?`

## API Actions

Use `/api/system` with:

```json
{
  "module": "assistant",
  "action": "assistant.ask",
  "payload": {
    "question": "Who owes us money?"
  }
}
```

