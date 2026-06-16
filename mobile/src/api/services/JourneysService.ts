import {
  type GeneratedJourney,
  GeneratedJourneySchema,
  type GenerateJourneyInput,
  GenerateJourneyInputSchema,
} from "@skillstep/shared";
import { ApiError } from "../core/ApiError";
import type { HttpRequest } from "../core/FetchHttpRequest";

export class JourneysService {
  constructor(private readonly request: HttpRequest) {}

  async createJourney(input: GenerateJourneyInput): Promise<GeneratedJourney> {
    const validInput = GenerateJourneyInputSchema.parse(input);
    const body = await this.request.request({
      method: "POST",
      url: "/journeys",
      body: validInput,
    });
    const generatedJourney = GeneratedJourneySchema.safeParse(
      readProperty(body, "generatedJourney"),
    );

    if (!generatedJourney.success) {
      throw new ApiError(
        "API returned an invalid journey",
        { method: "POST", url: "/journeys", body: validInput },
        undefined,
        generatedJourney.error.issues,
      );
    }

    return generatedJourney.data;
  }
}

function readProperty(body: unknown, key: string): unknown {
  return typeof body === "object" && body !== null ? body[key as keyof typeof body] : undefined;
}
