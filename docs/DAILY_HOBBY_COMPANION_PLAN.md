# BetterHobby Daily Companion Plan

## Purpose

This document is the product and implementation plan for rebuilding BetterHobby from a
one-time plan generator into a daily hobby companion.

The current product risk is simple: if a user generates a plan, reads it once, and has no
meaningful reason to return, the app does not become part of their hobby life. The new
direction is to make BetterHobby the place where users know what to practice today,
track what they have done, review weak areas, and level up over time.

## Product Thesis

BetterHobby should not primarily answer:

> "What is a plan for learning this hobby?"

It should answer:

> "What should I do today to get slightly better at this hobby?"

The app should become a daily practice system with memory.

Users return because:

- today has a clear session waiting
- the app remembers progress
- the app reviews weak topics at the right time
- completed work unlocks the next level
- multiple hobbies can live in one place

## Core Promise

Pick a hobby. Practice daily. Track progress. Level up.

## Product Principles

### 1. Daily action beats static content

The main output is not a long plan page. The main output is a sequence of small sessions
that tell the user exactly what to do today.

### 2. The first hobby is not the only hobby

Onboarding should ask the user to choose their first hobby. The product must make it
clear that they can add more hobbies later.

### 3. A hobby has a long-term identity

A user should not have disconnected plans for the same hobby. They should have a hobby
profile that contains journeys, sessions, cards, projects, reflections, and progress.

### 4. Practice must be observable

The app should avoid "read this and feel done." A session should end with a task,
checklist, quiz, reflection, or proof of practice.

### 5. The app should remember the learner

Memory is the difference between a content generator and a companion. BetterHobby should
remember active hobbies, current level, completed sessions, skipped sessions, weak
topics, reflections, and completed projects.

### 6. Leveling up should be natural

After one journey ends, the user should be guided into the next useful path. They should
not have to regenerate the same hobby from scratch.

## Core User Model

The product should be modeled around this hierarchy:

```txt
User
  -> Hobby Profiles
      -> Journeys
          -> Daily Sessions
          -> Practice Cards
          -> Progress
          -> Reflections
          -> Projects
```

Example:

```txt
Suraj
  -> Guitar
      -> Beginner Journey
      -> Chord Fluency Journey
      -> First Songs Journey

  -> Photography
      -> Beginner Journey

  -> Cooking
      -> Indian Home Cooking Journey
```

## Primary User Flows

### Flow 1: First-time onboarding

Goal: create the user's first hobby profile and first journey.

Steps:

1. User opens the app.
2. App asks: "Choose your first hobby. You can add more anytime."
3. User enters:
   - hobby name
   - current level
   - goal
   - available time per day
   - preferred practice days per week
   - preferred learning style
4. App generates a journey.
5. User lands on the Today screen.
6. The first session is ready to start.

Important copy:

```txt
Choose your first hobby. You can add more anytime.
```

This avoids making onboarding feel like a permanent lock-in.

### Flow 2: Daily practice

Goal: give the user a clear reason to return each day.

Steps:

1. User opens the app.
2. Today screen shows active hobbies and due sessions.
3. User taps "Start session."
4. User completes the session sections:
   - Learn
   - Resource
   - Practice
   - Check Yourself
   - Reflect
5. User marks the session complete.
6. App updates progress and schedules relevant review cards.
7. Tomorrow's next session becomes the next main action.

### Flow 3: Add another hobby

Goal: support users with multiple interests.

Steps:

1. User opens My Hobbies.
2. User taps Add Hobby.
3. User enters hobby, level, goal, and schedule.
4. App creates a new hobby profile and journey.
5. The new hobby appears on Today and My Hobbies.

### Flow 4: Pause or resume a hobby

Goal: allow realistic hobby behavior without punishing the user.

Steps:

1. User opens My Hobbies.
2. User pauses a hobby.
3. Paused hobby no longer creates daily pressure.
4. User can resume later.
5. On resume, app offers:
   - continue where you left off
   - do a recovery session
   - restart current week

### Flow 5: Complete a journey and level up

Goal: make long-term progression obvious.

Steps:

1. User completes all required sessions or final milestone.
2. App shows a completion summary:
   - sessions completed
   - skills practiced
   - projects completed
   - weak areas improved
3. App recommends next journeys.
4. User chooses one.
5. New journey starts under the same hobby profile.

Example:

```txt
You completed Beginner Guitar.

Recommended next journeys:
1. Chord Fluency
2. Rhythm Basics
3. First Songs
```

## App Information Architecture

### Today

This should become the default home screen after onboarding.

Purpose:

- show what to do now
- reduce choice overload
- make returning feel useful

Content:

- active hobby sessions due today
- review cards due today
- missed sessions recovery prompt
- next milestone preview

Example:

```txt
Today

Guitar
Day 6: Chord Switching Practice
20 minutes
Start session

Photography
Day 2: Manual Mode Basics
15 minutes
Start session

Review
6 cards due
Start review
```

### My Hobbies

Purpose:

- manage all hobby profiles
- view progress per hobby
- add, pause, resume, or continue hobbies

Actions:

- add hobby
- view active journey
- pause hobby
- resume hobby
- start next journey
- inspect completed journeys

### Journey Timeline

Purpose:

- show the structure without turning the whole plan into one binge-readable page
- let users understand where they are

Content:

- completed sessions
- current session
- locked/upcoming sessions
- milestones
- final project

Important rule:

The timeline can show upcoming titles and rough themes, but the main detailed content
should focus on the current session. The product should not encourage users to consume a
full month of content in one sitting.

### Session Detail

Purpose:

- deliver one focused learning/practice unit

Sections:

1. Learn
2. Resource
3. Practice
4. Check Yourself
5. Reflect

### Review

Purpose:

- make flashcards useful and return-worthy

Content:

- due cards
- weak cards
- cards created from completed sessions
- simple spaced repetition states

## Daily Session Specification

Each daily session should be generated as a structured object, not a blob of text.

### Session fields

```txt
id
hobbyProfileId
journeyId
dayNumber
title
estimatedMinutes
status
scheduledFor
learn
resource
practice
checkYourself
reflectionPrompt
generatedCards
createdAt
completedAt
```

### Learn

Short explanation of one concept.

Requirements:

- plain language
- hobby-specific
- actionable
- not a full article

Example:

```txt
Chord changes are mostly about reducing finger travel. Today you will practice moving
between G and C by keeping your wrist relaxed and landing fingers together instead of one
by one.
```

### Resource

One useful supporting resource.

Resource can be:

- YouTube video
- article
- example
- image reference
- practice prompt

Requirements:

- selected for today's task
- short enough for the user's available time
- not a random content dump

### Practice

Concrete action.

Requirements:

- time-boxed
- specific
- doable today
- tied to the Learn section

Example:

```txt
Set a 10-minute timer. Switch between G and C every four beats. Start slowly. Count only
clean switches where all strings ring clearly.
```

### Check Yourself

A lightweight verification step.

Can be:

- checklist
- quick quiz
- self-assessment
- small test
- "can you do this?" criteria

Example:

```txt
Can you complete 10 clean G-to-C switches in a row at a slow tempo?
```

### Reflect

One prompt that captures memory.

Examples:

- What felt hardest today?
- What improved by the end?
- What should we revisit?
- Was this too easy, right, or too hard?

Reflection data should influence review cards and future sessions.

## Practice Cards Specification

Current flashcards should evolve into practice cards. Their job is not just to display
information. Their job is to help the user remember, practice, and apply.

### Card types

#### Concept Card

Explains one important idea.

Example:

```txt
What does "clean chord switch" mean?
```

#### Quiz Card

Tests understanding.

Example:

```txt
When switching chords, should you move fingers one at a time or aim to land them
together?
```

#### Drill Card

Prompts repeated action.

Example:

```txt
Practice G-to-C switches for 3 minutes. Count only clean changes.
```

#### Mistake Card

Teaches common errors.

Example:

```txt
If your chord sounds muted, your fingers may be touching nearby strings. Curve your
fingers and press closer to the fret.
```

#### Challenge Card

Asks the user to apply the skill.

Example:

```txt
Use G and C to play a simple two-chord rhythm for one minute without stopping.
```

#### Review Card

Revisits a weak topic.

Example:

```txt
Yesterday you marked chord switching as hard. Try 5 clean G-to-C switches before today's
session.
```

### Card fields

```txt
id
hobbyProfileId
journeyId
sessionId
type
front
back
prompt
answer
difficulty
dueAt
lastReviewedAt
reviewCount
correctCount
status
createdAt
```

### Review behavior

MVP spaced repetition can be simple:

- new card: due tomorrow
- easy: due in 3 days
- okay: due tomorrow
- hard: due later today or tomorrow

We do not need a perfect spaced repetition algorithm in the first version. We need the
daily review habit.

## Progress And Memory

BetterHobby should remember:

- hobby profiles
- active journeys
- completed sessions
- skipped sessions
- paused hobbies
- reflections
- weak topics
- completed projects
- card review history
- current level
- next recommended journey

### Progress states

Hobby profile:

```txt
active
paused
completed
archived
```

Journey:

```txt
not_started
active
completed
paused
abandoned
```

Session:

```txt
locked
available
in_progress
completed
skipped
missed
```

Practice card:

```txt
new
due
learning
reviewing
mastered
archived
```

## Proposed Data Model

This is a product-level model. Engineering can adapt names to the existing shared schema,
SQLite tables, and API boundaries.

### HobbyProfile

```txt
id
name
icon
accent
currentLevel
goal
status
preferredMinutesPerDay
preferredDaysPerWeek
preferredLearningStyle
createdAt
updatedAt
```

### Journey

```txt
id
hobbyProfileId
title
levelFrom
levelTo
goal
status
durationWeeks
totalSessions
currentSessionIndex
milestones
finalProject
rationale
createdAt
completedAt
```

### DailySession

```txt
id
journeyId
hobbyProfileId
dayNumber
title
estimatedMinutes
scheduledFor
status
learn
resource
practice
checkYourself
reflectionPrompt
createdAt
startedAt
completedAt
```

### SessionReflection

```txt
id
sessionId
hobbyProfileId
journeyId
difficulty
notes
feltEasy
feltHard
shouldRevisit
createdAt
```

### PracticeCard

```txt
id
hobbyProfileId
journeyId
sessionId
type
front
back
prompt
answer
difficulty
dueAt
lastReviewedAt
reviewCount
correctCount
status
createdAt
```

### Project

```txt
id
hobbyProfileId
journeyId
title
description
successCriteria
status
createdAt
completedAt
```

## AI Generation Requirements

The AI should generate structured journeys, not a single readable plan.

### Journey generation input

```txt
hobby
currentLevel
goal
minutesPerDay
daysPerWeek
learningStyle
existingHobbyContext optional
```

### Journey generation output

```txt
hobbyIdentity
journey
sessions
initialPracticeCards
milestones
finalProject
nextJourneySuggestions
```

### Important generation rules

- Generate a journey with daily sessions.
- Each session should be small and action-oriented.
- Each session should include Learn, Resource, Practice, Check Yourself, and Reflect.
- Do not produce a giant long-form course.
- Do not expose all detailed session content as the main consumption surface.
- Cards should be useful for review or practice, not generic trivia.
- Next journey suggestions should be specific to the hobby and level.

## MVP Scope

The first version should prove the daily return loop.

### MVP includes

- first hobby onboarding
- multiple hobby profiles
- journey generation
- Today screen
- session detail screen
- completion tracking
- reflection capture
- My Hobbies screen
- basic practice cards
- daily review queue
- level-up recommendation

### MVP does not include

- social feed
- leaderboards
- public profiles
- community challenges
- complex gamification
- account system
- cloud sync
- advanced notifications
- perfect spaced repetition

## Implementation Phases

### Phase 1: Product model foundation

Goal: make the app capable of representing hobbies, journeys, sessions, cards, and
progress.

Tasks:

- add shared schemas for HobbyProfile, Journey, DailySession, SessionReflection,
  PracticeCard, and Project
- add SQLite migrations for the new tables
- add repositories for hobby profiles, journeys, sessions, reflections, and cards
- preserve existing plan data if possible through migration or compatibility
- add pure progress helpers in shared code

Acceptance criteria:

- app can store multiple hobby profiles
- each hobby can have multiple journeys
- each journey can have daily sessions
- progress can be calculated without UI code
- data persists after closing and reopening the app

### Phase 2: Onboarding update

Goal: make first hobby creation clear and non-locking.

Tasks:

- update onboarding copy to "Choose your first hobby. You can add more anytime."
- collect hobby, level, goal, time per day, days per week, and learning style
- create a HobbyProfile before creating a Journey
- route completed onboarding to Today

Acceptance criteria:

- user understands they can add more hobbies later
- first hobby profile is persisted
- first journey is created under that profile
- user lands on Today after onboarding

### Phase 3: Journey generation

Goal: generate daily sessions instead of one flat plan.

Tasks:

- update shared AI response schemas
- update server plan service or create a journey service
- validate generated sessions with Zod
- include milestones and a final project
- create initial practice cards
- add next journey suggestions

Acceptance criteria:

- generation returns structured sessions
- every session has Learn, Resource, Practice, Check Yourself, and Reflect
- every session has an estimated duration
- generated cards are linked to sessions
- invalid AI output fails gracefully or repairs once

### Phase 4: Today screen

Goal: make the app open to the user's next action.

Tasks:

- create Today screen as the main post-onboarding screen
- show active hobbies with due sessions
- show review cards due today
- show missed session recovery state
- add empty state for no active hobbies

Acceptance criteria:

- user can start today's session for any active hobby
- user can start review from Today
- paused hobbies do not create daily pressure
- empty state points to Add Hobby

### Phase 5: Session detail and completion

Goal: make one session feel useful and complete.

Tasks:

- build session detail UI
- render Learn, Resource, Practice, Check Yourself, and Reflect
- allow session start and completion
- save reflection
- update session status
- schedule generated cards

Acceptance criteria:

- user can complete a session end to end
- reflection is saved
- progress updates immediately
- related cards become reviewable
- session remains usable offline after generation

### Phase 6: My Hobbies

Goal: support multiple hobbies as a first-class product feature.

Tasks:

- build My Hobbies screen
- show active, paused, and completed hobbies
- add Add Hobby flow
- add pause and resume actions
- show hobby-level progress
- show completed journeys under each hobby

Acceptance criteria:

- user can add another hobby
- user can switch between hobbies
- user can pause and resume a hobby
- each hobby keeps separate progress

### Phase 7: Practice cards and review queue

Goal: make flashcards useful enough to drive return visits.

Tasks:

- implement card types
- create review queue query
- build review screen
- add simple easy/okay/hard feedback
- update due dates based on feedback
- track review count and correctness

Acceptance criteria:

- user sees cards due today
- user can review cards
- due dates change after review
- hard cards return sooner than easy cards
- cards are linked to hobbies and sessions

### Phase 8: Level-up flow

Goal: make continuation natural after completing a journey.

Tasks:

- detect journey completion
- show completion summary
- recommend next journeys
- allow user to start one
- store new journey under the same hobby profile

Acceptance criteria:

- completing a journey does not dead-end
- user can start the next journey without recreating the hobby
- completed journey remains visible in history

## Suggested Navigation

MVP navigation can be:

```txt
Today
My Hobbies
Review
```

Important screens:

```txt
Onboarding
Today
Session Detail
My Hobbies
Add Hobby
Hobby Detail
Journey Timeline
Review Queue
Review Card
Journey Complete
```

## Metrics To Track

The product should be judged by habit and progress, not just generation.

Primary metrics:

- Day 1 session completion
- Day 2 return rate
- sessions completed per week
- review cards completed per week
- journey completion rate
- next journey start rate

Secondary metrics:

- hobbies added per user
- paused hobbies
- resumed hobbies
- reflection completion rate
- hard card repeat rate
- missed session recovery rate

## Risks And Product Decisions

### Risk: users still binge the whole journey

Decision:

Show the journey timeline, but make the detailed experience centered on today's session.
Upcoming sessions can show titles and themes, while full details become available when
the session is current or near-current.

### Risk: daily sessions feel too rigid

Decision:

Allow pause, resume, skip, and recovery sessions. The app should feel supportive, not
punishing.

### Risk: cards become generic trivia

Decision:

Cards must be linked to session concepts, drills, mistakes, challenges, or weak topics.
Generic facts should be rejected in generation validation where possible.

### Risk: too much scope

Decision:

Build the daily loop first: Today -> Session -> Complete -> Review -> Progress. Social,
community, and advanced gamification come later only if the core loop works.

## Open Questions

- Should session details unlock one day at a time, or should the next few sessions be
  previewable?
- Should missed sessions shift the whole schedule or create lighter recovery sessions?
- Should the app support multiple active sessions per hobby per day?
- Should users be able to manually create a custom session?
- Should review cards be generated immediately with the journey or after each session is
  completed?

## Immediate Next Engineering Target

The next engineering target should be:

```txt
Daily Hobby Journey MVP
```

Definition:

Users can create a first hobby, receive a structured journey, open the app to Today's
session, complete that session, save a reflection, review generated cards, and later add
another hobby without losing the original one.

This is the foundation that makes BetterHobby worth returning to.
