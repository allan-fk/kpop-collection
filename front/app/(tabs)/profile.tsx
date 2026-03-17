import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";

import { icons } from "@/constants/icons";
import { useAlbumFavorites } from "@/services/useAlbumFavorites";

const API_BASE = process.env.EXPO_PUBLIC_API_URL;

const PLACEHOLDER = "https://placehold.co/500x500/1a1a1a/FFFFFF.png";

interface UserInfo {
  id: number;
  username: string;
}

// ── Miniature album ────────────────────────────────────────────────────────────

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

// ── Formulaire de connexion / inscription ──────────────────────────────────────

const LoginForm = ({ onSuccess }: { onSuccess: (user: UserInfo) => void }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!username.trim() || !password.trim()) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      if (res.status === 401) {
        setError("Mot de passe incorrect.");
        return;
      }
      if (!res.ok) {
        setError("Une erreur est survenue. Réessaie.");
        return;
      }

      const user: UserInfo = await res.json();
      onSuccess(user);
    } catch {
      setError("Impossible de joindre le serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="bg-primary flex-1 px-6 justify-center">
      <View className="items-center mb-10">
        <Image source={icons.person} className="size-16" tintColor="#ab8bff" />
        <Text className="text-white text-2xl font-bold mt-4">Kpop Collection</Text>
        <Text className="text-light-300 text-sm mt-1">
          Connecte-toi ou crée un compte
        </Text>
      </View>

      <TextInput
        className="bg-dark-100 text-white rounded-xl px-4 py-3 mb-3 text-sm"
        placeholder="Nom d'utilisateur"
        placeholderTextColor="#A8B5DB"
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        className="bg-dark-100 text-white rounded-xl px-4 py-3 mb-4 text-sm"
        placeholder="Mot de passe"
        placeholderTextColor="#A8B5DB"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {error && (
        <Text className="text-red-400 text-sm text-center mb-3">{error}</Text>
      )}

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={loading}
        className="bg-accent rounded-xl py-3.5 items-center"
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-semibold text-base">Continuer</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// ── Vue profil (connecté) ──────────────────────────────────────────────────────

const ProfileView = ({
  user,
  onLogout,
}: {
  user: UserInfo;
  onLogout: () => void;
}) => {
  const { savedAlbums, loadFavorites } = useAlbumFavorites();

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [loadFavorites])
  );

  return (
    <SafeAreaView className="bg-primary flex-1 px-5">
      {/* En-tête profil */}
      <View className="flex-row items-center justify-between mt-10 mb-8">
        <View className="flex-row items-center gap-x-4">
          <View className="bg-dark-100 rounded-full p-4">
            <Image source={icons.person} className="size-10" tintColor="#fff" />
          </View>
          <Text className="text-white text-xl font-bold">{user.username}</Text>
        </View>

        <TouchableOpacity
          onPress={onLogout}
          className="bg-dark-100 rounded-xl px-3 py-2"
        >
          <Text className="text-light-300 text-xs">Se déconnecter</Text>
        </TouchableOpacity>
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

// ── Écran principal ────────────────────────────────────────────────────────────

const Profile = () => {
  const [user, setUser] = useState<UserInfo | null>(null);

  if (!user) {
    return <LoginForm onSuccess={setUser} />;
  }

  return <ProfileView user={user} onLogout={() => setUser(null)} />;
};

export default Profile;
