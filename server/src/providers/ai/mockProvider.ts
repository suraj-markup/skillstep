import {
  type Accent,
  type GeneratePlanInput,
  makePlan,
  type PlanIcon,
  PlanSchema,
} from "@skillstep/shared";
import type { AiProvider } from "./provider";

const DEFAULT_IDENTITY: { icon: PlanIcon; accent: Accent } = { icon: "sparkles", accent: "amber" };

const MOCK_HOBBY_IDENTITIES: Record<string, { icon: PlanIcon; accent: Accent }> = {
  chess: { icon: "strategy", accent: "sage" },
  cooking: { icon: "cooking", accent: "clay" },
  guitar: { icon: "guitar", accent: "rose" },
  photography: { icon: "camera", accent: "sky" },
  poker: { icon: "cards", accent: "violet" },
};

export class MockAiProvider implements AiProvider {
  async generatePlan(input: GeneratePlanInput) {
    const hobby = titleCase(input.hobby);
    const identity = MOCK_HOBBY_IDENTITIES[input.hobby.trim().toLowerCase()] ?? DEFAULT_IDENTITY;

    const plan = makePlan({
      id: `mock-plan-${slugify(input.hobby)}`,
      hobby,
      levelFrom: input.levelFrom,
      levelTo: input.levelTo,
      weeklyHours: input.weeklyHours,
      icon: identity.icon,
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
