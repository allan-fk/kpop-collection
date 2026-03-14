import { useCallback } from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";

import { icons } from "@/constants/icons";
import { useAlbumFavorites } from "@/services/useAlbumFavorites";

const PLACEHOLDER = "https://placehold.co/500x500/1a1a1a/FFFFFF.png";

const AlbumThumbnail = ({ item }: { item: SavedAlbum }) => {
  const router = useRouter();
  return (
    <TouchableOpacity
      onPress={() => router.push(`/albums/${item.releaseGroupId}`)}
      className="mr-4 w-32"
    >
      <Image
        source={{ uri: item.coverUrl ?? PLACEHOLDER }}
        className="w-32 h-32 rounded-xl"
        resizeMode="cover"
      />
      <Text className="text-white text-xs font-bold mt-2" numberOfLines={1}>
        {item.title}
      </Text>
      <Text className="text-light-300 text-xs mt-0.5" numberOfLines={1}>
        {item.artist}
      </Text>
    </TouchableOpacity>
  );
};

const Profile = () => {
  const { savedAlbums, loadFavorites } = useAlbumFavorites();

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [loadFavorites])
  );

  return (
    <SafeAreaView className="bg-primary flex-1 px-5">
      {/* En-tête profil */}
      <View className="flex-row items-center gap-x-4 mt-10 mb-8">
        <View className="bg-dark-100 rounded-full p-4">
          <Image source={icons.person} className="size-10" tintColor="#fff" />
        </View>
        <Text className="text-white text-xl font-bold">Nom d'utilisateur</Text>
      </View>

      {/* Section albums sauvegardés */}
      <Text className="text-white text-lg font-bold mb-4">
        Mes albums sauvegardés
      </Text>

      {savedAlbums.length === 0 ? (
        <Text className="text-gray-500 text-sm">
          Aucun album sauvegardé pour l'instant.
        </Text>
      ) : (
        <FlatList
          data={savedAlbums}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <AlbumThumbnail item={item} />}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 20 }}
        />
      )}
    </SafeAreaView>
  );
};

export default Profile;
