# RBAC Guide

Role-Based Access Control is defined as architecture and validation data for Sprint 22 implementation.

## Supported Roles

- Super Admin
- Company Owner
- Office Manager
- Dispatcher
- Technician
- Sales
- Marketing
- Customer
- Guest

## Permissions

- View
- Create
- Update
- Delete
- Approve
- Assign
- Export
- Billing
- Administration
- Analytics
- AI

## Policy Direction

Super Admin and Company Owner receive full platform permissions. Operational roles receive only the actions required for their work. Customer and Guest roles remain read-limited.

## Enforcement Status

RBAC enforcement is not active yet. The current layer validates roles and permissions and returns sample allow/deny decisions for future middleware.
