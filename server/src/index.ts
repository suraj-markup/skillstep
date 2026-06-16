import { createApp } from "./app";
import { getEnv, loadEnvFiles } from "./config";
import { GeminiProvider, MockAiProvider } from "./providers/ai";

loadEnvFiles();
const env = getEnv();
const aiProvider = env.geminiApiKey
  ? new GeminiProvider({
      apiKey: env.geminiApiKey,
      model: env.geminiModel,
      youtubeApiKey: env.youtubeApiKey,
    })
  : new MockAiProvider();
const app = createApp({ aiProvider });

export default app;
