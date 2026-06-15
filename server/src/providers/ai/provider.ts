import type { GeneratePlanInput, Plan } from "@skillstep/shared";

export class AiProviderError extends Error {
  constructor(
    message: string,
    readonly upstreamStatus?: number,
    readonly upstreamCode?: string,
  ) {
    super(message);
  }
}

export interface AiProvider {
  generatePlan(input: GeneratePlanInput): Promise<Plan>;
}
