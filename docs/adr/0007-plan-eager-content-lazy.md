# ADR 0007 — Plan eager, content lazy

**Status:** accepted · 2026-06-13

## Context

A plan could be generated "complete" — techniques plus primers plus resolved videos — in
one giant call, or as structure first with content resolved per technique on demand.

## Decision

Plan generation returns **structure only** (rationale, techniques, drills, mastery
criteria). Primers and videos resolve **lazily, on a technique's first open**, then are
frozen into client storage permanently.

## Why

- **Latency:** structure is ~2–3k tokens (seconds); inlining 6–8 primers would multiply
  generation time and make the wizard's payoff moment feel broken.
- **Cost/quota:** users typically open techniques over days — and never open struck ones.
  Lazy content means quota is spent only on what's actually used.
- **Freshness:** videos resolved at first-open, then frozen for stability.

## Consequences

- Two small extra endpoints (`/api/primer`, `/api/videos`) and a loading state inside the
  technique sheet — the cost of this decision, willingly paid.
- After first open, a technique is fully offline-capable (primer text + video metadata
  cached; playback itself naturally needs network).
