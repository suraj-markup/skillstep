import {
  type GeneratePlanInput,
  GeneratePlanInputSchema,
  type Plan,
  PlanSchema,
} from "@skillstep/shared";
import { ApiError } from "../core/ApiError";
import type { HttpRequest } from "../core/FetchHttpRequest";

export class PlansService {
  constructor(private readonly request: HttpRequest) {}

  async createPlan(input: GeneratePlanInput): Promise<Plan> {
    const validInput = GeneratePlanInputSchema.parse(input);
    const body = await this.request.request({
      method: "POST",
      url: "/plans",
      body: validInput,
    });
    const plan = PlanSchema.safeParse(readProperty(body, "plan"));

    if (!plan.success) {
      throw new ApiError(
        "API returned an invalid plan",
        { method: "POST", url: "/plans", body: validInput },
        undefined,
        plan.error.issues,
      );
    }

    return plan.data;
  }
}

function readProperty(body: unknown, key: string): unknown {
  return typeof body === "object" && body !== null ? body[key as keyof typeof body] : undefined;
}
