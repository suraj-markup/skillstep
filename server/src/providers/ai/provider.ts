import type { GeneratedJourney, GenerateJourneyInput } from "@skillstep/shared";

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
  generateJourney(input: GenerateJourneyInput): Promise<GeneratedJourney>;
}
