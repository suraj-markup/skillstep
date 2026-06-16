import { Hono } from "hono";
import { cors } from "hono/cors";
import { registerJourneyController } from "./controllers";
import { type AiProvider, MockAiProvider } from "./providers/ai";
import { JourneyService } from "./services";

/**
 * The Hono app, separated from the Node entry point (index.ts) so tests can
 * exercise real routing in memory via `app.request()` and so a serverless
 * adapter can mount the same app at deploy time (ADR 0003).
 */
export interface AppDependencies {
  aiProvider?: AiProvider;
}

export function createApp(dependencies: AppDependencies = {}) {
  const aiProvider = dependencies.aiProvider ?? new MockAiProvider();
  const journeyService = new JourneyService({ aiProvider });
  const app = new Hono().basePath("/api");

  app.use(
    "*",
    cors({
      allowHeaders: ["content-type"],
      allowMethods: ["GET", "POST", "OPTIONS"],
      origin: (origin) => (isAllowedDevOrigin(origin) ? origin : null),
    }),
  );

  app.get("/health", (c) => c.json({ ok: true, service: "skillstep-api" }));
  registerJourneyController(app, journeyService);

  return app;
}

export const app = createApp();

function isAllowedDevOrigin(origin: string) {
  try {
    const url = new URL(origin);
    const isHttp = url.protocol === "http:";
    const isLocalhost = url.hostname === "localhost" || url.hostname === "127.0.0.1";
    const isPrivateLanHost =
      url.hostname.startsWith("192.168.") ||
      url.hostname.startsWith("10.") ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(url.hostname);

    return isHttp && (isLocalhost || isPrivateLanHost);
  } catch {
    return false;
  }
}
