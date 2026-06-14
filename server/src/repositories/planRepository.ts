import type { Plan } from "@skillstep/shared";

export interface PlanRepository {
  recordGeneratedPlan(plan: Plan): Promise<void>;
}

/**
 * The server is intentionally stateless right now; this repository exists so
 * persistence or analytics can be added later without changing controllers.
 */
export class NoopPlanRepository implements PlanRepository {
  async recordGeneratedPlan(_plan: Plan): Promise<void> {
    // No server-side plan storage in the local-first version.
  }
}
