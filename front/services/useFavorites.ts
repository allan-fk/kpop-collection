import { useCallback, useEffect, useState } from "react";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const useFavorites = () => {
  const [savedMovies, setSavedMovies] = useState<SavedMovie[]>([]);

  // Charge la liste des favoris depuis le backend au montage
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/movies/saved`);
        if (res.ok) {
          const data: SavedMovie[] = await res.json();
          setSavedMovies(data);
        }
      } catch (e) {
        console.error("useFavorites: error loading saved movies", e);
      }
    })();
  }, []);

  const toggleFavorite = useCallback(
    async (movie: Pick<Movie, "id" | "title" | "poster_path">) => {
      const existing = savedMovies.find((m) => m.movieId === movie.id);

      if (existing) {
        // Suppression
        try {
          await fetch(`${API_URL}/movies/save/${existing.id}`, {
            method: "DELETE",
          });
          setSavedMovies((prev) => prev.filter((m) => m.id !== existing.id));
        } catch (e) {
          console.error("useFavorites: error removing saved movie", e);
        }
      } else {
        // Sauvegarde
        try {
          const res = await fetch(`${API_URL}/movies/save`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              movieId: movie.id,
              title: movie.title,
              posterUrl: movie.poster_path
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : null,
            }),
          });
          if (res.ok) {
            const saved: SavedMovie = await res.json();
            setSavedMovies((prev) => [...prev, saved]);
          }
        } catch (e) {
          console.error("useFavorites: error saving movie", e);
        }
      }
    },
    [savedMovies]
  );

  const isFavorite = useCallback(
    (movieId: number) => savedMovies.some((m) => m.movieId === movieId),
    [savedMovies]
  );

  return { savedMovies, toggleFavorite, isFavorite };
};
