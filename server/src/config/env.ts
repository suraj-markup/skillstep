export interface ServerEnv {
  geminiApiKey?: string;
  geminiModel: string;
  nodeEnv: "development" | "test" | "production";
  port: number;
  youtubeApiKey?: string;
}

let cachedEnv: ServerEnv | undefined;

export function getEnv(): ServerEnv {
  cachedEnv ??= readEnv();
  return cachedEnv;
}

export function loadEnvFiles(paths = ["../.env", ".env"]): void {
  for (const envPath of paths) {
    try {
      process.loadEnvFile(envPath);
      return;
    } catch {
      // Optional .env files are allowed in local and deployed environments.
    }
  }
}

function readEnv(): ServerEnv {
  const port = readPort(process.env.PORT);

  return {
    geminiApiKey: readOptional(process.env.GEMINI_API_KEY),
    geminiModel: readOptional(process.env.GEMINI_MODEL) ?? "gemini-2.5-flash",
    nodeEnv: readNodeEnv(process.env.NODE_ENV),
    port,
    youtubeApiKey: readOptional(process.env.YOUTUBE_API_KEY),
  };
}

function readOptional(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function readPort(value: string | undefined): number {
  if (!value) {
    return 8787;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 65_535) {
    throw new Error("PORT must be an integer between 1 and 65535");
  }

  return parsed;
}

function readNodeEnv(value: string | undefined): ServerEnv["nodeEnv"] {
  if (value === "production" || value === "test") {
    return value;
  }

  return "development";
}
