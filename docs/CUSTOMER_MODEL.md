# Customer Model

The customer model is designed for JSON fallback now and Supabase/PostgreSQL later.

## Customer Record

```json
{
  "id": "customer_...",
  "organization_id": "demo-org",
  "fullName": "Customer Name",
  "company": "Company",
  "phone": "+1 747 295 1440",
  "email": "customer@example.com",
  "address": "Street",
  "city": "Los Angeles",
  "state": "CA",
  "zip": "90001",
  "notes": "Notes",
  "status": "active",
  "tags": ["commercial"],
  "leadSource": "Website",
  "assignedSales": "Owner",
  "assignedTechnician": "Technician",
  "createdAt": "ISO timestamp",
  "updatedAt": "ISO timestamp"
}
```

## Status Values

- `new`
- `active`
- `returning`
- `commercial`
- `residential`
- `archived`

## Related Records

- `customerNotes`
- `customerTimeline`
- estimates
- projects/jobs
- invoices
- payments

## Delete Strategy

Delete is a soft delete using `deleted_at`. Archive uses `status: archived`. Restore clears archive/delete fields and returns the customer to active status when appropriate.
