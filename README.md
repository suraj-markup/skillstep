# BetterHobby

**Pick a hobby. Practice daily. Track progress. Level up.**

BetterHobby is a local-first daily hobby companion. Instead of handing users a long,
static course plan, it turns a hobby goal into short practice sessions the user can
complete day by day. The app remembers active hobbies, today's sessions, reflections,
review cards, and progress so a learner always knows what to do next.

The app, packages, database, and deployed API are still internally named Skillstep while
the product rename is in progress.

> Status: active development. See [docs/DEVLOG.md](docs/DEVLOG.md) for the build
> journal and current implementation notes.

## Product

BetterHobby is built for people with limited time who want steady improvement without
turning a hobby into a job.

The core loop:

1. Add a hobby with your current level, goal, available minutes per day, and preferred
   practice days.
2. Generate a journey with daily sessions, milestones, practice cards, and optional
   project work.
3. Open Today to see the sessions and review cards that need attention now.
4. Complete each session through Learn, Resource, Practice, Check Yourself, and Reflect
   sections.
5. Review weak areas later through spaced practice cards.
6. Keep multiple hobbies active from My Hobbies and continue leveling up over time.

## Current App Surface

- First-run onboarding stores a local user profile.
- Hobby setup creates a generated journey from a hobby, level, goal, and schedule.
- Today shows available sessions, due practice cards, and entry points for adding or
  managing hobbies.
- Session detail guides the learner through a concrete practice task and reflection.
- Review supports due practice cards with difficulty-based scheduling.
- My Hobbies lists saved hobby profiles and their available sessions.
- SQLite persistence keeps generated journeys and progress on device.

## Tech Stack

This is an npm workspaces monorepo:

```txt
mobile   Expo / React Native app for Android, iOS, and web
server   Hono API for journey generation and provider isolation
shared   Zod schemas, shared TypeScript types, fixtures, and pure domain logic
api      Vercel serverless entrypoint for the Hono app
docs     Product docs, architecture notes, dev log, and ADRs
```

Key choices:

- Local-first user data with Expo SQLite.
- Shared Zod schemas as the contract between mobile, server, and persisted data.
- Stateless backend: it holds secrets and calls AI providers, but does not store user
  progress.
- Gemini-backed generation when `GEMINI_API_KEY` is set, with a mock provider fallback
  for local development and tests.
- Expo Updates / EAS support for preview and production mobile updates.
- Vercel deployment support for the API.

## API

The Hono app is mounted under `/api`.

| Endpoint | Purpose |
| --- | --- |
| `GET /api/health` | Health check for the API |
| `POST /api/journeys` | Generate a hobby profile, journey, daily sessions, practice cards, projects, and next-journey suggestions |

The `POST /api/journeys` request body is validated with `GenerateJourneyInputSchema`
from `shared/src/domain.ts`. Provider output is validated with `GeneratedJourneySchema`
before it is returned to the app.

## Getting Started

Install dependencies:

```bash
npm install
```

Create local environment variables:

```bash
cp .env.example .env
```

Run the API:

```bash
npm run dev:server
```

Run the Expo app:

```bash
npm run dev:mobile
```

In the Expo CLI, press `a` for Android, `i` for iOS, or `w` for web.

## Physical Device Setup

A phone cannot reach the API through your laptop's `localhost`. Set the mobile API URL
to your laptop's LAN IP before starting Expo:

```bash
EXPO_PUBLIC_API_BASE_URL=http://YOUR_LAPTOP_IP:8787/api npm run dev:mobile
```

Example:

```bash
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.20:8787/api npm run dev:mobile
```

Keep `npm run dev:server` running in another terminal and make sure the phone and laptop
are on the same Wi-Fi.

## AI Setup

The server uses the mock AI provider by default. To use Gemini locally, add a key to the
root `.env` file:

```bash
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.5-flash
```

Restart the server after changing `.env`.

`YOUTUBE_API_KEY` is reserved for video/resource work, but the current journey endpoint
does not require it.

## Scripts

```bash
npm run dev:server      # start the Hono API on PORT, default 8787
npm run dev:mobile      # start Expo
npm run typecheck       # TypeScript across workspaces
npm run lint            # Biome check
npm test                # workspace tests
npm run build           # workspace builds
npm run build:vercel    # server bundle for Vercel
```

## Quality Gates

Before shipping a change, run:

```bash
npm run typecheck && npm run lint && npm test
```

## Docs

- [BetterHobby daily companion plan](docs/DAILY_HOBBY_COMPANION_PLAN.md)
- [Product requirements](docs/PRD.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Decision records](docs/adr/)
- [Dev log](docs/DEVLOG.md)
