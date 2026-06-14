# ADR 0004 — Local-first: no accounts, device-owned state

**Status:** accepted · 2026-06-13

## Context

Signup adds friction before the product has demonstrated any value, and hobby progress is
single-player data. But an app that loses your plan when reopened is worthless, so
persistence is non-negotiable.

## Decision

No auth. All user state (plans, technique statuses, checked criteria, cached content)
lives on the device in AsyncStorage behind a single versioned Zustand store. The server
holds zero user state.

## Why

- Time-to-value: hobby → plan in under a minute, nothing standing in front of it.
- Privacy is structural — there is no PII to protect because none is collected.
- A stateless server is trivially scalable and trivially hostable.

## Consequences

- No cross-device sync. Accepted: the upgrade path is clean — lift the same
  Zod-validated store shape behind an API; schemas already live in `shared`.
- Persistence carries a `schemaVersion`; hydration validates with Zod and quarantines
  corrupt state rather than crashing.
- Storage is the app's database, so writes go through one store — no scattered
  `AsyncStorage.setItem` calls.
