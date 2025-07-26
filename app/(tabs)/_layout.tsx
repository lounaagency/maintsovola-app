import { Stack } from 'expo-router';
import { View } from 'react-native';
import ProfileHeader from '~/components/Dashboard/Profile/Header';
import ProfileTabs from '~/components/Dashboard/Profile/Tabs';

export default function UserLayout() {
  // const navigation = useNavigation();

  // Données exemple - à remplacer par vos données réelles
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

  const handleFollowToggle = async () => {
    console.log('Toggle follow state');
    // Implémentez votre logique de suivi ici
  };

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      
      <ProfileHeader
        profile={profileData}
        isCurrentUser={true}
        isFollowing={false}
        followersCount={124}
        followingCount={56}
        projectsCount={8}
        onFollowToggle={handleFollowToggle}
      />
      
      <ProfileTabs />
    </View>
  );
}