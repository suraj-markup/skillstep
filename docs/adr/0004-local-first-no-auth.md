# ADR 0004 — Local-first: no accounts, SQLite-owned progress

**Status:** accepted · 2026-06-13

## Context

Signup adds friction before the product has demonstrated any value, and hobby progress is
single-player data. But an app that loses your plan when reopened is worthless, so
persistence is non-negotiable.

## Decision

No auth. Durable user data (plans, techniques, technique statuses, checked criteria, and
cached content) lives on the device in SQLite. Zustand is used only for temporary UI state
such as the current wizard step, loading flags, and selected cards. The server holds zero
user state.

## Why

- Time-to-value: hobby → plan in under a minute, nothing standing in front of it.
- Privacy is structural — there is no PII to protect because none is collected.
- A stateless server is trivially scalable and trivially hostable.
- The data is relational enough to justify SQLite: plans contain ordered techniques;
  techniques contain mastery criteria, statuses, and cached content.

## Consequences

- No cross-device sync. Accepted: the upgrade path is clean — lift the same
  Zod-validated store shape behind an API; schemas already live in `shared`.
- SQLite migrations carry the durable schema forward as the app evolves.
- Repositories validate rows with shared Zod schemas before returning domain objects,
  quarantining or ignoring corrupt records rather than crashing.
- Storage writes go through repository modules — no scattered raw SQL in screens.
