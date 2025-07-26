import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialIcons, FontAwesome, Feather } from '@expo/vector-icons';
// Composant ProfileHeader avec NativeWind
const ProfileHeader = ({
  profile,
  isCurrentUser,
  isFollowing,
  followersCount,
  followingCount,
  projectsCount,
  onFollowToggle
}) => {
  const navigation = useNavigation();

  return (
    <View className="p-4 flex flex-row flex-wrap items-start">
      <View className="mr-4">
        {profile.photo_profil ? (
          <Image 
            source={{ uri: profile.photo_profil  }} 
            className="w-24 h-24 rounded-full border-2 border-gray-200"
          />
        ) : (
          <Ionicons name="person" size={96} color="gray" />
        )}
      </View>
      
      <View className="flex-1 min-w-[200px]">
        <View className="flex flex-row items-center mb-1">
          <Text className="text-2xl font-bold mr-2">
            {`${profile.nom} ${profile.prenoms || ''}`}
          </Text>
          
          <View className="bg-gray-100 rounded-full px-2 py-0.5">
            <Text className="text-xs">
              {profile.nom_role?.charAt(0).toUpperCase() + profile.nom_role?.slice(1)}
            </Text>
          </View>
        </View>
        
        {profile.bio && (
          <Text className="text-gray-500 mb-2">{profile.bio}</Text>
        )}
        
        <View className="flex flex-row flex-wrap gap-4 mb-3">
          <View className="flex flex-row items-center">
            <Feather name="map-pin" size={16} color="gray" />
            <Text className="text-gray-500 text-sm ml-1">
              {profile.adresse || 'Aucune adresse'}
            </Text>
          </View>
          
          {profile.telephone && (
            <View className="flex flex-row items-center">
              <Feather name="phone" size={16} color="gray" />
              <Text className="text-gray-500 text-sm ml-1">
                {profile.telephone}
              </Text>
            </View>
          )}
          
          <View className="flex flex-row items-center">
            <Feather name="mail" size={16} color="gray" />
            <Text className="text-gray-500 text-sm ml-1">
              {profile.email}
            </Text>
          </View>
        </View>
        
        <View className="flex flex-row gap-4 mb-3">
          <View className="flex flex-row items-center gap-1">
            <Text className="font-semibold">{projectsCount}</Text>
            <Text className="text-gray-500 text-sm">projets</Text>
          </View>
          
          <View className="flex flex-row items-center gap-1">
            <Text className="font-semibold">{followersCount}</Text>
            <Text className="text-gray-500 text-sm">abonnés</Text>
          </View>
          
          <View className="flex flex-row items-center gap-1">
            <Text className="font-semibold">{followingCount}</Text>
            <Text className="text-gray-500 text-sm">abonnements</Text>
          </View>
        </View>
      </View>
      
      <View className="w-full flex flex-row gap-2 mt-3">
        {isCurrentUser ? (
          <TouchableOpacity 
            className="flex-1 flex flex-row items-center justify-center py-2 px-3 border border-gray-300 rounded-lg"
            // onPress={() => navigation.navigate('Settings')}
          >
            <Feather name="edit" size={16} color="black" />
            <Text className="font-bold ml-2">Modifier profil</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity 
              className={`flex-1 flex flex-row items-center justify-center py-2 px-3 rounded-lg ${
                isFollowing ? 'border border-gray-300' : 'bg-black'
              }`}
              onPress={onFollowToggle}
            >
              <Feather name="users" size={16} color={isFollowing ? 'black' : 'white'} />
              <Text className={`font-bold ml-2 ${
                isFollowing ? 'text-black' : 'text-white'
              }`}>
                {isFollowing ? 'Abonné' : 'Suivre'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 flex flex-row items-center justify-center py-2 px-3 border border-gray-300 rounded-lg">
              <Feather name="mail" size={16} color="black" />
              <Text className="font-bold ml-2">Message</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

// Composants pour les onglets
function InvestissementScreen() {
  return <View className="flex-1 justify-center items-center"><Text>Investissement</Text></View>;
}

function ProjetsScreen() {
  return <View className="flex-1 justify-center items-center"><Text>Projets</Text></View>;
}

function PaiementScreen() {
  return <View className="flex-1 justify-center items-center"><Text>Paiement</Text></View>;
}

function ActiviteScreen() {
  return <View className="flex-1 justify-center items-center"><Text>Activité</Text></View>;
}

const Tab = createMaterialTopTabNavigator();

export default function ProfileLayout() {
  // Données exemple
  const profileData = {
    photo_profil: 'https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI=',
    nom: 'Doe',
    prenoms: 'John',
    nom_role: 'investisseur',
    bio: 'Passionné par les startups innovantes',
    adresse: 'Paris, France',
    telephone: '+33 6 12 34 56 78',
    email: 'john.doe@example.com'
  };

  const isCurrentUser = true;
  const isFollowing = false;
  const followersCount = 124;
  const followingCount = 56;
  const projectsCount = 8;

  const handleFollowToggle = async () => {
    // Logique de suivi
  };

  return (
    <View className="flex-1 bg-white">
      {/* En-tête du profil */}
      <ProfileHeader
        profile={profileData}
        isCurrentUser={isCurrentUser}
        isFollowing={isFollowing}
        followersCount={followersCount}
        followingCount={followingCount}
        projectsCount={projectsCount}
        onFollowToggle={handleFollowToggle}
      />
      
      {/* Onglets de navigation */}
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#000',
          tabBarInactiveTintColor: 'gray',
          tabBarIndicatorStyle: { backgroundColor: '#000' },
          tabBarLabelStyle: { fontSize: 14, fontWeight: 'bold' },
          tabBarStyle: { backgroundColor: 'white' },
        }}
      >
        <Tab.Screen 
          name="Investissement" 
          component={InvestissementScreen}
          options={{
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="attach-money" size={24} color={color} />
            ),
          }}
        />
        <Tab.Screen 
          name="Projets" 
          component={ProjetsScreen}
          options={{
            tabBarIcon: ({ color }) => (
              <FontAwesome name="briefcase" size={24} color={color} />
            ),
          }}
        />
        <Tab.Screen 
          name="Paiement" 
          component={PaiementScreen}
          options={{
            tabBarIcon: ({ color }) => (
              <FontAwesome name="credit-card" size={24} color={color} />
            ),
          }}
        />
        <Tab.Screen 
          name="Activité" 
          component={ActiviteScreen}
          options={{
            tabBarIcon: ({ color }) => (
              <Feather name="activity" size={24} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </View>
  );
}