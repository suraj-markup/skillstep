# Whittle — Product Requirements

## Problem

People who want to get better at a hobby face three failures:

1. **Curation** — YouTube has thousands of "improve at chess" videos with no ordering and no
  sense of which ones matter for *this* learner. Choosing costs so much that people binge
   randomly or quit. Information overload kills hobbies.
2. **Scoping** — "Get better" has no finish line. Courses make it worse: a 40-hour course
  implies you need 40 hours of knowledge. In reality, one meaningful level jump needs a
   handful of techniques — the right 5–8, not everything.
3. **Progress** — Self-directed learning never defines what "done" looks like. Watching
  videos feels like progress but isn't; skills are built by doing.

**Whittle's one job:** convert "I want to get better at X" into a finite, personal,
completable plan — and make completing it feel real.

## Target user

Anyone with a hobby and limited time. Not aspiring professionals; people who want to go
from "I lose most games" to "I beat my friends" without turning the hobby into a job.

## Product principles

- **Finite beats infinite.** The absence of content is the feature. Never show a catalog.
- **Modality follows the hobby.** Guitar needs video and sound; chess needs boards and
  puzzles; poker theory genuinely reads well. Format is a per-technique decision made by
  the AI, never a fixed template. No quizzes-for-chess, no text-only guitar.
- **Checkmarks must mean something.** A technique is mastered when its observable,
self-assessed criteria are met — "I castle by move 10 in most games" — not when a video
finishes.
- **The plan serves the learner.** Striking out a technique is curation, not failure. It
leaves the progress math entirely.

## User stories

P0 — the product is wrong without these:

- **US1 · Wizard**: As a learner, I describe my hobby, pick my current and target level
from descriptions written in my hobby's own language, and set weekly hours — in under a
minute, with no account.
- **US2 · Plan**: I get a plan of 5–8 ordered techniques, with the AI's reasoning visible
and a one-line "why this, why now" per technique.
- **US3 · Review deck**: Before the plan is locked in, I review proposed techniques as a
mobile swipe deck: accept what fits, reject what does not, and receive replacements that
serve the same learning purpose.
- **US4 · Watch**: Each technique gives me 2–3 curated real videos (with durations) so I
never open YouTube's rabbit hole.
- **US5 · Read**: Each technique has a concise primer for when I can't watch or practice.
- **US6 · Practice**: Each technique has one concrete drill sized to my weekly time, plus
2–4 mastery criteria I can check off; meeting them lets me mark the technique mastered.
- **US7 · Strike out**: I can strike a technique I dislike, undo it, and accept an
AI-suggested replacement that serves the same purpose.
- **US8 · Progress**: I always see how far along the plan I am; struck techniques don't
count against me.
- **US9 · Persistence**: Everything survives closing and reopening the app, and works
offline once generated. No signup, no data loss.

P1 — the product is noticeably better with these:

- **US10 · Shelf**: I can run multiple hobbies in parallel from a home screen.
- **US11 · Level up**: Completing a plan celebrates the level jump and offers to generate
the next level's plan.
- **US12 · Both form factors**: One codebase ships a native Android app and a desktop web
export; technique details open as a bottom sheet on phones and a side panel on wide
screens.

P2 — delight, if time allows:

- **US13 · Streaming generation**: The plan's rationale and techniques appear
progressively while the AI "thinks".

## Non-goals

Auth and accounts; social features; hosting learning content ourselves; an open-ended
chat tutor; settings screens; custom native modules.

## Non-functional requirements

- Lean dependency tree and JS bundle; heavy pieces (video player, confetti) load on
demand, and video cards are thumbnail facades until tapped.
- AI and quota failures degrade gracefully with clear retry affordances — never a dead end.
- Layouts work from small phones to tablets and desktop web; touch targets ≥ 44 pt.
- All user data stays on the user's device. Server holds no personal state.

## Milestones


| #   | Slice                                                             | Stories       |
| --- | ----------------------------------------------------------------- | ------------- |
| M0  | Scaffold, docs, CI                                                | —             |
| M1  | Domain model + pure logic, tested                                 | foundations   |
| M2  | Plan API with mock AI provider, validation + repair, tested       | US2           |
| M3  | Live Gemini provider + level-descriptor endpoint                  | US1, US2      |
| M4  | Wizard UI with "thinking" state                                   | US1           |
| M5  | Review deck, plan view, statuses, persistence, progress           | US2, US3, US8, US9 |
| M6  | Technique workspace (sheet/panel), drill + criteria, mastery flow | US6, US12     |
| M7  | Curated videos + primers, server cache, client freeze             | US4, US5      |
| M8  | Strike/undo/replace + level-complete + next plan                  | US7, US11     |
| M9  | Design polish, error states, a11y pass, web export                | US10, US12    |
| M10 | Bundle audit, README, APK build + server deploy                   | —             |

