# Skillstep

**Get better at anything — six techniques at a time.**

Skillstep turns a vague hobby ambition ("get better at chess") into a finite, personal plan:
5–8 techniques chosen by AI for your exact level jump, each with curated videos, a short
primer, a concrete practice drill, and mastery criteria you check off as you improve.
Strike out what isn't for you; the plan serves you, not the other way around.

> Status: in active development. See [docs/DEVLOG.md](docs/DEVLOG.md) for the build journal.

## Docs

- [Product requirements](docs/PRD.md) — problem, user stories, scope
- [Architecture](docs/ARCHITECTURE.md) — system design, data flow, failure modes
- [Decision records](docs/adr/) — why each significant choice was made

## Workspace layout

```
shared   Domain model (Zod schemas) + pure domain logic, shared by app and server
server   Hono API — AI plan generation, content curation, caching
mobile   Expo (React Native) app — wizard, plan view, technique workspace
```

## Getting started

```bash
npm install
cp .env.example .env       # add your own API keys (see docs/adr/0005)
npm run dev:server         # API on :8787
npm run dev:mobile         # Expo dev server — press "a" for Android emulator,
                           # or scan the QR code with Expo Go on your phone
```

The app also runs in a browser (`w` in the Expo CLI) via React Native Web — that's the
"one codebase, phone and desktop" story (see docs/adr/0002).

## Gemini setup

Add your Gemini key to the root `.env` file:

```bash
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.5-flash
```

Restart `npm run dev:server` after changing `.env`. When `GEMINI_API_KEY` is present,
the server uses Gemini; otherwise it falls back to the mock AI provider.

## Quality gates

```bash
npm run typecheck && npm run lint && npm test
```
