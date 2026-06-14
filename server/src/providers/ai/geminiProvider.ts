import {
  ACCENTS,
  type GeneratePlanInput,
  PLAN_ICONS,
  type Plan,
  PlanSchema,
} from "@skillstep/shared";
import type { AiProvider } from "./provider";

export interface GeminiProviderOptions {
  apiKey: string;
  model?: string;
}

export class GeminiProvider implements AiProvider {
  private readonly model: string;

  constructor(private readonly options: GeminiProviderOptions) {
    this.model = options.model ?? "gemini-2.5-flash";
  }

  async generatePlan(input: GeneratePlanInput): Promise<Plan> {
    const response = await fetch(buildGenerateContentUrl(this.model), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-goog-api-key": this.options.apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPlanPrompt(input) }] }],
        generationConfig: {
          responseFormat: {
            text: {
              mimeType: "application/json",
              schema: planJsonSchema,
            },
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Gemini plan generation failed with ${response.status}: ${await response.text()}`,
      );
    }

    const payload = (await response.json()) as GeminiGenerateContentResponse;
    const text = extractText(payload);
    const parsed = PlanSchema.safeParse(JSON.parse(text));

    if (!parsed.success) {
      throw new Error(`Gemini returned an invalid plan: ${parsed.error.message}`);
    }

    return parsed.data;
  }
}

function buildGenerateContentUrl(model: string): string {
  const modelPath = model.startsWith("models/") ? model : `models/${model}`;
  return `https://generativelanguage.googleapis.com/v1beta/${modelPath}:generateContent`;
}

function buildPlanPrompt(input: GeneratePlanInput): string {
  return `
Create a focused hobby improvement plan.

Rules:
- The hobby may be any learnable hobby, not just common examples.
- Generate exactly 5 to 8 techniques.
- Keep the plan practical and practice-first.
- Pick one icon key from: ${PLAN_ICONS.join(", ")}.
- Pick one accent from: ${ACCENTS.join(", ")}.
- Use the user's exact level descriptions in levelFrom and levelTo.
- Mastery criteria must be observable self-assessments of doing, not quiz questions.
- Do not include video URLs.
- createdAt must be an ISO-8601 timestamp.

Input:
- hobby: ${input.hobby}
- levelFrom: ${input.levelFrom}
- levelTo: ${input.levelTo}
- weeklyHours: ${input.weeklyHours}
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

interface GeminiGenerateContentResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

const emphasisEnum = ["primary", "supporting", "none"];

const planJsonSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    hobby: { type: "string" },
    levelFrom: { type: "string" },
    levelTo: { type: "string" },
    weeklyHours: { type: "number" },
    rationale: { type: "string" },
    icon: { type: "string", enum: PLAN_ICONS },
    accent: { type: "string", enum: ACCENTS },
    techniques: {
      type: "array",
      minItems: 5,
      maxItems: 8,
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          whyItMatters: { type: "string" },
          modalityProfile: {
            type: "object",
            properties: {
              video: { type: "string", enum: emphasisEnum },
              reading: { type: "string", enum: emphasisEnum },
              practice: { type: "string", enum: emphasisEnum },
            },
            required: ["video", "reading", "practice"],
          },
          drill: {
            type: "object",
            properties: {
              text: { type: "string" },
              minutesPerSession: { type: "integer" },
              sessionsPerWeek: { type: "integer" },
            },
            required: ["text", "minutesPerSession", "sessionsPerWeek"],
          },
          masteryCriteria: {
            type: "array",
            minItems: 2,
            maxItems: 4,
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                text: { type: "string" },
              },
              required: ["id", "text"],
            },
          },
        },
        required: ["id", "name", "whyItMatters", "modalityProfile", "drill", "masteryCriteria"],
      },
    },
    createdAt: { type: "string" },
  },
  required: [
    "id",
    "hobby",
    "levelFrom",
    "levelTo",
    "weeklyHours",
    "rationale",
    "icon",
    "accent",
    "techniques",
    "createdAt",
  ],
};
