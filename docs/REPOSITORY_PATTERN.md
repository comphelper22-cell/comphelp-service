# Repository Pattern

Repositories live in `database/repositories/` and use `database/repositories/repository-factory.js`.

## Required Interface

Each repository supports:

- `create(record)`
- `findById(id)`
- `findAll(filters)`
- `update(id, patch)`
- `remove(id)`
- `search(query)`
- `paginate(options)`
- `validate(record)`

## Response Format

Repositories return:

```json
{ "ok": true, "data": {} }
```

or:

```json
{ "ok": false, "error": "message" }
```

## JSON Fallback

Repositories call the database client, which uses the existing JSON fallback store when Supabase is not configured.

## Validation

Validation is schema-driven through `database/core/database-validator.js`.

Covered checks:

- required fields
- organization isolation
- status values
- date fields
- money fields
- email fields
- phone fields
