import { View, Text, Image, FlatList, ActivityIndicator } from "react-native";

import { images } from "@/constants/images";
import { icons } from "@/constants/icons";
import AlbumCard from "@/components/AlbumCard";
import useFetch from "@/services/useFetch";
import { fetchLatestReleases } from "@/services/musicApi";

const LatestReleases = () => {
  const { data: albums, loading, error } = useFetch(fetchLatestReleases);

  return (
    <View className="flex-1 bg-primary">
      <Image
        source={images.bg}
        className="flex-1 absolute w-full z-0"
        resizeMode="cover"
      />
      <FlatList
        className="px-5"
        data={albums ?? []}
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

            <Text className="text-xl text-white font-bold mt-5 mb-2">
              Nouveautés K-Pop
            </Text>

            {loading && (
              <ActivityIndicator size="large" color="#0000ff" className="my-3" />
            )}
            {error && (
              <Text className="text-red-500 my-3">Erreur : {error.message}</Text>
            )}
          </>
        }
        ListEmptyComponent={
          !loading && !error ? (
            <View className="mt-10">
              <Text className="text-center text-gray-500">
                Aucune nouveauté disponible.
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

export default LatestReleases;
