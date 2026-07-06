# CRM API

Customer CRM actions use the consolidated `/api/system` endpoint.

## Request Shape

```json
{
  "module": "customer",
  "action": "customer.search",
  "payload": {}
}
```

## Actions

- `customer.create`
- `customer.update`
- `customer.delete`
- `customer.archive`
- `customer.restore`
- `customer.search`
- `customer.profile`
- `customer.timeline`
- `customer.note`
- `customer.summary`
- `customer.dashboard`
- `customer.recent`

## Response Format

Every customer action returns the same envelope:

```json
{
  "ok": true,
  "data": {},
  "error": null,
  "warnings": [],
  "generatedAt": "ISO timestamp"
}
```

Failed responses use:

```json
{
  "ok": false,
  "data": null,
  "error": "customer_not_found",
  "warnings": [],
  "generatedAt": "ISO timestamp"
}
```

## Notes API

Use `customer.note` with:

```json
{
  "customerId": "customer_id",
  "operation": "add",
  "body": "Internal note",
  "pinned": true,
  "internal": true
}
```

Supported operations: `add`, `list`, `edit`, `delete`, `pin`.

## Storage

The CRM currently writes to JSON fallback storage in `data/marketplace.json`. No production database connection is required.

## Integration Test Coverage

`tests/customer-crm-integration.test.js` verifies create, search, profile, note, timeline, summary, archive, restore, and JSON fallback persistence.
