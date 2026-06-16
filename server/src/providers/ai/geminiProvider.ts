import {
  ACCENTS,
  type DailySession,
  type GeneratedJourney,
  GeneratedJourneySchema,
  type GenerateJourneyInput,
  HOBBY_ICONS,
} from "@skillstep/shared";
import { type AiProvider, AiProviderError } from "./provider";

const GEMINI_REQUEST_TIMEOUT_MS = 45_000;
const GEMINI_RETRY_DELAYS_MS = [900, 1800];
const STARTER_SESSION_COUNT = 3;

export interface GeminiProviderOptions {
  apiKey: string;
  model?: string;
  youtubeApiKey?: string;
}

export class GeminiProvider implements AiProvider {
  private readonly model: string;

  constructor(private readonly options: GeminiProviderOptions) {
    this.model = options.model ?? "gemini-2.5-flash";
  }

  async generateJourney(input: GenerateJourneyInput): Promise<GeneratedJourney> {
    const response = await requestGeminiWithRetry({
      apiKey: this.options.apiKey,
      input,
      model: this.model,
    });

    if (!response.ok) {
      throw await readGeminiError(response);
    }

    const payload = (await response.json()) as GeminiGenerateContentResponse;
    const text = extractText(payload);
    const parsed = GeneratedJourneySchema.safeParse(safeJsonParse(text));

    if (!parsed.success) {
      throw new AiProviderError(
        "AI generated a journey in an invalid format. Please try again.",
        502,
        "INVALID_OUTPUT",
      );
    }

    return enrichVideoResources(parsed.data, input, this.options.youtubeApiKey);
  }
}

async function requestGeminiWithRetry({
  apiKey,
  input,
  model,
}: {
  apiKey: string;
  input: GenerateJourneyInput;
  model: string;
}): Promise<Response> {
  const attemptCount = GEMINI_RETRY_DELAYS_MS.length + 1;

  for (let attemptIndex = 0; attemptIndex < attemptCount; attemptIndex += 1) {
    const response = await requestGemini({ apiKey, input, model });

    if (!isTransientGeminiStatus(response.status) || attemptIndex === attemptCount - 1) {
      return response;
    }

    await sleep(GEMINI_RETRY_DELAYS_MS[attemptIndex] ?? 0);
  }

  throw new AiProviderError("Gemini request failed after retries", 503, "UNAVAILABLE");
}

async function requestGemini({
  apiKey,
  input,
  model,
}: {
  apiKey: string;
  input: GenerateJourneyInput;
  model: string;
}): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GEMINI_REQUEST_TIMEOUT_MS);

  try {
    return await fetch(buildGenerateContentUrl(model), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-goog-api-key": apiKey,
      },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildJourneyPrompt(input) }] }],
        generationConfig: {
          maxOutputTokens: 6000,
          responseJsonSchema: buildStarterJourneyJsonSchema(),
          responseMimeType: "application/json",
        },
      }),
    });
  } catch (error) {
    if (isAbortError(error)) {
      throw new AiProviderError(
        "AI generation timed out. Please try again.",
        504,
        "DEADLINE_EXCEEDED",
      );
    }

    throw error;
  } finally {
    clearTimeout(timeout);
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

function isTransientGeminiStatus(status: number): boolean {
  return status === 429 || status === 503 || status === 504 || status >= 500;
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildGenerateContentUrl(model: string): string {
  const modelPath = model.startsWith("models/") ? model : `models/${model}`;
  return `https://generativelanguage.googleapis.com/v1beta/${modelPath}:generateContent`;
}

function buildJourneyPrompt(input: GenerateJourneyInput): string {
  const now = new Date().toISOString();
  const sessionCount = STARTER_SESSION_COUNT;
  const firstMilestoneSession = 1;
  const secondMilestoneSession = 2;

  return `
Create a daily hobby journey, not a one-time plan.

Product goal:
- The user should return because the app gives a useful next action, remembers weak areas,
  and turns practice into review cards.
- Do not create a mini course. Create a practice journey.

Rules:
- Return exactly one GeneratedJourney JSON object.
- Include these top-level keys exactly: hobbyProfile, journey, sessions, practiceCards,
  projects, nextJourneySuggestions.
- Use the user's hobby, current level, goal, schedule, and learning style.
- Create a compact starter journey with exactly ${sessionCount} daily sessions.
- Set journey.totalSessions to ${sessionCount} and journey.durationWeeks to 1.
- Session 1 status must be "available"; all later sessions must be "locked".
- Each session must include Learn, Resource, Practice, Check Yourself, and Reflect.
- Sessions must be small enough for ${input.minutesPerDay} minutes.
- Generate exactly 1 practice card per session.
- Use a mix of card types across the journey: concept, quiz, drill, mistake, challenge, review.
- Cards must help the user do the hobby, not memorize generic trivia.
- Use resource.type "video" when a visual demo would help the session.
- Include 1 final project and 3 next journey suggestions.
- Pick one icon key from: ${HOBBY_ICONS.join(", ")}.
- Pick one accent from: ${ACCENTS.join(", ")}.
- Use ISO-8601 timestamps. Use this createdAt when useful: ${now}.
- Do not include YouTube URLs. Resource URL is optional and should usually be omitted.
- Use stable ids that include the hobby slug and journey/session/card purpose.
- Keep every text field compact: 1-2 sentences only.
- Do not include markdown or explanatory text outside the JSON object.

Required object fields:
- hobbyProfile: id, name, icon, accent, currentLevel, goal, status,
  preferredMinutesPerDay, preferredDaysPerWeek, preferredLearningStyle, createdAt, updatedAt.
- journey: id, hobbyProfileId, title, levelFrom, levelTo, goal, status, durationWeeks,
  totalSessions, currentSessionIndex, milestones, finalProject, rationale, createdAt, completedAt.
- each session: id, journeyId, hobbyProfileId, dayNumber, title, estimatedMinutes,
  scheduledFor, status, learn, resource, practice, checkYourself, reflectionPrompt,
  createdAt, startedAt, completedAt.
- each practice card: id, hobbyProfileId, journeyId, sessionId, type, front, back, prompt,
  answer, difficulty, dueAt, lastReviewedAt, reviewCount, correctCount, status, createdAt.
- each project: id, hobbyProfileId, journeyId, title, description, successCriteria,
  status, createdAt, completedAt.
- Use null for nullable fields when empty: scheduledFor, startedAt, completedAt,
  prompt, answer, lastReviewedAt, finalProject if absent. Do not omit required keys.
- Use these status values: hobbyProfile.status "active", journey.status "active",
  project.status "not_started", card.status "new", card.difficulty "new".

Journey structure:
- Session 1: baseline/checkpoint so the user knows where they are starting.
- Session 2: foundations and one small repeatable drill.
- Session 3: applied challenge or first small project attempt.
- Milestones should target sessions ${firstMilestoneSession}, ${secondMilestoneSession}, and ${sessionCount}.

Session quality rules:
- "learn" should explain one idea in plain language, not a long article.
- "practice" must be a concrete timed activity.
- "checkYourself.items" must be observable criteria, not vague motivation.
- "reflectionPrompt" should ask what was hard or what should be revisited.
- "resource" should usually be type "video", "prompt", or "example".
- For video resources, write resource.title as a good YouTube search query.
- "resource.description" is required and must be user-facing guidance, never the raw resource type.

Practice card rules:
- concept cards explain one reusable idea.
- quiz cards ask a concrete decision question with a clear answer.
- drill cards are short repeatable practice prompts.
- mistake cards name a likely mistake and correction.
- challenge cards ask the user to apply today's skill.
- review cards should revisit something from a previous session.
- For cards from locked future sessions, dueAt should be after that session's intended day.
- For cards from session 1, dueAt can be ${now}.

Final project rules:
- The final project must produce an observable result.
- successCriteria must be checkable and specific to the hobby.

Next journey suggestion rules:
- Suggestions should be specific next paths, not generic "intermediate level".
- Examples: "Chord Fluency", "First Songs", "Manual Mode Foundations", "Opening Tactics".

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

async function enrichVideoResources(
  generatedJourney: GeneratedJourney,
  input: GenerateJourneyInput,
  youtubeApiKey: string | undefined,
): Promise<GeneratedJourney> {
  let resolvedVideoCount = 0;
  const sessions: DailySession[] = [];

  for (const session of generatedJourney.sessions) {
    if (!shouldEnrichVideo(session) || resolvedVideoCount >= 2) {
      sessions.push(session);
      continue;
    }

    const query = buildVideoQuery(input.hobby, session);
    const video = await resolveYouTubeVideo(query, youtubeApiKey);
    resolvedVideoCount += 1;
    sessions.push({
      ...session,
      resource: {
        type: "video",
        title: video.title,
        url: video.url,
        description: video.description,
      },
    });
  }

  return {
    ...generatedJourney,
    sessions,
  };
}

function shouldEnrichVideo(session: DailySession): boolean {
  const resource = session.resource;
  if (!resource) {
    return false;
  }

  return (
    resource.type === "video" ||
    /\b(demo|demonstration|watch|video|visual|form|stance|technique)\b/i.test(resource.title)
  );
}

function buildVideoQuery(hobby: string, session: DailySession): string {
  const title = session.resource?.title ?? session.title;
  return `${hobby} ${title} beginner demonstration`;
}

type ResolvedVideo = {
  description: string;
  title: string;
  url: string;
};

async function resolveYouTubeVideo(
  query: string,
  youtubeApiKey: string | undefined,
): Promise<ResolvedVideo> {
  if (!youtubeApiKey) {
    return {
      title: "YouTube search",
      url: buildYouTubeSearchUrl(query),
      description: "Open this search and pick a short beginner-friendly demo before practice.",
    };
  }

  const cachedVideo = youtubeVideoCache.get(query);
  if (cachedVideo && cachedVideo.expiresAt > Date.now()) {
    return cachedVideo.video;
  }

  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("key", youtubeApiKey);
  url.searchParams.set("part", "snippet");
  url.searchParams.set("q", query);
  url.searchParams.set("maxResults", "1");
  url.searchParams.set("safeSearch", "strict");
  url.searchParams.set("type", "video");
  url.searchParams.set("videoEmbeddable", "true");

  const response = await fetch(url);
  const payload = (await response.json()) as YouTubeSearchResponse;
  const item = response.ok ? payload.items?.[0] : undefined;
  const videoId = item?.id?.videoId;

  if (!videoId || !item?.snippet?.title) {
    return {
      title: "YouTube search",
      url: buildYouTubeSearchUrl(query),
      description: "Open this search and pick a short beginner-friendly demo before practice.",
    };
  }

  const video = {
    title: decodeHtmlEntities(item.snippet.title),
    url: `https://www.youtube.com/watch?v=${videoId}`,
    description:
      item.snippet.description?.trim() ||
      "Watch the first minute for the setup, then use the demo while practicing.",
  };

  youtubeVideoCache.set(query, {
    expiresAt: Date.now() + YOUTUBE_CACHE_TTL_MS,
    video,
  });

  return video;
}

function buildYouTubeSearchUrl(query: string): string {
  const url = new URL("https://www.youtube.com/results");
  url.searchParams.set("search_query", query);
  return url.toString();
}

function decodeHtmlEntities(value: string): string {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

const YOUTUBE_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const youtubeVideoCache = new Map<string, { expiresAt: number; video: ResolvedVideo }>();

type YouTubeSearchResponse = {
  items?: Array<{
    id?: {
      videoId?: string;
    };
    snippet?: {
      description?: string;
      title?: string;
    };
  }>;
};

function buildStarterJourneyJsonSchema() {
  return {
    type: "object",
    properties: {
      hobbyProfile: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          icon: { type: "string" },
          accent: { type: "string" },
          currentLevel: { type: "string" },
          goal: { type: "string" },
          status: { type: "string" },
          preferredMinutesPerDay: { type: "integer" },
          preferredDaysPerWeek: { type: "integer" },
          preferredLearningStyle: { type: "string" },
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
          status: { type: "string" },
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
    status: { type: "string" },
    learn: { type: "string" },
    resource: {
      type: "object",
      nullable: true,
      properties: {
        type: { type: "string" },
        title: { type: "string" },
        url: { type: "string" },
        description: { type: "string" },
        durationMinutes: { type: "integer" },
      },
      required: ["type", "title", "description"],
    },
    practice: { type: "string" },
    checkYourself: {
      type: "object",
      properties: {
        prompt: { type: "string" },
        items: {
          type: "array",
          items: { type: "string" },
        },
      },
      required: ["prompt", "items"],
    },
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
    type: { type: "string" },
    front: { type: "string" },
    back: { type: "string" },
    prompt: { type: "string", nullable: true },
    answer: { type: "string", nullable: true },
    difficulty: { type: "string" },
    dueAt: { type: "string" },
    lastReviewedAt: { type: "string", nullable: true },
    reviewCount: { type: "integer" },
    correctCount: { type: "integer" },
    status: { type: "string" },
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
    status: { type: "string" },
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
