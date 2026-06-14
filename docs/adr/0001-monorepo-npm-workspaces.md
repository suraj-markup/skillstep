# ADR 0001 — Monorepo with npm workspaces

**Status:** accepted · 2026-06-13

## Context

The product has a mobile client and an API that must agree exactly on the shape of
AI-generated plans. Drift between client and server types is the classic failure mode.
Tooling options: separate repos, a single package, or a workspace monorepo (npm, pnpm,
turborepo, nx).

## Decision

One repo, npm workspaces, three top-level packages: `shared`, `server`, `mobile`. No
extra orchestrator.

## Why

- `shared` holds the Zod schemas once; both sides import the same runtime
  validators *and* the same inferred TypeScript types. A contract change is one diff.
- npm workspaces ship with npm itself — anyone can `npm install` and run with zero
  extra tooling. pnpm/turbo/nx add speed and caching this project's size doesn't need.

## Consequences

- Single lockfile and hoisted dependencies; Expo's Metro bundler auto-detects npm
  workspaces, so the app can import workspace TypeScript source directly.
- If the project grew many packages, we'd revisit pnpm + a task runner; the layout
  wouldn't change, only the tooling around it.
