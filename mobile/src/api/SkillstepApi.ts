import { type ApiClientConfig, DEFAULT_API_BASE_URL } from "./core/ApiClientConfig";
import { FetchHttpRequest, type HttpRequest } from "./core/FetchHttpRequest";
import { HealthService } from "./services/HealthService";
import { PlansService } from "./services/PlansService";

export class SkillstepApi {
  readonly health: HealthService;
  readonly plans: PlansService;
  readonly request: HttpRequest;

  constructor(config: Partial<ApiClientConfig> = {}, HttpRequestImpl = FetchHttpRequest) {
    this.request = new HttpRequestImpl({
      baseUrl: config.baseUrl ?? DEFAULT_API_BASE_URL,
      fetchImpl: config.fetchImpl,
      headers: config.headers,
    });

    this.health = new HealthService(this.request);
    this.plans = new PlansService(this.request);
  }
}

export const skillstepApi = new SkillstepApi();
