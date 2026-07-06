# Scheduling Guide

Scheduling is JSON-backed and prevents double-booking for the same technician.

## Calendar Model

Jobs store `startDate`, `endDate`, and `estimatedHours`.

## Conflict Detection

When scheduling a job, the dispatcher checks existing active jobs for the same technician. Overlapping start and end windows return `schedule_conflict`.

## Available Slots

Available time slots are generated for the next five days at 9:00, 11:00, 13:00, and 15:00.

## Suggested Schedule

AI Dispatch recommends the next available slot for the suggested technician when no conflict exists.
