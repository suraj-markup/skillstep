import { GenerateJourneyInputSchema } from "@skillstep/shared";
import type { Hono } from "hono";
import { AiProviderError } from "../providers/ai";
import { InvalidJourneyOutputError, type JourneyService } from "../services";

export function registerJourneyController(app: Hono, journeyService: JourneyService) {
  app.post("/journeys", async (c) => {
    const body = await readJson(c.req.raw);
    const input = GenerateJourneyInputSchema.safeParse(body);

    if (!input.success) {
      return c.json({ error: "Invalid journey request", issues: input.error.issues }, 400);
    }

    try {
      const generatedJourney = await journeyService.generateJourney(input.data);
      return c.json({ generatedJourney });
    } catch (error) {
      if (error instanceof InvalidJourneyOutputError) {
        return c.json(
          { error: "AI provider returned an invalid journey", issues: error.issues },
          502,
        );
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
}

async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}
