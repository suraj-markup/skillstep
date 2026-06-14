import { serve } from "@hono/node-server";
import { app } from "./app";

// Root .env first (repo convention), local .env as fallback. Node's built-in
// loader — no dotenv dependency (requires Node >= 21).
for (const envPath of ["../../.env", ".env"]) {
  try {
    process.loadEnvFile(envPath);
    break;
  } catch {
    // no .env yet — fine in early milestones; AI keys arrive at M3
  }
}

const port = Number(process.env.PORT ?? 8787);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`whittle-api listening on http://localhost:${info.port}`);
});
