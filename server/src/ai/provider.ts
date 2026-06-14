import type { GeneratePlanInput, Plan } from "@whittle/shared";

export interface AiProvider {
  generatePlan(input: GeneratePlanInput): Promise<Plan>;
}
