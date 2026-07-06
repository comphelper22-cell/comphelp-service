# Dispatch API

Job Dispatch uses `/api/system` with module `job`.

## Actions

- `job.create`
- `job.update`
- `job.assign`
- `job.schedule`
- `job.status`
- `job.timeline`
- `job.complete`
- `job.dashboard`
- `job.details`
- `job.aiDispatch`

## Example

```json
{
  "module": "job",
  "action": "job.create",
  "payload": {
    "customerName": "Customer",
    "service": "Security Camera Installation",
    "priority": "normal"
  }
}
```

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
