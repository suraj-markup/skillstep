# Whittle — Architecture

## System overview

```
┌──────────────────────────────┐         ┌──────────────────────────────┐
│  apps/mobile (Expo / RN)     │         │  apps/server (Hono)          │
│  Android · iOS · web export  │  /api   │                              │
│                              │ ──────► │  routes → services → providers│
│  wizard → plan → technique   │         │            │                 │
│  Zustand store (persisted    │         │            ├─ ai: Gemini ────┼──► Google AI
│  to AsyncStorage; owns ALL   │         │            │   (mock in dev/ │
│  user state)                 │         │            │    tests)       │
└──────────────────────────────┘         │            └─ videos: ───────┼──► YouTube Data API
        ▲                                │               + in-memory    │
        └── packages/shared ─────────────┤                 LRU cache    │
            Zod schemas + pure domain    └──────────────────────────────┘
            logic, imported by both sides
```

One repo, three workspaces. `packages/shared` is the single source of truth for the
domain model: the server validates AI output against it, the client validates persisted
state against it, and both sides share the inferred TypeScript types. The client is one
React Native codebase that ships as a native Android app (the primary target), runs on
iOS, and exports to the web via React Native Web (ADR 0002).

## Why a backend exists at all

User state never leaves the device, so the server's jobs are exactly three:

1. **Secrets** — AI and YouTube keys cannot ship in client JS.
2. **Quota stewardship** — free tiers are tight (YouTube search costs 100 of 10,000 daily
   units; Gemini free tier is ~1,500 requests/day). A server-side cache means one user's
   "chess basics" search serves everyone's.
3. **Provider abstraction** — models are swappable behind one interface, with validation,
   repair, and fallback in one place.

The server is deliberately **stateless** (cache aside): adding accounts/sync later means
lifting the client store behind an API using the same shared schemas — no remodeling.

## Data model and ownership

Three kinds of data, three owners:

| Data | Example | Owner | Mutability |
|------|---------|-------|-----------|
| AI-generated structure | `Plan`, `Technique`, drills, criteria | Server creates, client stores | Immutable after creation |
| User state | technique status, checked criteria | Client only | Mutated by user actions |
| Fetched content | videos, primers | Server fetches, client freezes | Written once, then cached |

Keeping user state *out* of the `Plan` object is deliberate: a technique can be replaced
or a plan regenerated without touching the user's progress, and persistence migrations
only ever deal with one shape at a time.

## API surface

| Endpoint | Purpose | AI calls |
|----------|---------|----------|
| `POST /api/levels` | Validate hobby is learnable; return hobby-specific level descriptors + identity (emoji, accent) | 1 small |
| `POST /api/plans` | Generate the 5–8 technique plan with rationale | 1 large |
| `POST /api/primer` | Generate one technique's reading primer (lazy, on first open) | 1 medium |
| `GET /api/videos` | Resolve 2–3 real videos for a technique | 0 (YouTube API) |
| `POST /api/replace` | Suggest a replacement for a struck technique | 1 small |

**Plan eager, content lazy** (ADR 0007): plan generation returns structure only — fast and
cheap. Primers and videos resolve when a technique is first opened, then are frozen into
client storage and never fetched again.

**The LLM never picks video URLs** (ADR 0006): models hallucinate YouTube IDs. The LLM
writes *search queries*; the YouTube Data API resolves real videos; the server ranks and
caches them.

## Failure modes

| Failure | Behaviour |
|---------|-----------|
| LLM returns invalid JSON | Zod-validate → one repair re-prompt with the validation errors → otherwise 502; client shows retry |
| LLM rate-limited (429) | Surface retry-after; client shows a friendly "free tier breather" state |
| YouTube quota exhausted | Fall back to AI-crafted search links; server cache (7-day TTL) makes this rare |
| Offline | Shell + all persisted plans fully usable; only generation disabled |
| Corrupt localStorage | Zod-validate on hydrate; quarantine bad state instead of crashing |

## App architecture

- **State**: one Zustand store, persisted to AsyncStorage with a schema version for
  migrations. Derived values (progress) are pure functions from `packages/shared`,
  unit-tested without React.
- **Navigation**: expo-router (file-based). On web export this doubles as real URLs.
- **Form-factor pattern**: technique details render as a bottom sheet on phones and a
  side panel on wide screens (tablet / desktop web) — same content component, two
  presentations chosen by viewport.
- **Styling**: plain `StyleSheet` plus a design-tokens module (`theme.ts`) — no styling
  runtime, every style traceable to a token (ADR 0002).
- **Bundle discipline**: keep the dependency tree light; heavy pieces (YouTube WebView
  player, confetti) load lazily on first use. Video cards are thumbnail facades — no
  WebView is mounted until the user taps play.

## Testing strategy

Test the things with decision content, skip ceremony:

- Pure domain logic (progress math, status transitions) — the edge cases live here.
- The AI boundary — schema validation and repair against malformed model output.
- API routes via Hono's in-memory `app.request()` — no ports, no mocks of our own code.
- Persistence hydration/migration against corrupt and stale payloads.

Screens stay thin: anything worth testing is extracted to `packages/shared` or a plain
TS module so it runs under Vitest without a React Native test harness.

Not tested: third-party libraries, pixel rendering, framework internals.
