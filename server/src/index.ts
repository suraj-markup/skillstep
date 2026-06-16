import { serve } from "@hono/node-server";
import { createApp } from "./app";
import { getEnv, loadEnvFiles } from "./config";
import { GeminiProvider, MockAiProvider } from "./providers/ai";

loadEnvFiles();
const env = getEnv();
const aiProvider = env.geminiApiKey
  ? new GeminiProvider({ apiKey: env.geminiApiKey, model: env.geminiModel })
  : new MockAiProvider();
const app = createApp({ aiProvider });

serve({ fetch: app.fetch, port: env.port }, (info) => {
  console.log(`skillstep-api listening on http://localhost:${info.port}`);
});
