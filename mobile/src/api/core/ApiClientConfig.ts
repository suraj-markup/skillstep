export const DEFAULT_API_BASE_URL = "http://localhost:8787/api";

export type ApiHeaders =
  | Record<string, string>
  | (() => Record<string, string> | Promise<Record<string, string>>);

export interface ApiClientConfig {
  baseUrl: string;
  fetchImpl?: typeof fetch;
  headers?: ApiHeaders;
}
