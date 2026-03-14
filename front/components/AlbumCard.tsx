import { Link } from "expo-router";
import { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

import { icons } from "@/constants/icons";
import { useAlbumFavorites } from "@/services/useAlbumFavorites";

const PLACEHOLDER = "https://placehold.co/500x500/1a1a1a/FFFFFF.png";

interface AlbumCardProps {
  album: MBReleaseGroup;
}

const AlbumCard = ({ album }: AlbumCardProps) => {
  const [coverError, setCoverError] = useState(false);
  const { isFavorite, toggleFavorite } = useAlbumFavorites();

  const favorited = isFavorite(album.id);
  const artistName =
    album["artist-credit"]?.map((ac) => ac.artist.name).join(", ") ??
    "Unknown Artist";
  const year = album["first-release-date"]?.split("-")[0] ?? "";
  const coverUri = coverError || !album.coverUrl ? PLACEHOLDER : album.coverUrl;

  return (
    <Link href={`/albums/${album.id}`} asChild>
      <TouchableOpacity className="w-[30%]">
        <View className="relative">
          <Image
            source={{ uri: coverUri }}
            className="w-full h-52 rounded-lg"
            resizeMode="cover"
            onError={() => setCoverError(true)}
          />
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              toggleFavorite(album);
            }}
            className="absolute top-2 right-2 bg-black/50 rounded-full p-1"
          >
            <Image
              source={icons.save}
              className="size-5"
              style={{ tintColor: favorited ? "#FFD700" : "#FFFFFF" }}
            />
          </TouchableOpacity>
        </View>

        <Text className="text-sm font-bold text-white mt-2" numberOfLines={1}>
          {album.title}
        </Text>

        <View className="flex-row items-center justify-start gap-x-1">
          <Image source={icons.play} className="size-4" tintColor="#A8B5DB" />
          <Text
            className="text-xs text-light-300 font-medium flex-1"
            numberOfLines={1}
          >
            {artistName}
          </Text>
        </View>

        <View className="flex-row items-center justify-between">
          <Text className="text-xs text-light-300 font-medium mt-1">{year}</Text>
          <Text className="text-xs font-medium text-light-300 uppercase">
            Album
          </Text>
        </View>
      </TouchableOpacity>
    </Link>
  );
};

export default AlbumCard;
