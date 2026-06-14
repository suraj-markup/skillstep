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
  Whittle shell that imports a preview plan from `@whittle/shared`.
- Added Expo web runtime dependencies (`react-dom`, `react-native-web`) so the same
  mobile app can be smoke-tested in a browser.
- Added `mobile/metro.config.js` so Metro explicitly watches the repo root and resolves
  workspace packages like `@whittle/shared` during native and web bundling.
- Verified the Expo web dev server served HTML and the Metro bundle at
  `http://localhost:8081`.
- Noted npm's current moderate audit warning: Expo pulls `uuid` through `xcode`; npm's
  forced fix would downgrade Expo to SDK 46, so we keep the SDK-compatible tree for now.

## 2026-06-14 — M2: mock AI provider

- Added `GeneratePlanInputSchema` to `shared` so mobile and server share the request
  contract for plan generation.
- Added a small `AiProvider` interface in `server/src/ai`; route handlers will depend on
  this interface instead of importing a vendor SDK directly.
- Added `MockAiProvider`, a deterministic provider backed by shared fixtures. This lets
  us build and test plan generation without Gemini keys or network calls.
- Added provider tests to prove mock output is a valid `Plan` and mirrors the request.
