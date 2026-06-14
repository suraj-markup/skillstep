import { z } from "zod";

/**
 * Bump when the persisted shape changes; the app's hydration layer uses this
 * to run migrations instead of crashing on stale state (ADR 0004).
 */
export const SCHEMA_VERSION = 1;

/** Hobby accent palette — names map to tokens in the app's theme. */
export const ACCENTS = ["amber", "sage", "sky", "rose", "violet", "clay"] as const;
export const AccentSchema = z.enum(ACCENTS);
export type Accent = z.infer<typeof AccentSchema>;

/**
 * How much a learning format matters for a given technique. The AI sets this
 * per technique; the UI weights its Watch / Read / Practice sections by it.
 * This is what makes guitar video-led and poker theory reading-led — format
 * is a decision, never a fixed template.
 */
export const EmphasisSchema = z.enum(["primary", "supporting", "none"]);
export type Emphasis = z.infer<typeof EmphasisSchema>;

export const ModalityProfileSchema = z.object({
  video: EmphasisSchema,
  reading: EmphasisSchema,
  practice: EmphasisSchema,
});
export type ModalityProfile = z.infer<typeof ModalityProfileSchema>;

/**
 * An observable, self-assessed "I can do X" statement. Checking these is what
 * makes mastering a technique mean something — they are assessments of doing,
 * never quiz questions.
 */
export const MasteryCriterionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1).max(200),
});
export type MasteryCriterion = z.infer<typeof MasteryCriterionSchema>;

/** One concrete, repeatable practice assignment, sized to the user's time. */
export const DrillSchema = z.object({
  text: z.string().min(1).max(600),
  minutesPerSession: z.number().int().positive().max(240),
  sessionsPerWeek: z.number().int().positive().max(14),
});
export type Drill = z.infer<typeof DrillSchema>;

export const TechniqueSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(120),
  /** The one-line "why this, why now" shown on the technique card. */
  whyItMatters: z.string().min(1).max(300),
  modalityProfile: ModalityProfileSchema,
  drill: DrillSchema,
  masteryCriteria: z.array(MasteryCriterionSchema).min(2).max(4),
});
export type Technique = z.infer<typeof TechniqueSchema>;

export const GeneratePlanInputSchema = z.object({
  hobby: z.string().trim().min(1).max(60),
  levelFrom: z.string().trim().min(1).max(160),
  levelTo: z.string().trim().min(1).max(160),
  weeklyHours: z.number().positive().max(60),
});
export type GeneratePlanInput = z.infer<typeof GeneratePlanInputSchema>;

/**
 * The finite bridge between two skill levels: 5–8 techniques, no more.
 * The bounds are a product decision enforced at the schema level — an AI
 * response with 12 techniques is invalid output, not an extra-generous plan.
 */
export const PlanSchema = z.object({
  id: z.string().min(1),
  hobby: z.string().min(1).max(60),
  levelFrom: z.string().min(1).max(160),
  levelTo: z.string().min(1).max(160),
  weeklyHours: z.number().positive().max(60),
  /** The AI's visible reasoning for why the plan looks the way it does. */
  rationale: z.string().min(1).max(1200),
  emoji: z.string().min(1).max(8),
  accent: AccentSchema,
  techniques: z.array(TechniqueSchema).min(5).max(8),
  createdAt: z.string().min(1),
});
export type Plan = z.infer<typeof PlanSchema>;

/** A real video resolved via the YouTube Data API — never invented by the LLM. */
export const VideoResourceSchema = z.object({
  videoId: z.string().min(1),
  title: z.string().min(1),
  channelTitle: z.string().min(1),
  durationSec: z.number().int().nonnegative(),
});
export type VideoResource = z.infer<typeof VideoResourceSchema>;

export const TECHNIQUE_STATUSES = ["todo", "in_progress", "mastered", "struck"] as const;
export const TechniqueStatusSchema = z.enum(TECHNIQUE_STATUSES);
export type TechniqueStatus = z.infer<typeof TechniqueStatusSchema>;

/**
 * The user's relationship to one technique. Kept separate from the Technique
 * itself: AI content is immutable, user state is mutable, and the two never
 * share a write path (see "Data model and ownership" in ARCHITECTURE.md).
 */
export const TechniqueUserStateSchema = z.object({
  status: TechniqueStatusSchema,
  /** ids of mastery criteria the user has checked off */
  checkedCriteria: z.array(z.string()),
});
export type TechniqueUserState = z.infer<typeof TechniqueUserStateSchema>;

/** Lazily fetched content, frozen onto the device after first open (ADR 0007). */
export const TechniqueContentSchema = z.object({
  videos: z.array(VideoResourceSchema).optional(),
  /** Markdown primer written by the AI. */
  primer: z.string().optional(),
});
export type TechniqueContent = z.infer<typeof TechniqueContentSchema>;
