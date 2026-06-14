import type { GeneratePlanInput, Plan } from "@skillstep/shared";

export interface AiProvider {
  generatePlan(input: GeneratePlanInput): Promise<Plan>;
}
