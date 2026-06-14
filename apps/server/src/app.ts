import { Hono } from "hono";

/**
 * The Hono app, separated from the Node entry point (index.ts) so tests can
 * exercise real routing in memory via `app.request()` and so a serverless
 * adapter can mount the same app at deploy time (ADR 0003).
 */
export const app = new Hono().basePath("/api");

app.get("/health", (c) => c.json({ ok: true, service: "whittle-api" }));
