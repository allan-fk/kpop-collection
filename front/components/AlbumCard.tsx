import { Link } from "expo-router";
import { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

import { icons } from "@/constants/icons";
import { getAlbumCoverUrl } from "@/services/musicApi";

const PLACEHOLDER = "https://placehold.co/500x500/1a1a1a/FFFFFF.png";

interface AlbumCardProps {
  album: MBReleaseGroup;
}

const AlbumCard = ({ album }: AlbumCardProps) => {
  const [coverError, setCoverError] = useState(false);

  const artistName =
    album["artist-credit"]?.map((ac) => ac.artist.name).join(", ") ??
    "Unknown Artist";
  const year = album["first-release-date"]?.split("-")[0] ?? "";
  const coverUri = coverError ? PLACEHOLDER : getAlbumCoverUrl(album.id);

  return (
    <Link href={`/albums/${album.id}`} asChild>
      <TouchableOpacity className="w-[30%]">
        <Image
          source={{ uri: coverUri }}
          className="w-full h-52 rounded-lg"
          resizeMode="cover"
          onError={() => setCoverError(true)}
        />

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
