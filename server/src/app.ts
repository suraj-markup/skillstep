import { Hono } from "hono";
import { cors } from "hono/cors";
import { registerPlanController } from "./controllers";
import { type AiProvider, MockAiProvider } from "./providers/ai";
import { NoopVideoProvider, type VideoProvider } from "./providers/video";
import { NoopPlanRepository, type PlanRepository } from "./repositories";
import { PlanService } from "./services";

/**
 * The Hono app, separated from the Node entry point (index.ts) so tests can
 * exercise real routing in memory via `app.request()` and so a serverless
 * adapter can mount the same app at deploy time (ADR 0003).
 */
export interface AppDependencies {
  aiProvider?: AiProvider;
  planRepository?: PlanRepository;
  videoProvider?: VideoProvider;
}

export function createApp(dependencies: AppDependencies = {}) {
  const aiProvider = dependencies.aiProvider ?? new MockAiProvider();
  const planRepository = dependencies.planRepository ?? new NoopPlanRepository();
  const videoProvider = dependencies.videoProvider ?? new NoopVideoProvider();
  const planService = new PlanService({ aiProvider, planRepository, videoProvider });
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
  registerPlanController(app, planService);

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
