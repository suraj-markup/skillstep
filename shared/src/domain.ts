import { z } from "zod";

/**
 * Bump when the persisted shape changes; the app's hydration layer uses this
 * to run migrations instead of crashing on stale state (ADR 0004).
 */
export const SCHEMA_VERSION = 2;

/** Hobby accent palette — names map to tokens in the app's theme. */
export const ACCENTS = ["amber", "sage", "sky", "rose", "violet", "clay"] as const;
export const AccentSchema = z.enum(ACCENTS);
export type Accent = z.infer<typeof AccentSchema>;

export const HOBBY_ICONS = [
  "sparkles",
  "strategy",
  "cooking",
  "guitar",
  "camera",
  "cards",
  "fitness",
  "art",
  "book",
  "singing",
  "yoga",
  "dance",
  "gardening",
  "coffee",
  "tennis",
  "language",
  "writing",
  "video",
  "design",
  "content",
  "cycling",
  "swimming",
  "running",
  "travel",
  "music",
  "gaming",
  "reading",
  "sports",
  "cars",
] as const;
export const HobbyIconSchema = z.enum(HOBBY_ICONS);
export type HobbyIcon = z.infer<typeof HobbyIconSchema>;

export const HOBBY_PROFILE_STATUSES = ["active", "paused", "completed", "archived"] as const;
export const HobbyProfileStatusSchema = z.enum(HOBBY_PROFILE_STATUSES);
export type HobbyProfileStatus = z.infer<typeof HobbyProfileStatusSchema>;

export const LEARNING_STYLES = ["balanced", "video", "reading", "practice", "projects"] as const;
export const LearningStyleSchema = z.enum(LEARNING_STYLES);
export type LearningStyle = z.infer<typeof LearningStyleSchema>;

export const HobbyProfileSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(60),
  icon: HobbyIconSchema,
  accent: AccentSchema,
  currentLevel: z.string().min(1).max(160),
  goal: z.string().min(1).max(240),
  status: HobbyProfileStatusSchema,
  preferredMinutesPerDay: z.number().int().positive().max(240),
  preferredDaysPerWeek: z.number().int().positive().max(7),
  preferredLearningStyle: LearningStyleSchema,
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});
export type HobbyProfile = z.infer<typeof HobbyProfileSchema>;

export const JOURNEY_STATUSES = [
  "not_started",
  "active",
  "completed",
  "paused",
  "abandoned",
] as const;
export const JourneyStatusSchema = z.enum(JOURNEY_STATUSES);
export type JourneyStatus = z.infer<typeof JourneyStatusSchema>;

export const JourneyMilestoneSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(360),
  targetSessionNumber: z.number().int().positive().max(366),
});
export type JourneyMilestone = z.infer<typeof JourneyMilestoneSchema>;

export const FinalProjectBriefSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(800),
  successCriteria: z.array(z.string().min(1).max(220)).min(1).max(5),
});
export type FinalProjectBrief = z.infer<typeof FinalProjectBriefSchema>;

export const JourneySchema = z.object({
  id: z.string().min(1),
  hobbyProfileId: z.string().min(1),
  title: z.string().min(1).max(120),
  levelFrom: z.string().min(1).max(160),
  levelTo: z.string().min(1).max(160),
  goal: z.string().min(1).max(240),
  status: JourneyStatusSchema,
  durationWeeks: z.number().int().positive().max(52),
  totalSessions: z.number().int().positive().max(366),
  currentSessionIndex: z.number().int().nonnegative().max(366),
  milestones: z.array(JourneyMilestoneSchema).max(12),
  finalProject: FinalProjectBriefSchema.nullable(),
  rationale: z.string().min(1).max(1600),
  createdAt: z.string().min(1),
  completedAt: z.string().min(1).nullable(),
});
export type Journey = z.infer<typeof JourneySchema>;

export const SESSION_STATUSES = [
  "locked",
  "available",
  "in_progress",
  "completed",
  "skipped",
  "missed",
] as const;
export const SessionStatusSchema = z.enum(SESSION_STATUSES);
export type SessionStatus = z.infer<typeof SessionStatusSchema>;

export const SessionResourceSchema = z.object({
  type: z.enum(["video", "article", "example", "image", "prompt"]),
  title: z.string().min(1).max(160),
  url: z.string().url().optional(),
  description: z.string().min(1).max(500).optional(),
  durationMinutes: z.number().int().positive().max(240).optional(),
});
export type SessionResource = z.infer<typeof SessionResourceSchema>;

export const CheckYourselfSchema = z.object({
  prompt: z.string().min(1).max(360),
  items: z.array(z.string().min(1).max(220)).min(1).max(6),
});
export type CheckYourself = z.infer<typeof CheckYourselfSchema>;

export const DailySessionSchema = z.object({
  id: z.string().min(1),
  journeyId: z.string().min(1),
  hobbyProfileId: z.string().min(1),
  dayNumber: z.number().int().positive().max(366),
  title: z.string().min(1).max(120),
  estimatedMinutes: z.number().int().positive().max(240),
  scheduledFor: z.string().min(1).nullable(),
  status: SessionStatusSchema,
  learn: z.string().min(1).max(1200),
  resource: SessionResourceSchema.nullable(),
  practice: z.string().min(1).max(1200),
  checkYourself: CheckYourselfSchema,
  reflectionPrompt: z.string().min(1).max(300),
  createdAt: z.string().min(1),
  startedAt: z.string().min(1).nullable(),
  completedAt: z.string().min(1).nullable(),
});
export type DailySession = z.infer<typeof DailySessionSchema>;

export const REFLECTION_DIFFICULTIES = ["easy", "right", "hard"] as const;
export const ReflectionDifficultySchema = z.enum(REFLECTION_DIFFICULTIES);
export type ReflectionDifficulty = z.infer<typeof ReflectionDifficultySchema>;

export const SessionReflectionSchema = z.object({
  id: z.string().min(1),
  sessionId: z.string().min(1),
  hobbyProfileId: z.string().min(1),
  journeyId: z.string().min(1),
  difficulty: ReflectionDifficultySchema,
  notes: z.string().max(1600),
  feltEasy: z.string().max(500).nullable(),
  feltHard: z.string().max(500).nullable(),
  shouldRevisit: z.boolean(),
  createdAt: z.string().min(1),
});
export type SessionReflection = z.infer<typeof SessionReflectionSchema>;

export const PRACTICE_CARD_TYPES = [
  "concept",
  "quiz",
  "drill",
  "mistake",
  "challenge",
  "review",
] as const;
export const PracticeCardTypeSchema = z.enum(PRACTICE_CARD_TYPES);
export type PracticeCardType = z.infer<typeof PracticeCardTypeSchema>;

export const CARD_DIFFICULTIES = ["new", "easy", "okay", "hard"] as const;
export const CardDifficultySchema = z.enum(CARD_DIFFICULTIES);
export type CardDifficulty = z.infer<typeof CardDifficultySchema>;

export const PRACTICE_CARD_STATUSES = [
  "new",
  "due",
  "learning",
  "reviewing",
  "mastered",
  "archived",
] as const;
export const PracticeCardStatusSchema = z.enum(PRACTICE_CARD_STATUSES);
export type PracticeCardStatus = z.infer<typeof PracticeCardStatusSchema>;

export const PracticeCardSchema = z.object({
  id: z.string().min(1),
  hobbyProfileId: z.string().min(1),
  journeyId: z.string().min(1),
  sessionId: z.string().min(1),
  type: PracticeCardTypeSchema,
  front: z.string().min(1).max(500),
  back: z.string().min(1).max(1200),
  prompt: z.string().max(500).nullable(),
  answer: z.string().max(1200).nullable(),
  difficulty: CardDifficultySchema,
  dueAt: z.string().min(1),
  lastReviewedAt: z.string().min(1).nullable(),
  reviewCount: z.number().int().nonnegative(),
  correctCount: z.number().int().nonnegative(),
  status: PracticeCardStatusSchema,
  createdAt: z.string().min(1),
});
export type PracticeCard = z.infer<typeof PracticeCardSchema>;

export const PROJECT_STATUSES = ["not_started", "in_progress", "completed", "skipped"] as const;
export const ProjectStatusSchema = z.enum(PROJECT_STATUSES);
export type ProjectStatus = z.infer<typeof ProjectStatusSchema>;

export const ProjectSchema = z.object({
  id: z.string().min(1),
  hobbyProfileId: z.string().min(1),
  journeyId: z.string().min(1),
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(800),
  successCriteria: z.array(z.string().min(1).max(220)).min(1).max(5),
  status: ProjectStatusSchema,
  createdAt: z.string().min(1),
  completedAt: z.string().min(1).nullable(),
});
export type Project = z.infer<typeof ProjectSchema>;

export const GenerateJourneyInputSchema = z.object({
  hobby: z.string().trim().min(1).max(60),
  currentLevel: z.string().trim().min(1).max(160),
  goal: z.string().trim().min(1).max(240),
  minutesPerDay: z.number().int().positive().max(240),
  daysPerWeek: z.number().int().positive().max(7),
  learningStyle: LearningStyleSchema,
  existingHobbyContext: z.string().trim().max(1200).optional(),
});
export type GenerateJourneyInput = z.infer<typeof GenerateJourneyInputSchema>;

export const GeneratedJourneySchema = z.object({
  hobbyProfile: HobbyProfileSchema,
  journey: JourneySchema,
  sessions: z.array(DailySessionSchema).min(1).max(366),
  practiceCards: z.array(PracticeCardSchema).max(1200),
  projects: z.array(ProjectSchema).max(20),
  nextJourneySuggestions: z.array(z.string().min(1).max(120)).min(1).max(5),
});
export type GeneratedJourney = z.infer<typeof GeneratedJourneySchema>;
