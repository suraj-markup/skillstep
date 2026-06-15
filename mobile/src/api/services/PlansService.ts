import {
  type GeneratePlanInput,
  GeneratePlanInputSchema,
  type Plan,
  PlanSchema,
  type ResolveTechniqueContentInput,
  ResolveTechniqueContentInputSchema,
  type TechniqueContent,
  TechniqueContentSchema,
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

  async resolveTechniqueContent(input: ResolveTechniqueContentInput): Promise<TechniqueContent> {
    const validInput = ResolveTechniqueContentInputSchema.parse(input);
    const body = await this.request.request({
      method: "POST",
      url: "/technique-content",
      body: validInput,
    });
    const content = TechniqueContentSchema.safeParse(readProperty(body, "content"));

    if (!content.success) {
      throw new ApiError(
        "API returned invalid technique content",
        { method: "POST", url: "/technique-content", body: validInput },
        undefined,
        content.error.issues,
      );
    }

    return content.data;
  }
}

function readProperty(body: unknown, key: string): unknown {
  return typeof body === "object" && body !== null ? body[key as keyof typeof body] : undefined;
}
