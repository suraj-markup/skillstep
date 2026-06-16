import type {
  DailySession,
  GeneratedJourney,
  HobbyProfile,
  Journey,
  PracticeCard,
  Project,
} from "./domain";

export function makeHobbyProfile(overrides: Partial<HobbyProfile> = {}): HobbyProfile {
  return {
    id: "hobby-chess",
    name: "Chess",
    icon: "strategy",
    accent: "sage",
    currentLevel: "I know how the pieces move",
    goal: "Beat my friends consistently",
    status: "active",
    preferredMinutesPerDay: 20,
    preferredDaysPerWeek: 5,
    preferredLearningStyle: "balanced",
    createdAt: "2026-06-16T00:00:00.000Z",
    updatedAt: "2026-06-16T00:00:00.000Z",
    ...overrides,
  };
}

export function makeJourney(overrides: Partial<Journey> = {}): Journey {
  return {
    id: "journey-chess-beginner",
    hobbyProfileId: "hobby-chess",
    title: "Chess Beginner Journey",
    levelFrom: "I know how the pieces move",
    levelTo: "I avoid simple blunders",
    goal: "Beat my friends consistently",
    status: "active",
    durationWeeks: 4,
    totalSessions: 20,
    currentSessionIndex: 0,
    milestones: [
      {
        id: "milestone-board-safety",
        title: "Board safety",
        description: "Catch simple one-move threats before moving.",
        targetSessionNumber: 5,
      },
    ],
    finalProject: {
      id: "project-first-reviewed-game",
      title: "Review one full game",
      description: "Play and review one game where you annotate your biggest mistakes.",
      successCriteria: ["I wrote down three avoidable mistakes"],
    },
    rationale: "This journey turns board safety into a daily practice habit.",
    createdAt: "2026-06-16T00:00:00.000Z",
    completedAt: null,
    ...overrides,
  };
}

export function makeDailySession(overrides: Partial<DailySession> = {}): DailySession {
  return {
    id: "session-chess-1",
    journeyId: "journey-chess-beginner",
    hobbyProfileId: "hobby-chess",
    dayNumber: 1,
    title: "Scan before every move",
    estimatedMinutes: 20,
    scheduledFor: "2026-06-16",
    status: "available",
    learn: "Most beginner games are decided by pieces left undefended.",
    resource: {
      type: "prompt",
      title: "Board safety prompt",
      description: "Before every move, ask what your opponent attacks.",
    },
    practice: "Play one 10-minute game and pause before every move to scan for threats.",
    checkYourself: {
      prompt: "Can you name what your opponent attacked before each move?",
      items: ["I checked my undefended pieces", "I checked my opponent's captures"],
    },
    reflectionPrompt: "What threat did you miss most often?",
    createdAt: "2026-06-16T00:00:00.000Z",
    startedAt: null,
    completedAt: null,
    ...overrides,
  };
}

export function makePracticeCard(overrides: Partial<PracticeCard> = {}): PracticeCard {
  return {
    id: "card-board-safety",
    hobbyProfileId: "hobby-chess",
    journeyId: "journey-chess-beginner",
    sessionId: "session-chess-1",
    type: "concept",
    front: "What is board safety?",
    back: "Checking whether your pieces are attacked or undefended before you move.",
    prompt: null,
    answer: null,
    difficulty: "new",
    dueAt: "2026-06-17T00:00:00.000Z",
    lastReviewedAt: null,
    reviewCount: 0,
    correctCount: 0,
    status: "new",
    createdAt: "2026-06-16T00:00:00.000Z",
    ...overrides,
  };
}

export function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: "project-first-reviewed-game",
    hobbyProfileId: "hobby-chess",
    journeyId: "journey-chess-beginner",
    title: "Review one full game",
    description: "Play and review one game where you annotate your biggest mistakes.",
    successCriteria: ["I wrote down three avoidable mistakes"],
    status: "not_started",
    createdAt: "2026-06-16T00:00:00.000Z",
    completedAt: null,
    ...overrides,
  };
}

export function makeGeneratedJourney(overrides: Partial<GeneratedJourney> = {}): GeneratedJourney {
  const hobbyProfile = overrides.hobbyProfile ?? makeHobbyProfile();
  const journey = overrides.journey ?? makeJourney({ hobbyProfileId: hobbyProfile.id });
  const sessions =
    overrides.sessions ??
    Array.from({ length: 10 }, (_, index) =>
      makeDailySession({
        id: `session-${index + 1}`,
        dayNumber: index + 1,
        hobbyProfileId: hobbyProfile.id,
        journeyId: journey.id,
        scheduledFor: null,
        status: index === 0 ? "available" : "locked",
        title: `Daily practice ${index + 1}`,
      }),
    );
  const practiceCards =
    overrides.practiceCards ??
    sessions.flatMap((session) => [
      makePracticeCard({
        id: `card-${session.id}-concept`,
        hobbyProfileId: hobbyProfile.id,
        journeyId: journey.id,
        sessionId: session.id,
        type: "concept",
      }),
      makePracticeCard({
        id: `card-${session.id}-drill`,
        hobbyProfileId: hobbyProfile.id,
        journeyId: journey.id,
        sessionId: session.id,
        type: "drill",
        front: `Practice card for ${session.title}`,
        back: session.practice,
      }),
    ]);
  const projects =
    overrides.projects ??
    (journey.finalProject
      ? [
          makeProject({
            id: journey.finalProject.id,
            hobbyProfileId: hobbyProfile.id,
            journeyId: journey.id,
            title: journey.finalProject.title,
            description: journey.finalProject.description,
            successCriteria: journey.finalProject.successCriteria,
          }),
        ]
      : []);

  return {
    hobbyProfile,
    journey,
    sessions,
    practiceCards,
    projects,
    nextJourneySuggestions: ["Next level foundations", "Focused practice track"],
    ...overrides,
  };
}
