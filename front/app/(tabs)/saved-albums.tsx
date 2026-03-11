import React, { useCallback } from "react";
import { icons } from "@/constants/icons";
import { useAlbumFavorites } from "@/services/useAlbumFavorites";
import { useFocusEffect, useRouter } from "expo-router";
import {
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SavedAlbumItem = ({
  item,
  onNavigate,
  onRemove,
}: {
  item: SavedAlbum;
  onNavigate: () => void;
  onRemove: () => void;
}) => (
  <TouchableOpacity
    onPress={onNavigate}
    className="flex-row items-center bg-dark-100 rounded-xl mb-3 overflow-hidden"
  >
    <Image
      source={{
        uri: item.coverUrl ?? "https://placehold.co/500x500/1a1a1a/FFFFFF.png",
      }}
      className="w-20 h-28"
      resizeMode="cover"
    />
    <View className="flex-1 px-4">
      <Text className="text-white font-bold text-sm" numberOfLines={2}>
        {item.title}
      </Text>
      <Text className="text-light-300 text-xs mt-1" numberOfLines={1}>
        {item.artist}
      </Text>
    </View>
    <TouchableOpacity
      onPress={(e) => {
        e.stopPropagation();
        onRemove();
      }}
      className="pr-4"
    >
      <Image
        source={icons.save}
        className="size-6"
        style={{ tintColor: "#FFD700" }}
      />
    </TouchableOpacity>
  </TouchableOpacity>
);

const SavedAlbums = () => {
  const router = useRouter();
  const { savedAlbums, toggleFavorite, loadFavorites } = useAlbumFavorites();

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [loadFavorites])
  );

  const isEmpty = savedAlbums.length === 0;

  return (
    <SafeAreaView className="bg-primary flex-1">
      <View className="flex-1 px-5">
        <View className="flex-row justify-center mt-10 mb-8">
          <Image source={icons.logo} className="w-12 h-10" />
        </View>

        <Text className="text-white text-xl font-bold mb-4">Saved Albums</Text>

        {isEmpty ? (
          <View className="flex-1 justify-center items-center gap-4">
            <Image source={icons.play} className="size-12" tintColor="#6B7280" />
            <Text className="text-gray-500 text-base text-center">
              No saved albums yet.{"\n"}Tap the bookmark icon on any album to add it here.
            </Text>
          </View>
        ) : (
          <FlatList
            data={savedAlbums}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <SavedAlbumItem
                item={item}
                onNavigate={() => router.push(`/albums/${item.releaseGroupId}`)}
                onRemove={() => {
                  // On reconstruit un MBReleaseGroup minimal pour toggleFavorite
                  toggleFavorite({
                    id: item.releaseGroupId,
                    title: item.title,
                    "artist-credit": [
                      { artist: { id: "", name: item.artist, "sort-name": item.artist } },
                    ],
                  });
                }}
              />
            )}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default SavedAlbums;
