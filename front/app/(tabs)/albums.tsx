import { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, FlatList, Image } from "react-native";
import { images } from "@/constants/images";
import { icons } from "@/constants/icons";
import SearchBar from "@/components/SearchBar";
import AlbumCard from "@/components/AlbumCard";
import { searchAlbums } from "@/services/musicApi";

const Albums = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [albums, setAlbums] = useState<MBReleaseGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce de 2000ms imposé par MusicBrainz pour éviter le bannissement
  useEffect(() => {
    if (!searchQuery.trim()) {
      setAlbums([]);
      setError(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const results = await searchAlbums(searchQuery);
        setAlbums(results);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Search failed");
        setAlbums([]);
      } finally {
        setLoading(false);
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  return (
    <View className="flex-1 bg-primary">
      <Image
        source={images.bg}
        className="flex-1 absolute w-full z-0"
        resizeMode="cover"
      />
      <FlatList
        className="px-5"
        data={albums}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <AlbumCard album={item} />}
        numColumns={3}
        columnWrapperStyle={{
          justifyContent: "flex-start",
          gap: 16,
          marginVertical: 16,
        }}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListHeaderComponent={
          <>
            <View className="w-full flex-row justify-center mt-20 items-center">
              <Image source={icons.logo} className="w-12 h-10" />
            </View>
            <View className="my-5">
              <SearchBar
                placeholder="Search for an album"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            {loading && (
              <ActivityIndicator
                size="large"
                color="#0000ff"
                className="my-3"
              />
            )}
            {error && (
              <Text className="text-red-500 px-5 my-3">Error: {error}</Text>
            )}
            {!loading && !error && searchQuery.trim() && albums.length > 0 && (
              <Text className="text-xl text-white font-bold">
                Results for{" "}
                <Text className="text-accent">{searchQuery}</Text>
              </Text>
            )}
          </>
        }
        ListEmptyComponent={
          !loading && !error ? (
            <View className="mt-10 px-5">
              <Text className="text-center text-gray-500">
                {searchQuery.trim()
                  ? "No albums found"
                  : "Start typing to search for albums"}
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

export default Albums;
