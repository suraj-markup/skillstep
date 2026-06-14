export interface ApiRequestOptions {
  body?: unknown;
  method: "GET" | "POST" | "PATCH" | "DELETE";
  url: string;
}
