# Revenue API

Revenue actions use `/api/system` with module `revenue`.

## Estimate Actions

- `estimate.create`
- `estimate.update`
- `estimate.approve`
- `estimate.reject`
- `estimate.convertToJob`

## Invoice Actions

- `invoice.create`
- `invoice.update`
- `invoice.markSent`
- `invoice.markPaid`
- `invoice.markOverdue`

## Payment and Dashboard Actions

- `payment.record`
- `revenue.dashboard`
- `customer.financials`

## Response Envelope

```json
{
  "ok": true,
  "data": {},
  "error": null,
  "warnings": [],
  "generatedAt": "ISO timestamp"
}
```
