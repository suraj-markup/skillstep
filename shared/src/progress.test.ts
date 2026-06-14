import { describe, expect, it } from "vitest";
import { makePlan } from "./fixtures";
import { computeProgress, isPlanComplete } from "./progress";

describe("computeProgress", () => {
  it("counts mastered and in-progress techniques", () => {
    const plan = makePlan();

    const progress = computeProgress(plan, {
      "t-1": { status: "mastered", checkedCriteria: ["c1", "c2"] },
      "t-2": { status: "in_progress", checkedCriteria: ["c1"] },
    });

    expect(progress).toEqual({
      total: 6,
      struck: 0,
      active: 6,
      mastered: 1,
      inProgress: 1,
      percent: 17,
    });
    expect(isPlanComplete(progress)).toBe(false);
  });

  it("removes struck techniques from the progress denominator", () => {
    const plan = makePlan();

    const progress = computeProgress(plan, {
      "t-1": { status: "mastered", checkedCriteria: ["c1", "c2"] },
      "t-2": { status: "mastered", checkedCriteria: ["c1", "c2"] },
      "t-3": { status: "struck", checkedCriteria: [] },
      "t-4": { status: "struck", checkedCriteria: [] },
    });

    expect(progress.active).toBe(4);
    expect(progress.percent).toBe(50);
  });

  it("treats a plan as complete only when every active technique is mastered", () => {
    const plan = makePlan({ techniques: makePlan().techniques.slice(0, 5) });

    const progress = computeProgress(plan, {
      "t-1": { status: "mastered", checkedCriteria: ["c1", "c2"] },
      "t-2": { status: "mastered", checkedCriteria: ["c1", "c2"] },
      "t-3": { status: "mastered", checkedCriteria: ["c1", "c2"] },
      "t-4": { status: "mastered", checkedCriteria: ["c1", "c2"] },
      "t-5": { status: "struck", checkedCriteria: [] },
    });

    expect(progress.percent).toBe(100);
    expect(isPlanComplete(progress)).toBe(true);
  });

  it("does not mark an all-struck plan complete", () => {
    const plan = makePlan({ techniques: makePlan().techniques.slice(0, 5) });
    const states = Object.fromEntries(
      plan.techniques.map((technique) => [
        technique.id,
        { status: "struck" as const, checkedCriteria: [] },
      ]),
    );

    const progress = computeProgress(plan, states);

    expect(progress.active).toBe(0);
    expect(progress.percent).toBe(0);
    expect(isPlanComplete(progress)).toBe(false);
  });
});
