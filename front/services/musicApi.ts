const DISCOGS_BASE = "https://api.discogs.com";

const API_BASE = __DEV__
  ? process.env.EXPO_PUBLIC_LOCAL_API_URL
  : process.env.EXPO_PUBLIC_API_URL;

console.log("Mode développement:", __DEV__);
console.log("URL utilisée:", API_BASE);

const DISCOGS_HEADERS = {
  Accept: "application/json",
  "User-Agent": "KpopCollection/1.0 ( allankleinpro@gmail.com )",
  Authorization: `Discogs key=${process.env.EXPO_PUBLIC_DISCOGS_CONSUMER_KEY}, secret=${process.env.EXPO_PUBLIC_DISCOGS_CONSUMER_SECRET}`,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

// Parse "3:45" → millisecondes (225000). Renvoie undefined si la durée est vide.
const parseDurationToMs = (duration: string): number | undefined => {
  if (!duration?.trim()) return undefined;
  const parts = duration.split(":").map(Number);
  if (parts.length === 2 && !parts.some(isNaN)) {
    return (parts[0] * 60 + parts[1]) * 1000;
  }
  return undefined;
};

// Discogs titre "Artiste - Titre" → { artistName, albumTitle }
const parseDiscogsTitle = (raw: string) => {
  const dashIndex = raw.indexOf(" - ");
  return dashIndex !== -1
    ? { artistName: raw.slice(0, dashIndex), albumTitle: raw.slice(dashIndex + 3) }
    : { artistName: "Unknown Artist", albumTitle: raw };
};

// Fetch Discogs avec vérification du rate-limit (429).
// Si l'ID est préfixé ("master-123" ou "release-123"), la route est déterminée directement.
// Sinon (favoris sauvegardés sans préfixe) : fallback /releases → /masters si 404.
const fetchDiscogsResource = async (id: string): Promise<any> => {
  const check429 = (status: number) => {
    if (status === 429)
      throw new Error("Rate limit Discogs atteint (60 req/min). Réessaie dans quelques secondes.");
  };

  if (id.startsWith("master-")) {
    const realId = id.slice("master-".length);
    const res = await fetch(`${DISCOGS_BASE}/masters/${realId}`, { headers: DISCOGS_HEADERS });
    check429(res.status);
    if (!res.ok) throw new Error(`Discogs request failed: ${res.status}`);
    return res.json();
  }

  if (id.startsWith("release-")) {
    const realId = id.slice("release-".length);
    const res = await fetch(`${DISCOGS_BASE}/releases/${realId}`, { headers: DISCOGS_HEADERS });
    check429(res.status);
    if (!res.ok) throw new Error(`Discogs request failed: ${res.status}`);
    return res.json();
  }

  // Rétrocompatibilité : ID sans préfixe (albums déjà en favoris)
  const releaseRes = await fetch(`${DISCOGS_BASE}/releases/${id}`, { headers: DISCOGS_HEADERS });
  check429(releaseRes.status);
  if (releaseRes.ok) return releaseRes.json();
  if (releaseRes.status !== 404) throw new Error(`Discogs request failed: ${releaseRes.status}`);

  const masterRes = await fetch(`${DISCOGS_BASE}/masters/${id}`, { headers: DISCOGS_HEADERS });
  check429(masterRes.status);
  if (!masterRes.ok) throw new Error(`Discogs request failed: ${masterRes.status}`);
  return masterRes.json();
};

// ── Latest releases ───────────────────────────────────────────────────────────

export const fetchLatestReleases = async (): Promise<MBReleaseGroup[]> => {
  const url = `${DISCOGS_BASE}/database/search?style=K-Pop&type=master&format=album&sort=year&sort_order=desc&per_page=20&page=1`;
  const res = await fetch(url, { headers: DISCOGS_HEADERS });

  if (res.status === 429) {
    throw new Error("Rate limit Discogs atteint (60 req/min). Réessaie dans quelques secondes.");
  }
  if (!res.ok) throw new Error(`Discogs latest releases failed: ${res.status}`);

  const data = await res.json();
  const results: any[] = data.results ?? [];

  return results.map((r: any) => {
    const { artistName, albumTitle } = parseDiscogsTitle(r.title ?? "");
    return {
      id: `master-${r.id}`,
      title: albumTitle,
      "primary-type": "Album",
      "first-release-date": r.year?.toString(),
      "artist-credit": [
        { artist: { id: r.id.toString(), name: artistName, "sort-name": artistName } },
      ],
      coverUrl: r.cover_image || r.thumb || undefined,
    } satisfies MBReleaseGroup;
  });
};

export const fetchLatestReleases2 = async (): Promise<MBReleaseGroup[]> => {
  // Appel à votre nouveau endpoint Java
  const res = await fetch(`${API_BASE}/albums/latest`);

  if (!res.ok) {
    throw new Error(`Failed to fetch latest releases from backend: ${res.status}`);
  }

  const data: any[] = await res.json();

  // Mapping des données SaveAlbumRequest vers MBReleaseGroup
  return data.map((album: any) => ({
    id: album.releaseGroupId, // On utilise l'ID du groupe de sortie
    title: album.title,
    "primary-type": "Album",
    "first-release-date": "2026",
    coverUrl: album.coverUrl,
    "artist-credit": [
      { 
        artist: { 
          id: album.releaseGroupId, 
          name: album.artist, 
          "sort-name": album.artist 
        } 
      },
    ],
  } satisfies MBReleaseGroup));
};

// ── Search ────────────────────────────────────────────────────────────────────

export const searchAlbums = async (query: string): Promise<MBReleaseGroup[]> => {
  if (!query.trim()) return [];

  const url = `${DISCOGS_BASE}/database/search?q=${encodeURIComponent(query)}&type=master&format=album&style=K-Pop`;
  const res = await fetch(url, { headers: DISCOGS_HEADERS });

  if (res.status === 429) {
    throw new Error("Rate limit Discogs atteint (60 req/min). Réessaie dans quelques secondes.");
  }
  if (!res.ok) throw new Error(`Discogs search failed: ${res.status}`);

  const data = await res.json();
  const results: any[] = data.results ?? [];

  return results.map((r: any) => {
    const { artistName, albumTitle } = parseDiscogsTitle(r.title ?? "");
    return {
      id: `master-${r.id}`,
      title: albumTitle,
      "primary-type": "Album",
      "first-release-date": r.year?.toString(),
      "artist-credit": [
        { artist: { id: r.id.toString(), name: artistName, "sort-name": artistName } },
      ],
      coverUrl: r.cover_image || r.thumb || undefined,
    } satisfies MBReleaseGroup;
  });
};

// ── Barcode search (Discogs) ──────────────────────────────────────────────────

export const searchAlbumByBarcode = async (
  barcode: string
): Promise<MBReleaseGroup[]> => {
  const url = `${DISCOGS_BASE}/database/search?barcode=${encodeURIComponent(barcode)}`;
  const res = await fetch(url, { headers: DISCOGS_HEADERS });

  if (res.status === 429) {
    throw new Error("Rate limit Discogs atteint (60 req/min). Réessaie dans quelques secondes.");
  }
  if (!res.ok) throw new Error(`Discogs barcode search failed: ${res.status}`);

  const data = await res.json();
  const results: any[] = data.results ?? [];

  return results
    .filter((r: any) => r.type === "release" || r.type === "master")
    .map((r: any) => {
      const { artistName, albumTitle } = parseDiscogsTitle(r.title ?? "");
      return {
        id: `${r.type}-${r.id}`,
        title: albumTitle,
        "primary-type": r.format?.[0] ?? "Album",
        "first-release-date": r.year?.toString(),
        "artist-credit": [
          { artist: { id: r.id.toString(), name: artistName, "sort-name": artistName } },
        ],
        coverUrl: r.cover_image || r.thumb || undefined,
      } satisfies MBReleaseGroup;
    });
};

// ── Details ───────────────────────────────────────────────────────────────────

export const fetchAlbumDetails = async (id: string): Promise<MBReleaseGroupDetails> => {
  const data = await fetchDiscogsResource(id);

  const artistCredit: MBArtistCredit[] = (data.artists ?? []).map((a: any) => ({
    artist: { id: a.id.toString(), name: a.name, "sort-name": a.name },
  }));

  return {
    id: data.id.toString(),
    title: data.title ?? "",
    "primary-type": data.formats?.[0]?.name ?? data.format?.[0] ?? "Album",
    "first-release-date": data.year?.toString(),
    "artist-credit": artistCredit,
    coverUrl: data.images?.[0]?.uri ?? undefined,
    // Tableau fictif avec le même id pour que fetchAlbumTracks puisse être appelé
    releases: [{ id, title: data.title ?? "" }],
  } satisfies MBReleaseGroupDetails;
};

// ── Tracklist ─────────────────────────────────────────────────────────────────

export const fetchAlbumTracks = async (releaseId: string): Promise<MBTrack[]> => {
  try {
    const data = await fetchDiscogsResource(releaseId);
    const tracklist: any[] = data.tracklist ?? [];

    return tracklist
      .filter((t: any) => t.type_ === "track" || !t.type_)
      .map((t: any, index: number) => ({
        id: `${releaseId}-${index}`,
        position: Number(t.position) || index + 1,
        number: t.position?.toString() ?? String(index + 1),
        title: t.title ?? "",
        length: parseDurationToMs(t.duration ?? ""),
      }));
  } catch {
    return [];
  }
};

// ── Backend barcode scan ──────────────────────────────────────────────────────

export const uploadImageToScanBarcode = async (imageUri: string): Promise<string> => {
  const body = new FormData();
  body.append("file", { uri: imageUri, name: "scan.jpg", type: "image/jpeg" } as any);

  const res = await fetch(`${API_BASE}/barcode/scan`, { method: "POST", body });
  const text = await res.text();
  if (!res.ok) throw new Error(text);
  return text;
};

// ── Utils ─────────────────────────────────────────────────────────────────────

export const formatTrackDuration = (ms?: number): string => {
  if (!ms) return "";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};
