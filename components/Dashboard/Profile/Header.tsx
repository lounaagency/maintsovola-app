import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

interface UserProfile {
  photo_profil?: string;
  nom: string;
  prenoms?: string;
  nom_role?: string;
  bio?: string;
  adresse?: string;
  telephone?: string;
  email: string;
}

export default function ProfileHeader({
  profile,
  isCurrentUser,
  isFollowing,
  followersCount,
  followingCount,
  projectsCount,
  onFollowToggle
}: {
  profile: UserProfile;
  isCurrentUser: boolean;
  isFollowing: boolean;
  followersCount: number;
  followingCount: number;
  projectsCount: number;
  onFollowToggle: () => void;
}) {
  return (
    <View className="p-4">
      <View className="flex-col items-start">
        {/* Avatar */}
        <View className="mr-4">
          {profile.photo_profil ? (
            <Image
              source={{ uri: profile.photo_profil }}
              className="w-24 h-24 rounded-full border-2 border-gray-200"
              accessibilityLabel="Photo de profil"
            />
          ) : (
            <View className="w-24 h-24 rounded-full bg-gray-100 justify-center items-center">
              <Ionicons name="person" size={48} color="gray" />
            </View>
          )}
        </View>

        {/* Infos profil */}
        <View className="">
          <View className="flex-row items-center mb-1">
            <Text className="text-2xl font-bold mr-2">
              {`${profile.nom} ${profile.prenoms || ''}`}
            </Text>
            {profile.nom_role && (
              <View className="bg-gray-100 rounded-full px-2 py-0.5">
                <Text className="text-xs">
                  {profile.nom_role.charAt(0).toUpperCase() + profile.nom_role.slice(1)}
                </Text>
              </View>
            )}
          </View>

          {profile.bio && (
            <Text className="text-gray-500 mb-2">{profile.bio}</Text>
          )}

          <View className="flex-row flex-wrap gap-x-4 gap-y-2 mb-3">
            <View className="flex-row items-center">
              <Feather name="map-pin" size={14} color="gray" />
              <Text className="text-gray-500 text-sm ml-1">
                {profile.adresse || 'Non renseigné'}
              </Text>
            </View>

            {profile.telephone && (
              <View className="flex-row items-center">
                <Feather name="phone" size={14} color="gray" />
                <Text className="text-gray-500 text-sm ml-1">
                  {profile.telephone}
                </Text>
              </View>
            )}

            <View className="flex-row items-center">
              <Feather name="mail" size={14} color="gray" />
              <Text className="text-gray-500 text-sm ml-1">
                {profile.email}
              </Text>
            </View>
          </View>

          <View className="flex-row gap-4">
            <View className="items-center">
              <Text className="font-semibold">{projectsCount}</Text>
              <Text className="text-gray-500 text-xs">Projets</Text>
            </View>
            <View className="items-center">
              <Text className="font-semibold">{followersCount}</Text>
              <Text className="text-gray-500 text-xs">Abonnés</Text>
            </View>
            <View className="items-center">
              <Text className="font-semibold">{followingCount}</Text>
              <Text className="text-gray-500 text-xs">Abonnements</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View className="flex-row gap-3 mt-4">
        {isCurrentUser ? (
          <TouchableOpacity className="flex-1 flex-row items-center justify-center py-2 border border-gray-300 rounded-lg">
            <Feather name="edit" size={16} color="black" />
            <Text className="font-bold ml-2">Modifier</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              className={`flex-1 flex-row items-center justify-center py-2 rounded-lg ${
                isFollowing ? 'border border-gray-300' : 'bg-black'
              }`}
              onPress={onFollowToggle}
            >
              <Feather
                name="users"
                size={16}
                color={isFollowing ? 'black' : 'white'}
              />
              <Text className={`font-bold ml-2 ${
                isFollowing ? 'text-black' : 'text-white'
              }`}>
                {isFollowing ? 'Abonné' : 'Suivre'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 flex-row items-center justify-center py-2 border border-gray-300 rounded-lg">
              <Feather name="mail" size={16} color="black" />
              <Text className="font-bold ml-2">Message</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}