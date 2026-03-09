import { Client, Databases, ID, Query } from "react-native-appwrite";

/// On récupère l'URL depuis le .env
const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Enregistre ou met à jour un film recherché
export const updateSearchCount = async (query: string, movie: any) => {
    try {
        const response = await fetch(`${API_URL}/movies/search`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                searchTerm: query,
                movieId: movie.id, // Attention: le DTO Spring Boot attend 'movieId' (camelCase) et non 'movie_id'
                title: movie.title,
                posterUrl: `https://image.tmdb.org/t/p/w500${movie.poster_path}`, // DTO attend 'posterUrl'
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to update search count: ${response.statusText}`);
        }
    } catch (error) {
        console.error("Error updating search count:", error);
        throw error;
    }
};

// Récupère le Top 5 des tendances
export const getTrendingMovies = async (): Promise<any[] | undefined> => {
    try {
        const response = await fetch(`${API_URL}/movies/trending`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch trending movies: ${response.statusText}`);
        }

        const data = await response.json();
        return data; // Retourne le tableau d'objets TrendingMovie généré par Spring Boot
    } catch (error) {
        console.error("Error fetching trending movies:", error);
        return undefined;
    }
};