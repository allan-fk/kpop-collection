import { useCallback, useEffect, useState } from "react";
import { getAlbumCoverUrl } from "@/services/musicApi";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const useAlbumFavorites = () => {
  const [savedAlbums, setSavedAlbums] = useState<SavedAlbum[]>([]);

  const loadFavorites = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/albums/saved`);
      if (res.ok) {
        const data: SavedAlbum[] = await res.json();
        setSavedAlbums(data);
      }
    } catch (e) {
      console.error("useAlbumFavorites: error loading saved albums", e);
    }
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const toggleFavorite = useCallback(
    async (album: MBReleaseGroup) => {
      const existing = savedAlbums.find(
        (a) => a.releaseGroupId === album.id
      );

      if (existing) {
        // Suppression
        try {
          await fetch(`${API_URL}/albums/save/${existing.id}`, {
            method: "DELETE",
          });
          setSavedAlbums((prev) => prev.filter((a) => a.id !== existing.id));
        } catch (e) {
          console.error("useAlbumFavorites: error removing saved album", e);
        }
      } else {
        // Sauvegarde
        try {
          const artistName =
            album["artist-credit"]?.map((ac) => ac.artist.name).join(", ") ??
            "Unknown Artist";

          const res = await fetch(`${API_URL}/albums/save`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              releaseGroupId: album.id,
              title: album.title,
              artist: artistName,
              coverUrl: getAlbumCoverUrl(album.id),
            }),
          });
          if (res.ok) {
            const saved: SavedAlbum = await res.json();
            setSavedAlbums((prev) => [...prev, saved]);
          }
        } catch (e) {
          console.error("useAlbumFavorites: error saving album", e);
        }
      }
    },
    [savedAlbums]
  );

  const isFavorite = useCallback(
    (releaseGroupId: string) =>
      savedAlbums.some((a) => a.releaseGroupId === releaseGroupId),
    [savedAlbums]
  );

  return { savedAlbums, toggleFavorite, isFavorite, loadFavorites };
};
