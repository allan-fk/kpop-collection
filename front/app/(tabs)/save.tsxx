import React, { useCallback } from "react";
import { icons } from "@/constants/icons";
import { useFavorites } from "@/services/useFavorites";
import { useFocusEffect, useRouter } from "expo-router";
import {
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SavedMovieItem = ({
  item,
  onNavigate,
  onRemove,
}: {
  item: SavedMovie;
  onNavigate: () => void;
  onRemove: () => void;
}) => (
  <TouchableOpacity
    onPress={onNavigate}
    className="flex-row items-center bg-dark-100 rounded-xl mb-3 overflow-hidden"
  >
    <Image
      source={{
        uri: item.posterUrl ?? "https://placehold.co/600x400/1a1a1a/FFFFFF.png",
      }}
      className="w-20 h-28"
      resizeMode="cover"
    />
    <View className="flex-1 px-4">
      <Text className="text-white font-bold text-sm" numberOfLines={2}>
        {item.title}
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

const Save = () => {
  const router = useRouter();
  const { savedMovies, toggleFavorite, loadFavorites } = useFavorites();

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [loadFavorites])
  );

  const isEmpty = savedMovies.length === 0;

  return (
    <SafeAreaView className="bg-primary flex-1">
      <View className="flex-1 px-5">
        <View className="flex-row justify-center mt-10 mb-8">
          <Image source={icons.logo} className="w-12 h-10" />
        </View>

        <Text className="text-white text-xl font-bold mb-4">Saved Movies</Text>

        {isEmpty ? (
          <View className="flex-1 justify-center items-center gap-4">
            <Image source={icons.save} className="size-12" tintColor="#6B7280" />
            <Text className="text-gray-500 text-base text-center">
              No saved movies yet.{"\n"}Tap the bookmark icon on any movie to add it here.
            </Text>
          </View>
        ) : (
          <FlatList
            data={savedMovies}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <SavedMovieItem
                item={item}
                onNavigate={() => router.push(`/movies/${item.movieId}`)}
                onRemove={() =>
                  toggleFavorite({
                    id: item.movieId,
                    title: item.title,
                    poster_path: "",
                  })
                }
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

export default Save;
