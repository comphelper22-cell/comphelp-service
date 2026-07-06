# Job Model

## Fields

- Job Number
- Customer
- Assigned Technician
- Priority
- Status
- Address
- Start Date
- End Date
- Estimated Hours
- Actual Hours
- Internal Notes
- Attachments Placeholder
- Completion Notes

## Status Values

- New
- Scheduled
- Assigned
- En Route
- On Site
- In Progress
- Waiting Parts
- Completed
- Cancelled
- Archived

## Priority Values

- Emergency
- High
- Normal
- Low

## Related Records

- `jobTimeline`
- `jobAssignments`
- `invoices` with draft invoice placeholders after completion
