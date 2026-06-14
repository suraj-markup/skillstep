# ADR 0003 — Hono on Node for the API

**Status:** accepted · 2026-06-13

## Context

The API is small (five endpoints), I/O-bound (LLM + YouTube calls), and must be cheap to
host. Candidates: Express, Fastify, NestJS, Hono.

## Decision

Hono with the Node adapter (`@hono/node-server`), structured as `app.ts` (the testable
app) + `index.ts` (the Node entry point).

## Why

- **Web-standard `Request`/`Response`** — the same app object runs on Node today and on
  serverless/edge hosts unchanged, so the deploy target stays an open, cheap choice.
- **In-memory testing built in** — `app.request('/api/health')` exercises real routing
  and middleware with no port, no supertest.
- **Tiny and TypeScript-first.** Express is fine but shows its age (callback middleware,
  weak types); Nest is far too much machinery for five endpoints.

## Consequences

- Less middleware ecosystem than Express; for this surface (JSON, CORS, validation we do
  ourselves with shared Zod schemas) that costs nothing.
- The `app.ts` / `index.ts` split is the seam where a serverless adapter would attach at
  deploy time.
