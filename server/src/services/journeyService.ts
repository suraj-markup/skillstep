import { GeneratedJourneySchema, type GenerateJourneyInput } from "@skillstep/shared";
import type { AiProvider } from "../providers/ai";

export class InvalidJourneyOutputError extends Error {
  constructor(readonly issues: unknown) {
    super("AI provider returned an invalid journey");
  }
}

export interface JourneyServiceDependencies {
  aiProvider: AiProvider;
}

export class JourneyService {
  constructor(private readonly dependencies: JourneyServiceDependencies) {}

  async generateJourney(input: GenerateJourneyInput) {
    const generatedJourney = await this.dependencies.aiProvider.generateJourney(input);
    const journey = GeneratedJourneySchema.safeParse(generatedJourney);

    if (!journey.success) {
      throw new InvalidJourneyOutputError(journey.error.issues);
    }

    return journey.data;
  }
}
