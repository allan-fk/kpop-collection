import { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { icons } from "@/constants/icons";
import useFetch from "../../services/useFetch";
import {
  fetchAlbumDetails,
  fetchAlbumTracks,
  getAlbumCoverUrl,
  formatTrackDuration,
} from "@/services/musicApi";

const PLACEHOLDER = "https://placehold.co/500x500/1a1a1a/FFFFFF.png";

interface InfoRowProps {
  label: string;
  value?: string | null;
}

const InfoRow = ({ label, value }: InfoRowProps) => (
  <View className="flex-col items-start justify-center mt-5">
    <Text className="text-light-200 font-normal text-sm">{label}</Text>
    <Text className="text-light-100 font-bold text-sm mt-2">
      {value || "N/A"}
    </Text>
  </View>
);

const AlbumDetails = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [coverError, setCoverError] = useState(false);
  const [tracks, setTracks] = useState<MBTrack[]>([]);

  const { data: album, loading } = useFetch(() =>
    fetchAlbumDetails(id as string)
  );

  // Charge la tracklist depuis le premier release disponible
  useEffect(() => {
    const firstReleaseId = album?.releases?.[0]?.id;
    if (firstReleaseId) {
      fetchAlbumTracks(firstReleaseId).then(setTracks);
    }
  }, [album]);

  const artistName =
    album?.["artist-credit"]?.map((ac) => ac.artist.name).join(", ") ??
    "Unknown Artist";

  const year = album?.["first-release-date"]?.split("-")[0] ?? null;
  const coverUri = coverError ? PLACEHOLDER : getAlbumCoverUrl(id as string);

  if (loading) {
    return (
      <SafeAreaView className="bg-primary flex-1">
        <ActivityIndicator size="large" color="#0000ff" className="mt-20" />
      </SafeAreaView>
    );
  }

  return (
    <View className="bg-primary flex-1">
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        {/* Cover Art */}
        <Image
          source={{ uri: coverUri }}
          className="w-full h-[400px]"
          resizeMode="cover"
          onError={() => setCoverError(true)}
        />

        {/* Details */}
        <View className="flex-col items-start justify-center mt-5 px-5">
          <Text className="text-white font-bold text-xl">{album?.title}</Text>

          <View className="flex-row items-center gap-x-1 mt-2">
            <Text className="text-light-200 text-sm">{artistName}</Text>
            {year ? (
              <>
                <Text className="text-light-200 text-sm"> • </Text>
                <Text className="text-light-200 text-sm">{year}</Text>
              </>
            ) : null}
          </View>

          {album?.["primary-type"] ? (
            <View className="flex-row items-center bg-dark-100 px-2 py-1 rounded-md gap-x-1 mt-2">
              <Image source={icons.play} className="size-4" tintColor="#fff" />
              <Text className="text-white font-bold text-sm">
                {album["primary-type"]}
              </Text>
            </View>
          ) : null}

          <InfoRow label="Artist" value={artistName} />
          <InfoRow label="Release Date" value={album?.["first-release-date"]} />

          {/* Tracklist */}
          {tracks.length > 0 && (
            <View className="w-full mt-5">
              <Text className="text-light-200 font-normal text-sm mb-3">
                Tracklist
              </Text>
              {tracks.map((track) => (
                <View
                  key={track.id}
                  className="flex-row items-center justify-between py-2 border-b border-dark-100"
                >
                  <View className="flex-row items-center flex-1 gap-x-3">
                    <Text className="text-light-200 text-xs w-6 text-right">
                      {track.position}
                    </Text>
                    <Text
                      className="text-light-100 font-bold text-sm flex-1"
                      numberOfLines={1}
                    >
                      {track.title}
                    </Text>
                  </View>
                  {track.length ? (
                    <Text className="text-light-200 text-xs ml-3">
                      {formatTrackDuration(track.length)}
                    </Text>
                  ) : null}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Go Back */}
      <TouchableOpacity
        className="absolute bottom-5 left-0 right-0 mx-5 bg-accent rounded-lg py-3.5 flex flex-row items-center justify-center z-50"
        onPress={router.back}
      >
        <Image
          source={icons.arrow}
          className="size-5 mr-1 mt-0.5 rotate-180"
          tintColor="#fff"
        />
        <Text className="text-white font-semibold text-base">Go Back</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AlbumDetails;
