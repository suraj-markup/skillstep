import { Hono } from "hono";
import { cors } from "hono/cors";
import { registerPlanController } from "./controllers";
import { type AiProvider, MockAiProvider } from "./providers/ai";
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
}

export function createApp(dependencies: AppDependencies = {}) {
  const aiProvider = dependencies.aiProvider ?? new MockAiProvider();
  const planRepository = dependencies.planRepository ?? new NoopPlanRepository();
  const planService = new PlanService({ aiProvider, planRepository });
  const app = new Hono().basePath("/api");

  app.use(
    "*",
    cors({
      allowHeaders: ["content-type"],
      allowMethods: ["GET", "POST", "OPTIONS"],
      origin: ["http://localhost:8081", "http://127.0.0.1:8081"],
    }),
  );

  app.get("/health", (c) => c.json({ ok: true, service: "skillstep-api" }));
  registerPlanController(app, planService);

  return app;
}

export const app = createApp();
