import { type Accent, type GeneratePlanInput, makePlan, PlanSchema } from "@whittle/shared";
import type { AiProvider } from "./provider";

const DEFAULT_IDENTITY: { emoji: string; accent: Accent } = { emoji: "✨", accent: "amber" };

const HOBBY_IDENTITIES: Record<string, { emoji: string; accent: Accent }> = {
  chess: { emoji: "♟️", accent: "sage" },
  cooking: { emoji: "🍳", accent: "clay" },
  guitar: { emoji: "🎸", accent: "rose" },
  photography: { emoji: "📷", accent: "sky" },
  poker: { emoji: "♠️", accent: "violet" },
};

export class MockAiProvider implements AiProvider {
  async generatePlan(input: GeneratePlanInput) {
    const hobby = titleCase(input.hobby);
    const identity = HOBBY_IDENTITIES[input.hobby.trim().toLowerCase()] ?? DEFAULT_IDENTITY;

    const plan = makePlan({
      id: `mock-plan-${slugify(input.hobby)}`,
      hobby,
      levelFrom: input.levelFrom,
      levelTo: input.levelTo,
      weeklyHours: input.weeklyHours,
      emoji: identity.emoji,
      accent: identity.accent,
      rationale:
        `This mock plan narrows ${hobby} into a small set of practice-first techniques ` +
        `for the jump from "${input.levelFrom}" to "${input.levelTo}".`,
      createdAt: "2026-06-14T00:00:00.000Z",
    });

    return PlanSchema.parse(plan);
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
