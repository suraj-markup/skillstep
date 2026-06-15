import type { ResolveTechniqueContentInput, VideoResource } from "@skillstep/shared";

export interface VideoProvider {
  findVideos(input: ResolveTechniqueContentInput): Promise<VideoResource[]>;
}

export class NoopVideoProvider implements VideoProvider {
  async findVideos(): Promise<VideoResource[]> {
    return [];
  }
}
