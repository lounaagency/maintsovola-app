import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  Image,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
} from 'react-native';

// IMPORTANT: Import Animated and SharedValue from 'react-native-reanimated'
import Animated, { useAnimatedStyle, SharedValue } from 'react-native-reanimated';

// Import Tabs and the correct TabBarProps type from 'react-native-collapsible-tab-view'
// If you're using TypeScript, it's best to rely on the library's types if available.
// However, based on your specific definition, we'll use a local interface for clarity.
import { ScrollView, Tabs } from 'react-native-collapsible-tab-view';

// Tab content components (ensure these paths are correct)
import InvestissementScreen from '../profil/tabs/investissement';
import Projets from '../profil/tabs/projets';
import Paiement from '../profil/tabs/paiement';
import Activity from '../profil/tabs/activity';

// Hooks and Context (ensure these paths are correct)
import { useAuth } from '~/contexts/AuthContext';
import { useProfile, useProjectsCount, useFollowersCount, useFollowingCount } from '~/hooks/userhooks';

// Icons
import { Ionicons, Feather } from '@expo/vector-icons';

// Expo Router Stack
import { Stack } from 'expo-router';

// --- Interface Definitions ---
// User profile data structure
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

// Props for the ProfileHeader component
interface ProfileHeaderProps {
  profile: UserProfile | null;
  isCurrentUser: boolean;
  isFollowing: boolean;
  followersCount: number;
  followingCount: number;
  projectsCount: number;
  onFollowToggle: () => void;
}

// --- ProfileHeader Component ---
const ProfileHeader = ({
  profile,
  isCurrentUser,
  isFollowing,
  followersCount,
  followingCount,
  projectsCount,
  onFollowToggle,
}: ProfileHeaderProps) => {
  return (
    <View className="p-4">
      <View className="flex-col items-center">
        {/* Avatar */}
        <View className="mr-4">
          {profile?.photo_profil ? (
            <Image
              source={{ uri: profile.photo_profil }}
              className="w-24 h-24 rounded-full border-2 border-gray-200"
              accessibilityLabel="Photo de profil"
            />
          ) : (
            <View className="w-24 h-24 rounded-full bg-black-100 justify-center items-center">
              <Ionicons name="person" size={48} color="black" />
            </View>
          )}
        </View>

        {/* Profile Info */}
        <View className="m-4">
          <View className="flex-col items-center mb-4 ">
            <Text className="text-2xl font-bold text-right">
              {`${profile?.nom} ${profile?.prenoms || ''}`}
            </Text>
            {profile?.nom_role && (
              <View className="bg-black-100 rounded-full px-2 py-0.5">
                <Text className="text-xs" style={{ color: '#125b47' }}>
                  {profile.nom_role.charAt(0).toUpperCase() + profile.nom_role.slice(1)}
                </Text>
              </View>
            )}
          </View>

          {profile?.bio && (
            <Text className="text-black-500 mb-2">{profile.bio}</Text>
          )}

          <View className="flex-row flex-wrap gap-x-4 gap-y-2 mb-3">
            <View className="flex-row items-center">
              <Feather name="map-pin" size={14} color="#125b47" />
              <Text className="text-black-500 text-sm ml-1">
                {profile?.adresse || 'Non renseigné'}
              </Text>
            </View>

            {profile?.telephone && (
              <View className="flex-row items-center">
                <Feather name="phone" size={14} color="#125b47" />
                <Text className="text-black-500 text-sm ml-1">
                  {profile.telephone}
                </Text>
              </View>
            )}

            <View className="flex-row items-center">
              <Feather name="mail" size={14} color="#125b47" />
              <Text className="text-black-500 text-sm ml-1">
                {profile?.email}
              </Text>
            </View>
          </View>

          <View className="flex-row gap-4 justify-between mx-8">
            <View className="items-center">
              <Text className="font-semibold" style={{ color: '#125b47' }}>{projectsCount}</Text>
              <Text className="text-yellow-500 text-xs">Projets</Text>
            </View>
            <View className="items-center">
              <Text className="font-semibold" style={{ color: '#125b47' }}>{followersCount}</Text>
              <Text className="text-yellow-500 text-xs">Abonnés</Text>
            </View>
            <View className="items-center">
              <Text className="font-semibold" style={{ color: '#125b47' }}>{followingCount}</Text>
              <Text className="text-yellow-500 text-xs">Abonnements</Text>
            </View>
          </View>
        </View>
      </View>
      <View className="flex-row gap-3 mt-4">
        {isCurrentUser ? (
          <TouchableOpacity className="flex-1 flex-row items-center justify-center py-2 border rounded-lg" style={{ borderColor: '#125b47' }}>
            <Feather name="edit" size={16} color="#125b47" />
            <Text className="font-bold ml-2" style={{ color: '#125b47' }}>Modifier</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              className={`flex-1 flex-row items-center justify-center py-2 rounded-lg ${isFollowing ? 'border border-black-300' : 'bg-black'
                }`}
              onPress={onFollowToggle}
            >
              <Feather
                name="users"
                size={16}
                color={isFollowing ? 'black' : 'white'}
              />
              <Text className={`font-bold ml-2 ${isFollowing ? 'text-black' : 'text-white'
                }`}>
                {isFollowing ? 'Abonné' : 'Suivre'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 flex-row items-center justify-center py-2 border border-black-300 rounded-lg">
              <Feather name="mail" size={16} color="black" />
              <Text className="font-bold ml-2">Message</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

// --- CustomTabBar Props Interface (as provided by you) ---
interface CustomTabBarProps<T extends string> {
    indexDecimal: SharedValue<number>;
    focusedTab: SharedValue<T>;
    tabNames: T[];
    index: SharedValue<number>;
    containerRef: React.RefObject<any>;
    onTabPress: (name: T) => void;
    tabProps: any;
    width?: number;
}

// --- CustomTabBar Component ---
const CustomTabBar = ({
  indexDecimal,   // Smooth animated position (SharedValue)
  tabNames,       // Array of tab names/keys (e.g., ["poketra", "projets"])
  index,          // Integer index of the focused tab (SharedValue)
  onTabPress,     // Function to navigate when a tab is pressed
}: CustomTabBarProps<string>) => { // Use the CustomTabBarProps interface
  const { width } = useWindowDimensions();
  const routeWidth = width / tabNames.length;

  // Reanimated style for the sliding indicator
  const indicatorAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: indexDecimal.value * routeWidth }],
    };
  });

  // Function to get the icon based on tab name
  const getIconName = (tabName: string) => {
    switch (tabName) {
      case 'poketra':
        return 'diamond-outline';
      case 'projets':
        return 'briefcase-outline';
      case 'paiement':
        return 'card-outline';
      case 'activite':
        return 'trending-up-outline';
      default:
        return 'help-circle-outline';
    }
  };

  return (
    <View style={styles.tabBarContainer} className="bg-white flex-row items-center border-b border-gray-200">
      {/* Iterate over tabNames array directly */}
      {tabNames.map((tabName, i) => {
        // Use index.value from the SharedValue for comparison
        const isFocused = index.value === i;
        const color = isFocused ? '#125b47' : '#6b7280';
        const fontWeight = isFocused ? 'bold' : 'normal';

        // Derive label from tabName (e.g., capitalize it)
        const label = tabName.charAt(0).toUpperCase() + tabName.slice(1);

        return (
          <TouchableOpacity
            key={tabName} // Use tabName as the key
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={() => onTabPress(tabName)} // Call onTabPress with the tab's name
            style={styles.tabItem}
            className="flex-1 items-center justify-center py-4"
          >
            <Ionicons
              name={getIconName(tabName)}
              size={20}
              color={color}
            />
            <Text
              style={{ color: color, fontSize: 12, fontWeight: fontWeight, marginTop: 4 }}
              className={`text-xs uppercase`}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
      {/* Animated Indicator using reanimated */}
      <Animated.View
        className="absolute bottom-0 h-1 rounded-t-lg bg-teal-500"
        style={[
          {
            width: routeWidth,
          },
          indicatorAnimatedStyle, // Apply the reanimated style
        ]}
      />
    </View>
  );
};

// --- Main Profile Content Screen ---
export default function ProfileMainContentScreen() {
  const { user } = useAuth();
  // Ensure userId is handled if user is null or id is undefined
  const userId: string = user?.id ?? '';

  const { profile, loading } = useProfile(userId);
  const { projectsCount } = useProjectsCount(userId);
  const { followersCount } = useFollowersCount(userId);
  const { followingCount } = useFollowingCount(userId);

  // Placeholder for current user and follow state logic
  // You would typically derive these from auth context or profile data
  const isCurrentUser: boolean = user?.id === userId; // Example check
  const [isFollowing, setIsFollowing] = useState(false); // Example local state

  const handleFollowToggle = useCallback(() => {
    // Implement actual follow/unfollow logic here (API call, state update)
    console.log('Toggle follow state (functionality to be implemented)');
    setIsFollowing(prev => !prev);
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#125b47" />
        <Text style={styles.loadingText}>Chargement du profil...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Profil introuvable.</Text>
      </View>
    );
  }

  return (
    <>
      {/* Stack.Screen configuration for this route in Expo Router */}
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'User Profile', // Dynamic title possible: `profile.nom + ' ' + profile.prenoms`
          headerStyle: { backgroundColor: '#fff' },
          headerTintColor: '#000',
        }}
      />
      {/* Tabs.Container for Collapsible Tab View */}
      <Tabs.Container
        renderHeader={() => (
          <ProfileHeader
            profile={profile}
            isCurrentUser={isCurrentUser}
            isFollowing={isFollowing}
            followersCount={followersCount}
            followingCount={followingCount}
            projectsCount={projectsCount}
            onFollowToggle={handleFollowToggle}
          />
        )}
        // Correctly pass all props from Tabs.Container to CustomTabBar
        renderTabBar={(props) => <CustomTabBar {...props} />}
      >
        {/* Define your tabs with name and label */}
        <Tabs.Tab name="poketra" label="Poketra">
          <ScrollView>
            <InvestissementScreen />
          </ScrollView>
        </Tabs.Tab>
        <Tabs.Tab name="projets" label="Projets">
          <ScrollView>
            <Projets />
          </ScrollView>
        </Tabs.Tab>
        <Tabs.Tab name="paiement" label="Paiement">
          <ScrollView>
            <Paiement />
          </ScrollView>
        </Tabs.Tab>
        <Tabs.Tab name="activite" label="Activité">
          <ScrollView>
            <Activity />
          </ScrollView>
        </Tabs.Tab>
      </Tabs.Container>
    </>
  );
}

// --- StyleSheet for base styles (can be supplemented/replaced by Nativewind) ---
const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' },
  loadingText: { marginTop: 8, color: '#6b7280' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' },
  errorText: { fontSize: 18, color: 'red' },
  // Styles for the CustomTabBar
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  tabBarIndicator: {
    backgroundColor: '#125b47',
    height: 3,
    position: 'absolute',
    bottom: 0,
    borderRadius: 2,
  },
});