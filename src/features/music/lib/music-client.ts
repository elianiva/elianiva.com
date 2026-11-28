import { getApi } from "~/lib/api";
import type { MusicData, TopListsData } from "./types";

export function getTopListsData() {
  return getApi<TopListsData>("/api/music/top");
}

export function getRecentTracks() {
  return getApi<MusicData>("/api/music/recent");
}
