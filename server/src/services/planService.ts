import { type GeneratePlanInput, PlanSchema } from "@skillstep/shared";
import type { AiProvider } from "../providers/ai";
import type { PlanRepository } from "../repositories";

export class InvalidPlanOutputError extends Error {
  constructor(readonly issues: unknown) {
    super("AI provider returned an invalid plan");
  }
}

export interface PlanServiceDependencies {
  aiProvider: AiProvider;
  planRepository: PlanRepository;
}

export class PlanService {
  constructor(private readonly dependencies: PlanServiceDependencies) {}

  async generatePlan(input: GeneratePlanInput) {
    const generatedPlan = await this.dependencies.aiProvider.generatePlan(input);
    const plan = PlanSchema.safeParse(generatedPlan);

    if (!plan.success) {
      throw new InvalidPlanOutputError(plan.error.issues);
    }

    await this.dependencies.planRepository.recordGeneratedPlan(plan.data);

    return plan.data;
  }
}
