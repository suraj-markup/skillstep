import type { HttpRequest } from "../core/FetchHttpRequest";

export interface HealthResponse {
  ok: boolean;
  service: string;
}

export class HealthService {
  constructor(private readonly request: HttpRequest) {}

  async getHealth(): Promise<HealthResponse> {
    return (await this.request.request({ method: "GET", url: "/health" })) as HealthResponse;
  }
}
