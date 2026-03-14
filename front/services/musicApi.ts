const MB_BASE = "https://musicbrainz.org/ws/2";
const CAA_BASE = "https://coverartarchive.org";
const API_BASE = __DEV__ 
  ? process.env.EXPO_PUBLIC_LOCAL_API_URL 
  : process.env.EXPO_PUBLIC_API_URL;

console.log("Mode développement:", __DEV__);
console.log("URL utilisée:", API_BASE);
//const API_BASE = process.env.EXPO_PUBLIC_API_URL;

const MB_HEADERS = {
  Accept: "application/json",
  "User-Agent": "KpopCollection/1.0 ( allankleinpro@gmail.com )",
};

const DISCOGS_HEADERS = {
  Accept: "application/json",
  "User-Agent": "KpopCollection/1.0 ( allankleinpro@gmail.com )",
  Authorization: `Discogs key=${process.env.EXPO_PUBLIC_DISCOGS_CONSUMER_KEY}, secret=${process.env.EXPO_PUBLIC_DISCOGS_CONSUMER_SECRET}`,
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

// ── Barcode search (Discogs) ──────────────────────────────────────────────────

// Discogs est utilisé pour la recherche par code-barres car son catalogue
// d'éditions physiques K-pop est bien plus complet que MusicBrainz.
// Les résultats sont mappés vers MBReleaseGroup pour rester compatibles avec
// tous les composants UI existants (AlbumCard, saved-albums, etc.).
// Le champ coverUrl (optionnel sur MBReleaseGroup) est renseigné directement
// depuis Discogs — AlbumCard l'utilise en priorité sur Cover Art Archive.
export const searchAlbumByBarcode = async (
  barcode: string
): Promise<MBReleaseGroup[]> => {
  const url = `https://api.discogs.com/database/search?barcode=${encodeURIComponent(barcode)}`;
  const res = await fetch(url, { headers: DISCOGS_HEADERS });

  if (res.status === 429) {
    throw new Error("Discogs rate limit atteint (60 req/min). Réessaie dans quelques secondes.");
  }
  if (!res.ok) {
    throw new Error(`Discogs search failed: ${res.status}`);
  }

  const data = await res.json();
  const results: any[] = data.results ?? [];

  return results
    // Garde uniquement les releases et masters, pas les artistes/labels
    .filter((r: any) => r.type === "release" || r.type === "master")
    .map((r: any) => {
      // Discogs formate le titre "Artiste - Titre de l'album"
      const dashIndex = r.title.indexOf(" - ");
      const artistName = dashIndex !== -1 ? r.title.slice(0, dashIndex) : "Unknown Artist";
      const albumTitle = dashIndex !== -1 ? r.title.slice(dashIndex + 3) : r.title;

      return {
        id: r.id.toString(),
        title: albumTitle,
        "primary-type": r.format?.[0] ?? "Album",
        "first-release-date": r.year?.toString(),
        "artist-credit": [
          {
            artist: { id: r.id.toString(), name: artistName, "sort-name": artistName },
          },
        ],
        // URL de la pochette fournie directement par Discogs
        coverUrl: r.cover_image || r.thumb || undefined,
      } satisfies MBReleaseGroup;
    });
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

// ── Backend barcode scan ──────────────────────────────────────────────────────

export const uploadImageToScanBarcode = async (imageUri: string): Promise<string> => {
  const body = new FormData();
  body.append("file", { uri: imageUri, name: "scan.jpg", type: "image/jpeg" } as any);

  const res = await fetch(`${API_BASE}/barcode/scan`, { method: "POST", body });
  const text = await res.text();
  if (!res.ok) throw new Error(text);
  return text;
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
