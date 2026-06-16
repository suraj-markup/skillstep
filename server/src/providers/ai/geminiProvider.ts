import {
  ACCENTS,
  type GeneratedJourney,
  GeneratedJourneySchema,
  type GenerateJourneyInput,
  HOBBY_ICONS,
} from "@skillstep/shared";
import { type AiProvider, AiProviderError } from "./provider";

export interface GeminiProviderOptions {
  apiKey: string;
  model?: string;
}

export class GeminiProvider implements AiProvider {
  private readonly model: string;

  constructor(private readonly options: GeminiProviderOptions) {
    this.model = options.model ?? "gemini-2.5-flash";
  }

  async generateJourney(input: GenerateJourneyInput): Promise<GeneratedJourney> {
    const response = await fetch(buildGenerateContentUrl(this.model), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-goog-api-key": this.options.apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildJourneyPrompt(input) }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseJsonSchema: buildGeneratedJourneyJsonSchema(),
        },
      }),
    });

    if (!response.ok) {
      throw await readGeminiError(response);
    }

    const payload = (await response.json()) as GeminiGenerateContentResponse;
    const text = extractText(payload);
    const parsed = GeneratedJourneySchema.safeParse(JSON.parse(text));

    if (!parsed.success) {
      throw new Error(`Gemini returned an invalid journey: ${parsed.error.message}`);
    }

    return parsed.data;
  }
}

async function readGeminiError(response: Response): Promise<AiProviderError> {
  const text = await response.text();
  const body = safeJsonParse(text);
  const error = readProperty(body, "error");
  const message = readString(error, "message") ?? `Gemini request failed with ${response.status}`;
  const code = readString(error, "status");

  return new AiProviderError(message, response.status, code);
}

function buildGenerateContentUrl(model: string): string {
  const modelPath = model.startsWith("models/") ? model : `models/${model}`;
  return `https://generativelanguage.googleapis.com/v1beta/${modelPath}:generateContent`;
}

function buildJourneyPrompt(input: GenerateJourneyInput): string {
  const now = new Date().toISOString();
  const sessionCount = Math.max(5, input.daysPerWeek * 2);

  return `
Create a daily hobby journey, not a one-time plan.

Rules:
- Return exactly one GeneratedJourney JSON object.
- Use the user's hobby, current level, goal, schedule, and learning style.
- Create exactly ${sessionCount} daily sessions.
- Session 1 status must be "available"; all later sessions must be "locked".
- Each session must include Learn, Resource, Practice, Check Yourself, and Reflect.
- Sessions must be small enough for ${input.minutesPerDay} minutes.
- Generate 1-2 practice cards per session.
- Cards must be useful practice/review cards, not generic trivia.
- Include 1 final project and 2-3 next journey suggestions.
- Pick one icon key from: ${HOBBY_ICONS.join(", ")}.
- Pick one accent from: ${ACCENTS.join(", ")}.
- Use ISO-8601 timestamps. Use this createdAt when useful: ${now}.
- Do not include YouTube URLs. Resource URL is optional and should usually be omitted.

Input:
- hobby: ${input.hobby}
- currentLevel: ${input.currentLevel}
- goal: ${input.goal}
- minutesPerDay: ${input.minutesPerDay}
- daysPerWeek: ${input.daysPerWeek}
- learningStyle: ${input.learningStyle}
- existingHobbyContext: ${input.existingHobbyContext ?? "none"}
`;
}

function extractText(response: GeminiGenerateContentResponse): string {
  const parts = response.candidates?.[0]?.content?.parts ?? [];
  const text = parts
    .map((part) => part.text ?? "")
    .join("")
    .trim();

  if (!text) {
    throw new Error("Gemini returned no text content");
  }

  return text;
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

function readString(body: unknown, key: string): string | undefined {
  const value = readProperty(body, key);
  return typeof value === "string" ? value : undefined;
}

function readProperty(body: unknown, key: string): unknown {
  return typeof body === "object" && body !== null ? body[key as keyof typeof body] : undefined;
}

interface GeminiGenerateContentResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

function buildGeneratedJourneyJsonSchema() {
  return {
    type: "object",
    properties: {
      hobbyProfile: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          icon: { type: "string", enum: HOBBY_ICONS },
          accent: { type: "string", enum: ACCENTS },
          currentLevel: { type: "string" },
          goal: { type: "string" },
          status: { type: "string", enum: ["active", "paused", "completed", "archived"] },
          preferredMinutesPerDay: { type: "integer" },
          preferredDaysPerWeek: { type: "integer" },
          preferredLearningStyle: {
            type: "string",
            enum: ["balanced", "video", "reading", "practice", "projects"],
          },
          createdAt: { type: "string" },
          updatedAt: { type: "string" },
        },
        required: [
          "id",
          "name",
          "icon",
          "accent",
          "currentLevel",
          "goal",
          "status",
          "preferredMinutesPerDay",
          "preferredDaysPerWeek",
          "preferredLearningStyle",
          "createdAt",
          "updatedAt",
        ],
      },
      journey: {
        type: "object",
        properties: {
          id: { type: "string" },
          hobbyProfileId: { type: "string" },
          title: { type: "string" },
          levelFrom: { type: "string" },
          levelTo: { type: "string" },
          goal: { type: "string" },
          status: {
            type: "string",
            enum: ["not_started", "active", "completed", "paused", "abandoned"],
          },
          durationWeeks: { type: "integer" },
          totalSessions: { type: "integer" },
          currentSessionIndex: { type: "integer" },
          milestones: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                title: { type: "string" },
                description: { type: "string" },
                targetSessionNumber: { type: "integer" },
              },
              required: ["id", "title", "description", "targetSessionNumber"],
            },
          },
          finalProject: finalProjectJsonSchema,
          rationale: { type: "string" },
          createdAt: { type: "string" },
          completedAt: { type: "string", nullable: true },
        },
        required: [
          "id",
          "hobbyProfileId",
          "title",
          "levelFrom",
          "levelTo",
          "goal",
          "status",
          "durationWeeks",
          "totalSessions",
          "currentSessionIndex",
          "milestones",
          "finalProject",
          "rationale",
          "createdAt",
          "completedAt",
        ],
      },
      sessions: {
        type: "array",
        items: dailySessionJsonSchema,
      },
      practiceCards: {
        type: "array",
        items: practiceCardJsonSchema,
      },
      projects: {
        type: "array",
        items: projectJsonSchema,
      },
      nextJourneySuggestions: {
        type: "array",
        items: { type: "string" },
      },
    },
    required: [
      "hobbyProfile",
      "journey",
      "sessions",
      "practiceCards",
      "projects",
      "nextJourneySuggestions",
    ],
  };
}

const sessionResourceJsonSchema = {
  type: "object",
  nullable: true,
  properties: {
    type: { type: "string", enum: ["video", "article", "example", "image", "prompt"] },
    title: { type: "string" },
    url: { type: "string" },
    description: { type: "string" },
    durationMinutes: { type: "integer" },
  },
  required: ["type", "title"],
};

const checkYourselfJsonSchema = {
  type: "object",
  properties: {
    prompt: { type: "string" },
    items: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: ["prompt", "items"],
};

const dailySessionJsonSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    journeyId: { type: "string" },
    hobbyProfileId: { type: "string" },
    dayNumber: { type: "integer" },
    title: { type: "string" },
    estimatedMinutes: { type: "integer" },
    scheduledFor: { type: "string", nullable: true },
    status: {
      type: "string",
      enum: ["locked", "available", "in_progress", "completed", "skipped", "missed"],
    },
    learn: { type: "string" },
    resource: sessionResourceJsonSchema,
    practice: { type: "string" },
    checkYourself: checkYourselfJsonSchema,
    reflectionPrompt: { type: "string" },
    createdAt: { type: "string" },
    startedAt: { type: "string", nullable: true },
    completedAt: { type: "string", nullable: true },
  },
  required: [
    "id",
    "journeyId",
    "hobbyProfileId",
    "dayNumber",
    "title",
    "estimatedMinutes",
    "scheduledFor",
    "status",
    "learn",
    "resource",
    "practice",
    "checkYourself",
    "reflectionPrompt",
    "createdAt",
    "startedAt",
    "completedAt",
  ],
};

const practiceCardJsonSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    hobbyProfileId: { type: "string" },
    journeyId: { type: "string" },
    sessionId: { type: "string" },
    type: {
      type: "string",
      enum: ["concept", "quiz", "drill", "mistake", "challenge", "review"],
    },
    front: { type: "string" },
    back: { type: "string" },
    prompt: { type: "string", nullable: true },
    answer: { type: "string", nullable: true },
    difficulty: { type: "string", enum: ["new", "easy", "okay", "hard"] },
    dueAt: { type: "string" },
    lastReviewedAt: { type: "string", nullable: true },
    reviewCount: { type: "integer" },
    correctCount: { type: "integer" },
    status: {
      type: "string",
      enum: ["new", "due", "learning", "reviewing", "mastered", "archived"],
    },
    createdAt: { type: "string" },
  },
  required: [
    "id",
    "hobbyProfileId",
    "journeyId",
    "sessionId",
    "type",
    "front",
    "back",
    "prompt",
    "answer",
    "difficulty",
    "dueAt",
    "lastReviewedAt",
    "reviewCount",
    "correctCount",
    "status",
    "createdAt",
  ],
};

const finalProjectJsonSchema = {
  type: "object",
  nullable: true,
  properties: {
    id: { type: "string" },
    title: { type: "string" },
    description: { type: "string" },
    successCriteria: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: ["id", "title", "description", "successCriteria"],
};

const projectJsonSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    hobbyProfileId: { type: "string" },
    journeyId: { type: "string" },
    title: { type: "string" },
    description: { type: "string" },
    successCriteria: {
      type: "array",
      items: { type: "string" },
    },
    status: { type: "string", enum: ["not_started", "in_progress", "completed", "skipped"] },
    createdAt: { type: "string" },
    completedAt: { type: "string", nullable: true },
  },
  required: [
    "id",
    "hobbyProfileId",
    "journeyId",
    "title",
    "description",
    "successCriteria",
    "status",
    "createdAt",
    "completedAt",
  ],
};
