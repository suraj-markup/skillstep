# Dev log

A running journal of what was built, in what order, and what was decided along the way.

## 2026-06-13 — M0/M1: foundations

- Wrote PRD and architecture doc before any code; recorded the seven significant
  decisions as ADRs (`docs/adr/`) so the "why" survives the build.
- Scaffolded an npm-workspaces repo: `shared`, `server`, and the planned `mobile` Expo
  app. Hand-rolled the early configs so each decision is
  inspectable before generators enter the repo.
- Implemented the domain model in `shared` as Zod schemas — the single source of
  truth both sides import — plus the first pure domain function, `computeProgress`, with
  tests documenting the struck-technique rule (struck techniques leave the denominator).
- Server is a Hono app split into `app.ts` (testable, exported) and `index.ts` (Node
  entry), with an in-memory route test ready to prove routing once dependencies are
  installed.
- React Native replaced the initial web-PWA direction. The app target is now Expo:
  native Android first, with web export as the desktop story.
- CI and Biome are not installed yet; those belong to the next foundation step so they
  can be explained and committed deliberately.

## 2026-06-14 — M0/M1: verification tooling

- Installed the shared root toolchain: TypeScript for static checks, Vitest for unit
  tests, Biome for formatting/linting, and Node types for the server runtime.
- Added Biome config with the recommended rule preset and one formatting style for the
  whole monorepo.
- Added progress tests for the core product rule: struck techniques leave the progress
  denominator, and an all-struck plan is not considered complete.
- Added GitHub Actions CI that runs `npm ci`, `npm run typecheck`, `npm run test`, and
  `npm run lint`.
- Verified the local gates are green:
  - `npm run typecheck`
  - `npm run test`
  - `npm run lint`
  - `npm run build` (currently a no-op until build scripts exist)

## 2026-06-14 — M0/M1: folder structure cleanup

- Flattened the repo from `apps/*` and `packages/*` into `mobile`, `server`, and
  `shared` so the folder structure is easier to explain and deploy from the root.
- Kept `shared` as a private workspace module because the AI plan schema is the contract
  both mobile and server must agree on.
- Generated the initial Expo mobile app and replaced the starter screen with a small
  Skillstep shell that imports a preview plan from `@skillstep/shared`.
- Added Expo web runtime dependencies (`react-dom`, `react-native-web`) so the same
  mobile app can be smoke-tested in a browser.
- Added `mobile/metro.config.js` so Metro explicitly watches the repo root and resolves
  workspace packages like `@skillstep/shared` during native and web bundling.
- Verified the Expo web dev server served HTML and the Metro bundle at
  `http://localhost:8081`.
- Noted npm's current moderate audit warning: Expo pulls `uuid` through `xcode`; npm's
  forced fix would downgrade Expo to SDK 46, so we keep the SDK-compatible tree for now.

## 2026-06-14 — M2: mock AI provider

- Added `GeneratePlanInputSchema` to `shared` so mobile and server share the request
  contract for plan generation.
- Added a small `AiProvider` interface in `server/src/providers/ai`; route handlers will
  depend on this interface instead of importing a vendor SDK directly.
- Added `MockAiProvider`, a deterministic provider backed by shared fixtures. This lets
  us build and test plan generation without Gemini keys or network calls.
- Added provider tests to prove mock output is a valid `Plan` and mirrors the request.

## 2026-06-14 — M2: plan API route

- Added `POST /api/plans`, backed by the injectable `AiProvider`.
- The route validates request JSON with `GeneratePlanInputSchema`, validates provider
  output with `PlanSchema`, returns `400` for bad user input, and returns `502` if a
  provider violates the plan contract.
- Skipped new route tests for now to keep the current learning pass focused on
  implementation flow; verification is limited to typecheck, existing tests, lint, and
  manual endpoint checks when needed.
- Refactored the backend into `controllers/`, `services/`, and `repositories/`:
  controllers handle HTTP, services handle product/business flow, and repositories own
  data access. The current plan repository is intentionally no-op because the server
  remains stateless.
- Moved AI adapters under `providers/ai` so external systems live outside the
  controller/service/repository layers.

## 2026-06-15 — M1/M2: controlled plan icons

- Replaced free-form plan `emoji` with a controlled `icon` key in the shared schema.
- Updated mock AI identity data to return icon keys such as `strategy`, `guitar`, and
  `camera`, with a `sparkles` fallback for unknown hobbies.
- Added lucide native icons in mobile so the UI renders consistent, themeable icons
  instead of platform-dependent emoji.

## 2026-06-15 — M2/M3: server config

- Added `server/src/config/env.ts` so env loading and validation live in one place.
- `index.ts` now reads `PORT` through typed config instead of touching `process.env`
  directly.
- `GEMINI_API_KEY` and `YOUTUBE_API_KEY` are exposed as optional config values for the
  upcoming provider integrations.

## 2026-06-15 — M3: Gemini AI provider

- Added `GeminiProvider` under `server/src/providers/ai`, using Gemini REST
  `generateContent` with structured JSON output.
- `index.ts` now chooses Gemini when `GEMINI_API_KEY` is present and falls back to
  `MockAiProvider` otherwise.
- Kept controllers and services model-agnostic; only the provider layer knows about
  Gemini's API.

## 2026-06-15 — M4: mobile API client

- Added a centralized `mobile/src/api` layer inspired by SafeSplit's generated API
  structure: one `SkillstepApi` entry point, `core/` HTTP primitives, and domain
  `services/`.
- `PlansService` validates outgoing plan requests with `GeneratePlanInputSchema` and
  returned plans with `PlanSchema`, keeping mobile aligned with the shared contract.
- The default API base URL is local development (`http://localhost:8787/api`) and can be
  overridden when wiring device/emulator or deployed environments.

## 2026-06-15 — M5: SQLite persistence decision

- Updated the local-first architecture from AsyncStorage persistence to SQLite
  persistence.
- Durable user progress will live in mobile SQLite: plans, ordered techniques, mastery
  criteria, technique statuses, and cached content.
- Zustand remains available for temporary UI state only.

## 2026-06-15 — M5: SQLite DB foundation

- Added the first mobile database module under `mobile/src/db`.
- Created the initial SQLite schema for plans, ordered techniques, mastery criteria,
  technique statuses, and lazily cached technique content.
- Added a small migration runner that uses SQLite `PRAGMA user_version` so future
  schema changes have a clean upgrade path.

## 2026-06-15 — M5: mobile plan repository

- Added `mobile/src/db/planRepository.ts` as the first SQLite repository.
- The repository can save generated plans, reload full plans, update technique
  statuses, toggle mastery criteria, and return progress state for `computeProgress`.
- `savePlan` validates against the shared `PlanSchema` and keeps user progress
  separate from AI-generated plan content.

## 2026-06-15 — M6: mobile plan flow wiring

- Added `mobile/src/features/plans/usePlans.ts` to coordinate the API client and
  SQLite repository from one mobile-facing hook.
- The mobile shell now loads saved plans from SQLite, generates a starter plan through
  `POST /api/plans`, saves it locally, and renders the selected plan with progress.
- Kept the first UI flow intentionally narrow so the next pass can focus on the real
  plan-generation wizard and technique progress interactions.

## 2026-06-15 — M6: mobile feature structure cleanup

- Split the plan UI out of `App.tsx` into feature-owned screen, component, icon, and
  style modules under `mobile/src/features/plans`.
- Kept the hook/repository/API boundaries intact so the UI composes behavior without
  knowing SQL or HTTP details.
- Documented the local Gemini key setup in `README.md`.

## 2026-06-15 — M6: Gemini live-key verification

- Restarted the backend with local Gemini keys loaded from `.env`.
- Updated the Gemini REST payload to use `responseMimeType` and `responseJsonSchema`
  for structured JSON output.
- Added a typed provider error so upstream Gemini failures return structured API JSON
  instead of a generic server error.

## 2026-06-15 — M6: mobile fetch binding fix

- Fixed the mobile API client on web by binding the default `fetch` implementation to
  `globalThis`.
- This prevents the browser-only `Illegal invocation` error when the centralized API
  layer calls `fetch` through a stored function reference.

## 2026-06-15 — M6: local web CORS

- Added Hono CORS middleware for Expo web development origins.
- Verified `OPTIONS /api/plans` now returns a valid preflight response and browser-origin
  `POST /api/plans` succeeds.

## 2026-06-15 — M7: onboarding flow

- Added a first real onboarding flow under `mobile/src/features/onboarding`.
- New users now answer the core product questions: hobby, current level, target level,
  and weekly practice time.
- The onboarding submit path calls the existing plan API, saves the generated plan to
  SQLite, and then shows the saved plan dashboard.
- Moved shared color tokens into `mobile/src/theme` so feature folders do not depend on
  each other's styling modules.

## 2026-06-15 — M7: onboarding and hobby discovery split

- Changed onboarding from immediate hobby-plan generation to a personal setup step that
  asks for the user's name first.
- Added local profile persistence in SQLite so the app can remember onboarding completion
  and greet the user on the dashboard.
- Added a hobby discovery dashboard with a top search bar and default popular hobby
  cards.
- Moved current level, target level, and weekly hours into a selected-hobby plan setup
  screen, so the app asks those questions only after the user has chosen what they want
  to improve.

## 2026-06-15 — M7: saved user hobbies

- Added local SQLite persistence for user-selected hobbies.
- Selecting a default hobby or searching a custom hobby now saves it before opening plan
  setup.
- The dashboard now shows a "Your hobbies" section above the popular defaults when the
  user has saved hobbies.

## 2026-06-15 — M7: finding recommendations state

- Added a focused "finding recommendations" screen for custom hobby searches.
- Custom search now pauses briefly in this state before opening plan setup, giving us a
  clear UX slot for the upcoming AI hobby recommendation endpoint.
- Default hobby cards still open plan setup directly.
