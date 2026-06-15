import { type ResolveTechniqueContentInput, VideoResourceSchema } from "@skillstep/shared";
import type { VideoProvider } from "./provider";

const YOUTUBE_API_BASE_URL = "https://www.googleapis.com/youtube/v3";

interface YouTubeProviderOptions {
  apiKey: string;
  fetchImpl?: typeof fetch;
}

type YouTubeSearchResponse = {
  items?: Array<{
    id?: {
      videoId?: string;
    };
  }>;
};

type YouTubeVideosResponse = {
  items?: Array<{
    contentDetails?: {
      duration?: string;
    };
    id?: string;
    snippet?: {
      channelTitle?: string;
      title?: string;
    };
  }>;
};

export class YouTubeProvider implements VideoProvider {
  private readonly fetchImpl: typeof fetch;

  constructor(private readonly options: YouTubeProviderOptions) {
    this.fetchImpl = options.fetchImpl ?? globalThis.fetch.bind(globalThis);
  }

  async findVideos(input: ResolveTechniqueContentInput) {
    const videoIds = await this.searchVideoIds(input);

    if (videoIds.length === 0) {
      return [];
    }

    const detailsUrl = new URL(`${YOUTUBE_API_BASE_URL}/videos`);
    detailsUrl.searchParams.set("part", "snippet,contentDetails");
    detailsUrl.searchParams.set("id", videoIds.join(","));
    detailsUrl.searchParams.set("key", this.options.apiKey);

    const details = await this.fetchJson<YouTubeVideosResponse>(detailsUrl);

    return (details.items ?? [])
      .map((item) =>
        VideoResourceSchema.safeParse({
          channelTitle: item.snippet?.channelTitle,
          durationSec: parseIsoDurationToSeconds(item.contentDetails?.duration ?? "PT0S"),
          title: item.snippet?.title,
          videoId: item.id,
        }),
      )
      .filter((result) => result.success)
      .map((result) => result.data);
  }

  private async searchVideoIds(input: ResolveTechniqueContentInput): Promise<string[]> {
    const searchUrl = new URL(`${YOUTUBE_API_BASE_URL}/search`);
    searchUrl.searchParams.set("part", "snippet");
    searchUrl.searchParams.set("maxResults", "3");
    searchUrl.searchParams.set("q", buildSearchQuery(input));
    searchUrl.searchParams.set("safeSearch", "moderate");
    searchUrl.searchParams.set("type", "video");
    searchUrl.searchParams.set("videoEmbeddable", "true");
    searchUrl.searchParams.set("key", this.options.apiKey);

    const search = await this.fetchJson<YouTubeSearchResponse>(searchUrl);

    return (search.items ?? [])
      .map((item) => item.id?.videoId)
      .filter((videoId): videoId is string => Boolean(videoId));
  }

  private async fetchJson<T>(url: URL): Promise<T> {
    const response = await this.fetchImpl(url);

    if (!response.ok) {
      const message = await response.text();
      throw new YouTubeProviderError(response.status, message);
    }

    return (await response.json()) as T;
  }
}

export class YouTubeProviderError extends Error {
  constructor(
    readonly status: number,
    readonly body: string,
  ) {
    super("YouTube API request failed");
  }
}

function buildSearchQuery(input: ResolveTechniqueContentInput): string {
  return `${input.hobby} ${input.techniqueName} tutorial drill practice`;
}

function parseIsoDurationToSeconds(duration: string): number {
  const match = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(duration);

  if (!match) {
    return 0;
  }

  const [, hours = "0", minutes = "0", seconds = "0"] = match;
  return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
}
