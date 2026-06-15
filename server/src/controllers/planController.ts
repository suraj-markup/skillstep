import { GeneratePlanInputSchema, ResolveTechniqueContentInputSchema } from "@skillstep/shared";
import type { Hono } from "hono";
import { AiProviderError } from "../providers/ai";
import { YouTubeProviderError } from "../providers/video";
import { InvalidPlanOutputError, type PlanService } from "../services";

export function registerPlanController(app: Hono, planService: PlanService) {
  app.post("/plans", async (c) => {
    const body = await readJson(c.req.raw);
    const input = GeneratePlanInputSchema.safeParse(body);

    if (!input.success) {
      return c.json({ error: "Invalid plan request", issues: input.error.issues }, 400);
    }

    try {
      const plan = await planService.generatePlan(input.data);
      return c.json({ plan });
    } catch (error) {
      if (error instanceof InvalidPlanOutputError) {
        return c.json({ error: "AI provider returned an invalid plan", issues: error.issues }, 502);
      }

      if (error instanceof AiProviderError) {
        return c.json(
          {
            error: "AI provider request failed",
            message: error.message,
            upstreamCode: error.upstreamCode,
            upstreamStatus: error.upstreamStatus,
          },
          502,
        );
      }

      throw error;
    }
  });

  app.post("/technique-content", async (c) => {
    const body = await readJson(c.req.raw);
    const input = ResolveTechniqueContentInputSchema.safeParse(body);

    if (!input.success) {
      return c.json(
        { error: "Invalid technique content request", issues: input.error.issues },
        400,
      );
    }

    try {
      const content = await planService.resolveTechniqueContent(input.data);
      return c.json({ content });
    } catch (error) {
      if (error instanceof YouTubeProviderError) {
        return c.json(
          {
            error: "Video provider request failed",
            upstreamStatus: error.status,
          },
          502,
        );
      }

      throw error;
    }
  });
}

async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}
