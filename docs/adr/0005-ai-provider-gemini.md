# ADR 0005 — AI behind a provider interface; Gemini 2.5 Flash as the default

**Status:** accepted · 2026-06-13

## Context

Plan generation needs an LLM with a usable free tier. Researched options (June 2026):

| Provider | Free tier | Notes |
|----------|-----------|-------|
| Gemini 2.5 Flash | ~10 RPM, **250k TPM, ~1,500 req/day**, no card | Native JSON-schema output |
| Groq (llama-3.3-70b) | 30 RPM but **6k TPM**, ~1k req/day | Very fast; tight TPM throttles long plan outputs |
| OpenRouter `:free` | ~50 req/day | Too small |
| Mistral free | ~1 RPS | Viable fallback |

Plan generation is a *long structured output* (rationale + 5–8 techniques with drills and
criteria ≈ 2–3k tokens), so tokens-per-minute matters more than requests-per-minute.

## Decision

- A minimal `AiProvider` interface owned by us; callers never import a vendor SDK.
- Default implementation: **Gemini 2.5 Flash over plain REST** (structured output via
  `responseSchema`) — no vendor SDK dependency, every request visible.
- A **mock provider** (deterministic fixtures) used in tests and key-less development.
- API keys live only in server env (`.env`, never committed) — one of the three reasons
  the backend exists.

## Consequences

- Swapping or adding a model (e.g. Groq for short calls like level descriptors) is one
  new file implementing the interface.
- All AI output is Zod-validated at the boundary; on failure, one repair re-prompt with
  the validation errors, then a typed error. The model is never trusted.
- Free-tier requests may be used by providers for training — acceptable: prompts contain
  hobby names and levels, never personal data.
