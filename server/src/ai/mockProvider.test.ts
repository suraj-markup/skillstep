import { PlanSchema } from "@whittle/shared";
import { describe, expect, it } from "vitest";
import { MockAiProvider } from "./mockProvider";

describe("MockAiProvider", () => {
  it("returns a valid plan shaped from the request", async () => {
    const provider = new MockAiProvider();

    const plan = await provider.generatePlan({
      hobby: "guitar",
      levelFrom: "I know a few open chords",
      levelTo: "I can play a full song cleanly",
      weeklyHours: 3,
    });

    expect(() => PlanSchema.parse(plan)).not.toThrow();
    expect(plan).toMatchObject({
      id: "mock-plan-guitar",
      hobby: "Guitar",
      levelFrom: "I know a few open chords",
      levelTo: "I can play a full song cleanly",
      weeklyHours: 3,
      emoji: "🎸",
      accent: "rose",
    });
    expect(plan.techniques).toHaveLength(6);
  });

  it("uses a safe fallback identity for unknown hobbies", async () => {
    const provider = new MockAiProvider();

    const plan = await provider.generatePlan({
      hobby: "watercolor sketching",
      levelFrom: "I can copy simple shapes",
      levelTo: "I can paint a small landscape",
      weeklyHours: 2,
    });

    expect(plan.id).toBe("mock-plan-watercolor-sketching");
    expect(plan.hobby).toBe("Watercolor Sketching");
    expect(plan.emoji).toBe("✨");
    expect(plan.accent).toBe("amber");
  });
});
