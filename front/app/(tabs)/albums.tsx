import { useState, useEffect } from "react";
import {
  Alert,
  View,
  Text,
  ActivityIndicator,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import { images } from "@/constants/images";
import { icons } from "@/constants/icons";
import SearchBar from "@/components/SearchBar";
import AlbumCard from "@/components/AlbumCard";
import { searchAlbums, searchAlbumByBarcode, uploadImageToScanBarcode } from "@/services/musicApi";

const Albums = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [albums, setAlbums] = useState<MBReleaseGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Recherche textuelle (debounce 2000ms imposé par MusicBrainz) ─────────────
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

  // ── Recherche par code-barres ────────────────────────────────────────────────
  const handlePickImage = async () => {
    // 1. Demande de permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission requise",
        "Autorisez l'accès à votre galerie pour utiliser cette fonctionnalité."
      );
      return;
    }

    // 2. Sélection de l'image
    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      quality: 1,
    });

    if (picked.canceled || !picked.assets?.[0]) return;

    const imageUri = picked.assets[0].uri;

    setLoading(true);
    setError(null);

    try {
      // 3. Envoi de l'image au backend pour décodage du code-barres
      const barcode = await uploadImageToScanBarcode(imageUri);

      // 4. Recherche de l'album via le code-barres
      const results = await searchAlbumByBarcode(barcode);

      if (!results || results.length === 0) {
        Alert.alert(
          "Album introuvable",
          `Aucun album n'a été trouvé pour le code-barres : ${barcode}`
        );
        return;
      }

      // 5. Mise à jour de la liste et effacement de la recherche textuelle
      setSearchQuery("");
      setAlbums(results);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Barcode scan failed";
      Alert.alert("Erreur de scan", message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

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

            {/* SearchBar + bouton galerie */}
            <View className="my-5 flex-row items-center gap-x-3">
              <View className="flex-1">
                <SearchBar
                  placeholder="Search for an album"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
              <TouchableOpacity
                onPress={handlePickImage}
                className="bg-dark-200 rounded-full p-3"
                disabled={loading}
              >
                <Ionicons name="barcode-outline" size={24} color="#ab8bff" />
              </TouchableOpacity>
            </View>

            {loading && (
              <ActivityIndicator size="large" color="#0000ff" className="my-3" />
            )}
            {error && (
              <Text className="text-red-500 px-5 my-3">Error: {error}</Text>
            )}
            {!loading && !error && albums.length > 0 && (
              <Text className="text-xl text-white font-bold">
                {searchQuery.trim() ? (
                  <>
                    Results for{" "}
                    <Text className="text-accent">{searchQuery}</Text>
                  </>
                ) : (
                  "Results"
                )}
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
                  : "Start typing or scan a barcode to find albums"}
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

export default Albums;