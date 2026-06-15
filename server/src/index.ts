import { serve } from "@hono/node-server";
import { createApp } from "./app";
import { getEnv, loadEnvFiles } from "./config";
import { GeminiProvider, MockAiProvider } from "./providers/ai";
import { NoopVideoProvider, YouTubeProvider } from "./providers/video";

loadEnvFiles();
const env = getEnv();
const aiProvider = env.geminiApiKey
  ? new GeminiProvider({ apiKey: env.geminiApiKey, model: env.geminiModel })
  : new MockAiProvider();
const videoProvider = env.youtubeApiKey
  ? new YouTubeProvider({ apiKey: env.youtubeApiKey })
  : new NoopVideoProvider();
const app = createApp({ aiProvider, videoProvider });

serve({ fetch: app.fetch, port: env.port }, (info) => {
  console.log(`skillstep-api listening on http://localhost:${info.port}`);
});
