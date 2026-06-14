# ADR 0002 — Expo (React Native) client, web export as bonus

**Status:** accepted · 2026-06-13 (supersedes an initial lean toward a web PWA)

## Context

The client could be a responsive React web app (PWA) or a React Native app. Hobby
learning is a phone-in-hand activity — you practice guitar with a phone on the music
stand, review a chess technique on the couch. We initially leaned web-PWA for iteration
speed, then chose native mobile as the primary experience.

## Decision

One Expo (React Native + TypeScript) codebase in `mobile`:

- **Android (native)** is the primary, shippable target — distributed as an APK.
- **Web export** via React Native Web + expo-router covers desktop browsers from the
  same code — the "runs on phone and desktop" story without a second codebase.
- **Expo over bare React Native:** managed config, the modern recommended workflow,
  Android builds without hand-maintained Gradle, OTA-updatable JS.

Supporting choices:

- **expo-router** for file-based navigation (becomes real URLs on web export).
- **Styling = `StyleSheet` + a design-tokens module** (`theme.ts`): no styling runtime,
  no Babel plugins to fight, every style traceable to a named token. NativeWind was the
  alternative; it buys Tailwind DX at the cost of build-config complexity and a runtime
  we'd have to defend.
- **Zustand + AsyncStorage** for state/persistence (see ADR 0004).

## Consequences

- True native UX patterns (real bottom sheet, native gestures) — matching how the
  product will actually be used.
- Development needs the Expo dev server + an emulator or Expo Go; CI checks remain pure
  Node (typecheck, lint, unit tests) — no device farm.
- Anything testable is kept out of components (in `shared`/plain TS) because
  RN component testing has a poor effort-to-signal ratio at this scale.
