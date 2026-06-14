import type { ApiRequestOptions } from "./ApiRequestOptions";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly request: ApiRequestOptions,
    readonly status?: number,
    readonly body?: unknown,
  ) {
    super(message);
  }
}
