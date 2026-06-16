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
const STARTER_SESSION_COUNT = 3;

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
    const totalSessions = STARTER_SESSION_COUNT;
    const firstMilestoneSession = 1;
    const secondMilestoneSession = 2;
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
      durationWeeks: 1,
      totalSessions,
      milestones: [
        {
          id: `milestone-${slugify(input.hobby)}-foundation`,
          title: "Baseline and foundations",
          description: "Understand your starting point and build the first repeatable drill.",
          targetSessionNumber: firstMilestoneSession,
        },
        {
          id: `milestone-${slugify(input.hobby)}-correction`,
          title: "Mistake correction",
          description: "Notice common mistakes and correct them during practice.",
          targetSessionNumber: secondMilestoneSession,
        },
        {
          id: `milestone-${slugify(input.hobby)}-application`,
          title: "Final application",
          description: "Use the journey skills in one small finished result.",
          targetSessionNumber: totalSessions,
        },
      ],
      finalProject,
      rationale:
        `This starter journey turns ${hobby} into ${totalSessions} short daily sessions, ` +
        `each sized around ${input.minutesPerDay} minutes and focused on practice over reading.`,
      createdAt,
    });
    const sessions = Array.from({ length: totalSessions }, (_, index) => {
      const dayNumber = index + 1;
      const blueprint = getSessionBlueprint(hobby, input, dayNumber, totalSessions);

      return makeDailySession({
        id: `${journeyId}-session-${dayNumber}`,
        journeyId,
        hobbyProfileId: hobbyProfile.id,
        dayNumber,
        title: blueprint.title,
        estimatedMinutes: input.minutesPerDay,
        status: dayNumber === 1 ? "available" : "locked",
        learn: blueprint.learn,
        resource: {
          type: blueprint.resourceType,
          title: blueprint.resourceTitle,
          description: blueprint.resourceDescription,
        },
        practice: blueprint.practice,
        checkYourself: {
          prompt: blueprint.checkPrompt,
          items: blueprint.checkItems,
        },
        reflectionPrompt: blueprint.reflectionPrompt,
        createdAt,
      });
    });
    const practiceCards = sessions.map((session) => {
      const blueprint = getSessionBlueprint(hobby, input, session.dayNumber, totalSessions);
      const dueAt = addDays(createdAt, Math.max(0, session.dayNumber - 1));

      return makePracticeCard({
        id: `${session.id}-${blueprint.primaryCardType}-card`,
        hobbyProfileId: hobbyProfile.id,
        journeyId,
        sessionId: session.id,
        type: blueprint.primaryCardType,
        front: blueprint.primaryCardFront,
        back: blueprint.primaryCardBack,
        prompt: blueprint.primaryCardPrompt,
        answer: blueprint.primaryCardAnswer,
        dueAt,
        createdAt,
      });
    });
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
        `${hobby} fluency track`,
        `${hobby} mistake correction`,
        `${hobby} first finished project`,
      ],
    });

    return GeneratedJourneySchema.parse(generatedJourney);
  }
}

type SessionBlueprint = {
  checkItems: string[];
  checkPrompt: string;
  learn: string;
  practice: string;
  primaryCardAnswer: string | null;
  primaryCardBack: string;
  primaryCardFront: string;
  primaryCardPrompt: string | null;
  primaryCardType: "concept" | "quiz" | "drill" | "mistake" | "challenge" | "review";
  reflectionPrompt: string;
  resourceDescription: string;
  resourceTitle: string;
  resourceType: "prompt" | "example";
  secondaryCardAnswer: string | null;
  secondaryCardBack: string;
  secondaryCardFront: string;
  secondaryCardPrompt: string | null;
  secondaryCardType: "concept" | "quiz" | "drill" | "mistake" | "challenge" | "review";
  title: string;
};

function getSessionBlueprint(
  hobby: string,
  input: GenerateJourneyInput,
  dayNumber: number,
  totalSessions: number,
): SessionBlueprint {
  if (dayNumber === 1) {
    return {
      title: `Find your ${hobby} baseline`,
      learn: `A useful journey starts with a baseline. Today is not about being good at ${hobby}; it is about seeing what is already working and what breaks first.`,
      resourceType: "prompt",
      resourceTitle: "Baseline prompt",
      resourceDescription: "Try the hobby once, slowly, and notice the first point of friction.",
      practice: `Spend ${input.minutesPerDay} minutes doing ${hobby} exactly as you normally would. Write down one thing that felt easy and one thing that broke down.`,
      checkPrompt: "Can you name your current baseline?",
      checkItems: [
        "I practiced for the planned time",
        "I noticed one specific weak spot",
        "I wrote what I want to improve next",
      ],
      reflectionPrompt: "What broke down first, and what felt easier than expected?",
      primaryCardType: "concept",
      primaryCardFront: `What is a ${hobby} baseline?`,
      primaryCardBack:
        "A baseline is a simple snapshot of what you can do today before training changes it.",
      primaryCardPrompt: null,
      primaryCardAnswer: null,
      secondaryCardType: "review",
      secondaryCardFront: "What did your first practice reveal?",
      secondaryCardBack: `Your goal is: ${input.goal}. Keep comparing future practice against today's baseline.`,
      secondaryCardPrompt: "Recall one weak spot from Day 1.",
      secondaryCardAnswer: null,
    };
  }

  if (dayNumber === totalSessions) {
    return {
      title: `Complete a small ${hobby} result`,
      learn: `A finished result makes progress visible. Today you will combine the journey's skills into one small ${hobby} attempt.`,
      resourceType: "prompt",
      resourceTitle: "Final project prompt",
      resourceDescription: "Use the simplest possible version of your goal and finish it.",
      practice: `Use ${input.minutesPerDay} minutes to complete one small ${hobby} result connected to "${input.goal}". Keep it simple enough to finish today.`,
      checkPrompt: "Did you finish something observable?",
      checkItems: [
        "I completed one small result",
        "I can name what improved",
        "I know the next path I want",
      ],
      reflectionPrompt: "What result did you finish, and what should your next journey focus on?",
      primaryCardType: "challenge",
      primaryCardFront: `Finish one small ${hobby} result`,
      primaryCardBack:
        "A small finished result is more useful than another unfinished practice idea.",
      primaryCardPrompt: `Apply the journey to ${input.goal}.`,
      primaryCardAnswer: null,
      secondaryCardType: "review",
      secondaryCardFront: "What should your next journey improve?",
      secondaryCardBack: "Use today's finished result to choose the next focused path.",
      secondaryCardPrompt: "Name one next-level focus.",
      secondaryCardAnswer: null,
    };
  }

  const phase = dayNumber / totalSessions;
  if (phase < 0.4) {
    return {
      title: `Build one ${hobby} foundation`,
      learn: `Foundations make later practice easier. Today focuses on one small ${hobby} habit that supports "${input.goal}".`,
      resourceType: "example",
      resourceTitle: "Foundation example",
      resourceDescription: "Look for the smallest repeatable action, not the full skill.",
      practice: `Spend ${input.minutesPerDay} minutes repeating one basic ${hobby} action slowly. Stop twice and adjust one detail.`,
      checkPrompt: "Can you repeat the foundation with control?",
      checkItems: [
        "I practiced slowly before speeding up",
        "I adjusted one specific detail",
        "I can repeat the action more consistently",
      ],
      reflectionPrompt: "Which small adjustment made the biggest difference?",
      primaryCardType: "drill",
      primaryCardFront: `Repeat the core ${hobby} foundation`,
      primaryCardBack: "Slow repetition with one clear adjustment builds control.",
      primaryCardPrompt: `Practice one ${hobby} action for three minutes.`,
      primaryCardAnswer: null,
      secondaryCardType: "quiz",
      secondaryCardFront: "What should you change during slow practice?",
      secondaryCardBack: "Change one detail at a time so you can tell what helped.",
      secondaryCardPrompt: "Choose the better practice rule.",
      secondaryCardAnswer: "Adjust one specific detail, then repeat.",
    };
  }

  if (phase < 0.75) {
    return {
      title: `Fix a common ${hobby} mistake`,
      learn: `Most progress comes from spotting repeat mistakes. Today you will practice noticing one mistake before it becomes automatic.`,
      resourceType: "prompt",
      resourceTitle: "Mistake spotting prompt",
      resourceDescription: "Pause during practice and name the mistake out loud or in notes.",
      practice: `Spend ${input.minutesPerDay} minutes practicing ${hobby}. Each time something feels off, pause, name the mistake, and do one corrected repeat.`,
      checkPrompt: "Did you catch and correct a mistake?",
      checkItems: [
        "I noticed one repeated mistake",
        "I tried a corrected version",
        "I know what cue will help next time",
      ],
      reflectionPrompt: "What mistake showed up most often, and what cue helped?",
      primaryCardType: "mistake",
      primaryCardFront: `Common ${hobby} mistake: repeating without noticing`,
      primaryCardBack:
        "Correction starts by naming the mistake, then repeating once with a specific cue.",
      primaryCardPrompt: "What should you do when practice feels off?",
      primaryCardAnswer: "Pause, name the mistake, and repeat with one correction.",
      secondaryCardType: "drill",
      secondaryCardFront: `Correct one ${hobby} repeat`,
      secondaryCardBack: "One corrected repeat is more useful than five careless repeats.",
      secondaryCardPrompt: `Do one slow ${hobby} repeat with a correction cue.`,
      secondaryCardAnswer: null,
    };
  }

  return {
    title: `Apply ${hobby} under light pressure`,
    learn: `Skills become useful when applied under a small constraint. Today adds just enough pressure to make practice realistic.`,
    resourceType: "prompt",
    resourceTitle: "Light pressure prompt",
    resourceDescription: "Use a timer, a simple target, or one attempt limit.",
    practice: `Set a short timer inside your ${input.minutesPerDay} minutes. Attempt one small ${hobby} challenge connected to "${input.goal}" and notice what holds up.`,
    checkPrompt: "Could you apply the skill under a constraint?",
    checkItems: [
      "I used a timer or simple target",
      "I completed one challenge attempt",
      "I know what failed under pressure",
    ],
    reflectionPrompt: "What changed when you added light pressure?",
    primaryCardType: "challenge",
    primaryCardFront: `Try one constrained ${hobby} challenge`,
    primaryCardBack: "A small constraint shows whether the skill is usable, not just familiar.",
    primaryCardPrompt: `Apply ${hobby} with a timer or target.`,
    primaryCardAnswer: null,
    secondaryCardType: "review",
    secondaryCardFront: "What failed under light pressure?",
    secondaryCardBack: "That failure is a strong clue for the next practice session.",
    secondaryCardPrompt: "Recall one pressure point.",
    secondaryCardAnswer: null,
  };
}

function addDays(isoDate: string, days: number): string {
  const date = new Date(isoDate);
  date.setDate(date.getDate() + days);
  return date.toISOString();
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
