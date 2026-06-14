import { describe, expect, it } from "vitest";
import { app } from "./app";

describe("GET /api/health", () => {
  it("responds ok without binding a port", async () => {
    const res = await app.request("/api/health");
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true, service: "skillstep-api" });
  });
});
