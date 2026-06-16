import { type ApiClientConfig, DEFAULT_API_BASE_URL } from "./core/ApiClientConfig";
import { FetchHttpRequest, type HttpRequest } from "./core/FetchHttpRequest";
import { HealthService } from "./services/HealthService";
import { JourneysService } from "./services/JourneysService";

export class SkillstepApi {
  readonly health: HealthService;
  readonly journeys: JourneysService;
  readonly request: HttpRequest;

  constructor(config: Partial<ApiClientConfig> = {}, HttpRequestImpl = FetchHttpRequest) {
    this.request = new HttpRequestImpl({
      baseUrl: config.baseUrl ?? DEFAULT_API_BASE_URL,
      fetchImpl: config.fetchImpl,
      headers: config.headers,
    });

    this.health = new HealthService(this.request);
    this.journeys = new JourneysService(this.request);
  }
}

export const skillstepApi = new SkillstepApi();
