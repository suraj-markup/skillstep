import { makeGeneratedJourney } from "@skillstep/shared";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GeminiProvider } from "./geminiProvider";

const input = {
  hobby: "Photography",
  currentLevel: "I use auto mode",
  goal: "Take sharper portraits",
  minutesPerDay: 20,
  daysPerWeek: 4,
  learningStyle: "balanced" as const,
};

describe("GeminiProvider", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("accepts harmless Gemini shape drift before validating the journey", async () => {
    const generatedJourney = makeGeneratedJourney();
    const rawJourney = structuredClone(generatedJourney) as unknown as {
      hobbyProfile: Record<string, unknown>;
      journey: Record<string, unknown>;
      practiceCards: Array<Record<string, unknown>>;
      projects: Array<Record<string, unknown>>;
      sessions: Array<Record<string, unknown>>;
    };
    const firstSession = rawJourney.sessions[0] ?? {};
    const firstResource = firstSession.resource as Record<string, unknown>;
    const firstCard = rawJourney.practiceCards[0] ?? {};
    const firstProject = rawJourney.projects[0] ?? {};

    rawJourney.hobbyProfile.icon = "photography";
    rawJourney.hobbyProfile.accent = "blue";
    rawJourney.hobbyProfile.preferredMinutesPerDay = "20";
    rawJourney.journey.hobbyProfileId = "wrong-hobby";
    rawJourney.journey.completedAt = "";
    firstSession.hobbyProfileId = "wrong-hobby";
    firstSession.journeyId = "wrong-journey";
    firstSession.scheduledFor = "";
    firstSession.startedAt = "";
    firstSession.completedAt = "";
    firstResource.url = "";
    firstResource.durationMinutes = "0";
    firstCard.hobbyProfileId = "wrong-hobby";
    firstCard.journeyId = "wrong-journey";
    firstCard.sessionId = "wrong-session";
    firstCard.type = "flashcard";
    firstCard.prompt = "";
    firstCard.answer = "";
    firstCard.lastReviewedAt = "";
    firstCard.reviewCount = "0";
    firstProject.hobbyProfileId = "wrong-hobby";
    firstProject.journeyId = "wrong-journey";
    firstProject.completedAt = "";

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        return new Response(
          JSON.stringify({
            candidates: [{ content: { parts: [{ text: JSON.stringify(rawJourney) }] } }],
          }),
          { status: 200 },
        );
      }),
    );

    const provider = new GeminiProvider({ apiKey: "test-key" });
    const result = await provider.generateJourney(input);

    expect(result.hobbyProfile.icon).toBe("camera");
    expect(result.hobbyProfile.accent).toBe("amber");
    expect(result.hobbyProfile.preferredMinutesPerDay).toBe(20);
    expect(result.journey.hobbyProfileId).toBe(result.hobbyProfile.id);
    expect(result.journey.completedAt).toBeNull();
    expect(result.sessions[0]?.hobbyProfileId).toBe(result.hobbyProfile.id);
    expect(result.sessions[0]?.journeyId).toBe(result.journey.id);
    expect(result.sessions[0]?.scheduledFor).toBeNull();
    expect(result.sessions[0]?.resource?.url).toBeUndefined();
    expect(result.sessions[0]?.resource?.durationMinutes).toBeUndefined();
    expect(result.practiceCards[0]?.sessionId).toBe(result.sessions[0]?.id);
    expect(result.practiceCards[0]?.type).toBe("concept");
    expect(result.practiceCards[0]?.prompt).toBeNull();
    expect(result.practiceCards[0]?.reviewCount).toBe(0);
    expect(result.projects[0]?.journeyId).toBe(result.journey.id);
  });

  it("parses generated JSON when the model wraps it in a code fence", async () => {
    const generatedJourney = makeGeneratedJourney();

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        return new Response(
          JSON.stringify({
            candidates: [
              {
                content: {
                  parts: [{ text: `\`\`\`json\n${JSON.stringify(generatedJourney)}\n\`\`\`` }],
                },
              },
            ],
          }),
          { status: 200 },
        );
      }),
    );

    const provider = new GeminiProvider({ apiKey: "test-key" });
    await expect(provider.generateJourney(input)).resolves.toMatchObject({
      journey: { id: generatedJourney.journey.id },
    });
  });
});
