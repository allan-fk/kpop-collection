const MB_BASE = "https://musicbrainz.org/ws/2";
const CAA_BASE = "https://coverartarchive.org";

const MB_HEADERS = {
  Accept: "application/json",
  "User-Agent": "KpopCollection/1.0 ( allankleinpro@gmail.com )",
};

// ── Search ────────────────────────────────────────────────────────────────────

export const searchAlbums = async (query: string): Promise<MBReleaseGroup[]> => {
  const url = `${MB_BASE}/release-group?query=${encodeURIComponent(query)}&type=album&fmt=json&limit=20`;
  const res = await fetch(url, { headers: MB_HEADERS });
  if (!res.ok) throw new Error(`MusicBrainz search failed: ${res.status}`);
  const data: MBSearchResponse = await res.json();
  return data["release-groups"] ?? [];
};

// ── Details ───────────────────────────────────────────────────────────────────

export const fetchAlbumDetails = async (id: string): Promise<MBReleaseGroupDetails> => {
  const url = `${MB_BASE}/release-group/${id}?inc=releases+artists&fmt=json`;
  const res = await fetch(url, { headers: MB_HEADERS });
  if (!res.ok) throw new Error(`MusicBrainz album details failed: ${res.status}`);
  return res.json();
};

// ── Tracklist (from first release of the release-group) ──────────────────────

export const fetchAlbumTracks = async (releaseId: string): Promise<MBTrack[]> => {
  const url = `${MB_BASE}/release/${releaseId}?inc=recordings&fmt=json`;
  const res = await fetch(url, { headers: MB_HEADERS });
  if (!res.ok) return [];
  const data = await res.json();
  const media: MBMedia[] = data.media ?? [];
  return media.flatMap((m) => m.tracks ?? []);
};

// ── Cover Art Archive ─────────────────────────────────────────────────────────

export const getAlbumCoverUrl = (releaseGroupId: string): string =>
  `${CAA_BASE}/release-group/${releaseGroupId}/front-500`;

// ── Utils ─────────────────────────────────────────────────────────────────────

export const formatTrackDuration = (ms?: number): string => {
  if (!ms) return "";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};
