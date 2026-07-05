# Security Model

The identity layer is designed for secure future authentication while avoiding premature credential handling.

## Current Safeguards

- No real passwords are stored.
- No signed JWTs are issued.
- No OAuth provider is connected.
- No Supabase Auth project is connected.
- Demo mode remains active.
- JSON fallback remains compatible.

## Future Controls

- Supabase Auth or approved identity provider.
- Tenant-aware middleware.
- RBAC enforcement.
- Session revocation.
- Audit logs for login, logout, role changes, and permission changes.
- Rate limits and lockout rules.

## Escalation Rules

Escalate before:

- Connecting a real auth provider.
- Storing user credentials.
- Enabling OAuth.
- Issuing signed tokens.
- Changing role permissions for production users.
