# ADR 0006 — The LLM never picks videos

**Status:** accepted · 2026-06-13

## Context

Each technique needs 2–3 real, watchable videos. LLMs hallucinate YouTube URLs and video
IDs with high confidence — a dead "watch this" link is the single most credibility-
destroying bug this product could have.

## Decision

Strict division of labour:

- The **LLM** writes *search queries* (it's good at knowing what to look for:
  `"beginner chess opening principles"`), plus all text content (plans, primers, drills).
- The **YouTube Data API** resolves queries to real videos; the server ranks results
  (relevance, duration fit, recency) and returns the top 2–3.

## Consequences

- Zero dead links by construction.
- YouTube search costs 100 of the 10,000 free daily units, so the server caches
  query→results (in-memory LRU, 7-day TTL) and the client freezes resolved videos into
  the stored plan — each technique hits YouTube at most once per server lifetime.
- If quota is exhausted anyway, the fallback degrades honestly: show the crafted query as
  a tappable YouTube search link instead of pretending we have curated picks.
