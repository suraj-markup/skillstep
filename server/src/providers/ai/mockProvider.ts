import {
  type Accent,
  type GeneratedJourney,
  GeneratedJourneySchema,
  type GenerateJourneyInput,
  type HobbyIcon,
  makeDailySession,
  makeGeneratedJourney,
  makeHobbyProfile,
  makeJourney,
  makePracticeCard,
  makeProject,
  resolveHobbyIcon,
} from "@skillstep/shared";
import type { AiProvider } from "./provider";

const DEFAULT_IDENTITY: { icon: HobbyIcon; accent: Accent } = {
  icon: "sparkles",
  accent: "amber",
};

const MOCK_HOBBY_IDENTITIES: Record<string, { icon: HobbyIcon; accent: Accent }> = {
  chess: { icon: "strategy", accent: "sage" },
  cooking: { icon: "cooking", accent: "clay" },
  guitar: { icon: "guitar", accent: "rose" },
  photography: { icon: "camera", accent: "sky" },
  poker: { icon: "cards", accent: "violet" },
};

const MOCK_ICON_ACCENTS: Partial<Record<HobbyIcon, Accent>> = {
  art: "rose",
  camera: "sky",
  cars: "clay",
  coffee: "clay",
  cooking: "clay",
  cycling: "sage",
  dance: "rose",
  design: "rose",
  fitness: "sage",
  gardening: "sage",
  guitar: "rose",
  language: "sky",
  music: "rose",
  reading: "sage",
  running: "clay",
  singing: "rose",
  sports: "clay",
  swimming: "sky",
  tennis: "amber",
  travel: "sky",
  video: "sky",
  writing: "amber",
  yoga: "sage",
};

export class MockAiProvider implements AiProvider {
  async generateJourney(input: GenerateJourneyInput): Promise<GeneratedJourney> {
    const hobby = titleCase(input.hobby);
    const icon = resolveHobbyIcon(input.hobby);
    const identity = MOCK_HOBBY_IDENTITIES[input.hobby.trim().toLowerCase()] ?? {
      icon,
      accent: MOCK_ICON_ACCENTS[icon] ?? DEFAULT_IDENTITY.accent,
    };
    const hobbyId = `hobby-${slugify(input.hobby)}`;
    const journeyId = `journey-${slugify(input.hobby)}-${Date.now()}`;
    const createdAt = new Date().toISOString();
    const totalSessions = Math.max(5, input.daysPerWeek * 2);
    const hobbyProfile = makeHobbyProfile({
      id: hobbyId,
      name: hobby,
      icon: identity.icon,
      accent: identity.accent,
      currentLevel: input.currentLevel,
      goal: input.goal,
      preferredMinutesPerDay: input.minutesPerDay,
      preferredDaysPerWeek: input.daysPerWeek,
      preferredLearningStyle: input.learningStyle,
      createdAt,
      updatedAt: createdAt,
    });
    const finalProject = {
      id: `project-${slugify(input.hobby)}-first-result`,
      title: `Finish a small ${hobby} result`,
      description: `Use the skills from this journey to complete one small ${hobby} outcome you can point to.`,
      successCriteria: [
        "I completed the final practice task",
        "I can explain what improved",
        "I know what to practice next",
      ],
    };
    const journey = makeJourney({
      id: journeyId,
      hobbyProfileId: hobbyProfile.id,
      title: `${hobby} Daily Journey`,
      levelFrom: input.currentLevel,
      levelTo: input.goal,
      goal: input.goal,
      durationWeeks: 2,
      totalSessions,
      milestones: [
        {
          id: `milestone-${slugify(input.hobby)}-foundation`,
          title: "Foundation week",
          description: "Build the smallest repeatable daily practice habit.",
          targetSessionNumber: Math.min(input.daysPerWeek, totalSessions),
        },
        {
          id: `milestone-${slugify(input.hobby)}-application`,
          title: "Apply it",
          description: "Use the core skill in a small real practice challenge.",
          targetSessionNumber: totalSessions,
        },
      ],
      finalProject,
      rationale:
        `This journey turns ${hobby} into ${totalSessions} short daily sessions, ` +
        `each sized around ${input.minutesPerDay} minutes and focused on practice over reading.`,
      createdAt,
    });
    const sessions = Array.from({ length: totalSessions }, (_, index) => {
      const dayNumber = index + 1;
      const title =
        dayNumber === 1 ? `Start your ${hobby} baseline` : `${hobby} practice ${dayNumber}`;

      return makeDailySession({
        id: `${journeyId}-session-${dayNumber}`,
        journeyId,
        hobbyProfileId: hobbyProfile.id,
        dayNumber,
        title,
        estimatedMinutes: input.minutesPerDay,
        status: dayNumber === 1 ? "available" : "locked",
        learn: `Today focuses on one useful ${hobby} idea for your goal: ${input.goal}. Keep it small and observable.`,
        resource: {
          type: "prompt",
          title: `${hobby} practice prompt`,
          description: "Use this prompt to practice without opening an endless content feed.",
        },
        practice:
          `Spend ${input.minutesPerDay} minutes on ${hobby}. Start slowly, notice one mistake, ` +
          "and repeat the smallest useful action until it feels more controlled.",
        checkYourself: {
          prompt: "Can you point to one thing that improved by the end?",
          items: [
            "I practiced for the planned time",
            "I noticed one specific mistake",
            "I know what to repeat next time",
          ],
        },
        reflectionPrompt: "What felt hardest today, and what should we revisit?",
        createdAt,
      });
    });
    const practiceCards = sessions.flatMap((session) => [
      makePracticeCard({
        id: `${session.id}-concept-card`,
        hobbyProfileId: hobbyProfile.id,
        journeyId,
        sessionId: session.id,
        type: "concept",
        front: `What is today's ${hobby} focus?`,
        back: session.learn,
        dueAt: createdAt,
        createdAt,
      }),
      makePracticeCard({
        id: `${session.id}-drill-card`,
        hobbyProfileId: hobbyProfile.id,
        journeyId,
        sessionId: session.id,
        type: "drill",
        front: `Repeat today's ${hobby} drill`,
        back: session.practice,
        dueAt: createdAt,
        createdAt,
      }),
    ]);
    const projects = [
      makeProject({
        id: finalProject.id,
        hobbyProfileId: hobbyProfile.id,
        journeyId,
        title: finalProject.title,
        description: finalProject.description,
        successCriteria: finalProject.successCriteria,
        createdAt,
      }),
    ];

    const generatedJourney = makeGeneratedJourney({
      hobbyProfile,
      journey,
      sessions,
      practiceCards,
      projects,
      nextJourneySuggestions: [
        `${hobby} next level`,
        `${hobby} focused drills`,
        `${hobby} project track`,
      ],
    });

    return GeneratedJourneySchema.parse(generatedJourney);
  }
}

function slugify(value: string): string {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "hobby"
  );
}

function titleCase(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .map((word) => `${word.slice(0, 1).toUpperCase()}${word.slice(1).toLowerCase()}`)
    .join(" ");
}
