import type { Plan, Technique } from "./domain";

/**
 * Deterministic builders for tests and the mock AI provider. Overrides are
 * shallow-merged so a test states only what it cares about.
 */
export function makeTechnique(overrides: Partial<Technique> = {}): Technique {
  return {
    id: "t-board-safety",
    name: "Stop hanging pieces",
    whyItMatters: "Most games at this level are decided by free material, not strategy.",
    modalityProfile: { video: "supporting", reading: "supporting", practice: "primary" },
    drill: {
      text: "Play three 10-minute games. Before every move, scan: is anything of mine undefended?",
      minutesPerSession: 30,
      sessionsPerWeek: 3,
    },
    masteryCriteria: [
      { id: "c1", text: "I rarely lose pieces to one-move threats" },
      { id: "c2", text: "My pre-move scan caught at least 5 hanging pieces this week" },
    ],
    ...overrides,
  };
}

export function makePlan(overrides: Partial<Plan> = {}): Plan {
  const techniques = Array.from({ length: 6 }, (_, i) =>
    makeTechnique({ id: `t-${i + 1}`, name: `Technique ${i + 1}` }),
  );
  return {
    id: "plan-chess-1",
    hobby: "Chess",
    levelFrom: "I know how the pieces move, but I lose most games",
    levelTo: "I beat my friends consistently",
    weeklyHours: 4,
    rationale:
      "You win and lose on piece blunders right now, so this plan is mostly board safety and simple tactics.",
    emoji: "♟️",
    accent: "sage",
    techniques,
    createdAt: "2026-06-13T00:00:00.000Z",
    ...overrides,
  };
}
