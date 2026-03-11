const MB_BASE = "https://musicbrainz.org/ws/2";
const CAA_BASE = "https://coverartarchive.org";

const MB_HEADERS = {
  Accept: "application/json",
  "User-Agent": "KpopCollection/1.0 ( allankleinpro@gmail.com )",
};

/// ── Search ────────────────────────────────────────────────────────────────────

export const searchAlbums = async (query: string): Promise<MBReleaseGroup[]> => {
  // 1. On nettoie toujours la requête pour éviter les erreurs de syntaxe Lucene
  const cleanedQuery = query.replace(/['"\\+\-!(){}[\]^~*?:|&]/g, "").trim();
  
  if (!cleanedQuery) return []; // Évite de faire une requête vide

  // 2. On construit les différents filtres
  // Cible de la recherche : Titre de l'album (par défaut) OU Nom de l'artiste
  const searchTarget = `("${cleanedQuery}" OR artist:"${cleanedQuery}")`;
  
  // Les tags étendus pour la musique coréenne et la K-pop
  const tags = `(tag:kpop OR tag:"k-pop" OR tag:korea OR tag:korean OR tag:southkorea OR tag:"south-korea")`;
  
  // Les types de projets (Albums complets et Mini-Albums/EPs)
  const types = `(primarytype:album OR primarytype:ep)`;

  // 3. On assemble la requête finale
  const luceneQuery = `${searchTarget} AND ${tags} AND ${types}`;
  
  const url = `${MB_BASE}/release-group?query=${encodeURIComponent(luceneQuery)}&fmt=json&limit=20`;
  
  const res = await fetch(url, { headers: MB_HEADERS });
  if (!res.ok) throw new Error(`MusicBrainz search failed: ${res.status}`);
  
  const data: MBSearchResponse = await res.json();
  return data["release-groups"] ?? [];
};

// ── Barcode search ────────────────────────────────────────────────────────────

// Les codes-barres sont attachés aux Releases, pas aux Release Groups.
// On récupère le release-group embarqué dans chaque release, puis on le
// convertit en MBReleaseGroup pour être compatible avec le reste de l'app.
export const searchAlbumByBarcode = async (
  barcode: string
): Promise<MBReleaseGroup[]> => {
  const url = `${MB_BASE}/release?query=barcode:${encodeURIComponent(barcode)}&inc=release-groups+artist-credits&fmt=json`;
  const res = await fetch(url, { headers: MB_HEADERS });
  if (!res.ok) throw new Error(`MusicBrainz barcode search failed: ${res.status}`);

  const data = await res.json();
  const releases: any[] = data.releases ?? [];

  // Dé-duplique les release-groups et restitue le type MBReleaseGroup
  const seen = new Set<string>();
  const groups: MBReleaseGroup[] = [];

  for (const release of releases) {
    const rg = release["release-group"];
    if (!rg || seen.has(rg.id)) continue;
    seen.add(rg.id);
    groups.push({
      id: rg.id,
      title: rg.title ?? release.title,
      "primary-type": rg["primary-type"],
      "first-release-date": rg["first-release-date"],
      // L'artist-credit est sur la release, on le remonte sur le group
      "artist-credit": release["artist-credit"],
    });
  }

  return groups;
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
