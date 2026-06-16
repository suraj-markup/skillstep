import type { ApiClientConfig } from "./ApiClientConfig";
import { ApiError } from "./ApiError";
import type { ApiRequestOptions } from "./ApiRequestOptions";

export interface HttpRequest {
  request(options: ApiRequestOptions): Promise<unknown>;
}

export class FetchHttpRequest implements HttpRequest {
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(private readonly config: ApiClientConfig) {
    this.baseUrl = normalizeBaseUrl(config.baseUrl);
    this.fetchImpl = config.fetchImpl ?? globalThis.fetch.bind(globalThis);
  }

  async request(options: ApiRequestOptions): Promise<unknown> {
    const response = await this.fetchImpl(`${this.baseUrl}${options.url}`, {
      method: options.method,
      headers: await this.getHeaders(options),
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
    const body = await readJson(response);

    if (!response.ok) {
      throw new ApiError(readErrorMessage(body), options, response.status, body);
    }

    return body;
  }

  private async getHeaders(_options: ApiRequestOptions): Promise<Record<string, string>> {
    const headers =
      typeof this.config.headers === "function" ? await this.config.headers() : this.config.headers;

    return {
      "content-type": "application/json",
      ...headers,
    };
  }
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

function readErrorMessage(body: unknown): string {
  const detail = readProperty(body, "message");
  const title = readProperty(body, "error");
  const upstreamStatus = readProperty(body, "upstreamStatus");

  if (upstreamStatus === 429 || upstreamStatus === 503) {
    return "AI is busy right now. Please try again in a minute.";
  }

  if (upstreamStatus === 504) {
    return "AI took too long to respond. Please try again.";
  }

  if (typeof detail === "string") {
    return typeof title === "string" ? `${title}: ${detail}` : detail;
  }

  return typeof title === "string" ? title : "API request failed";
}

function readProperty(body: unknown, key: string): unknown {
  return typeof body === "object" && body !== null ? body[key as keyof typeof body] : undefined;
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, "");
}
