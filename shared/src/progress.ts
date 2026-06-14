import type { Plan, TechniqueUserState } from "./domain";

export interface ProgressSummary {
  /** Techniques in the plan, struck or not. */
  total: number;
  struck: number;
  /** What the user is actually working with: total − struck. */
  active: number;
  mastered: number;
  inProgress: number;
  /** mastered / active, as a whole percentage. 0 when nothing is active. */
  percent: number;
}

/**
 * The one progress rule of the product: striking a technique removes it from
 * the denominator entirely. Skipping is curation, not failure — a plan with
 * 6 techniques, 1 struck and 5 mastered, is 100% complete.
 */
export function computeProgress(
  plan: Plan,
  states: Record<string, TechniqueUserState | undefined>,
): ProgressSummary {
  let struck = 0;
  let mastered = 0;
  let inProgress = 0;

  for (const technique of plan.techniques) {
    const status = states[technique.id]?.status ?? "todo";
    if (status === "struck") struck += 1;
    else if (status === "mastered") mastered += 1;
    else if (status === "in_progress") inProgress += 1;
  }

  const total = plan.techniques.length;
  const active = total - struck;
  const percent = active === 0 ? 0 : Math.round((mastered / active) * 100);

  return { total, struck, active, mastered, inProgress, percent };
}

/** A plan is complete when every active technique is mastered (and at least one is). */
export function isPlanComplete(progress: ProgressSummary): boolean {
  return progress.active > 0 && progress.mastered === progress.active;
}
