import { Stack } from 'expo-router';

import { StyleSheet, View } from 'react-native';

import { ScreenContent } from '@/components/ScreenContent';

export default function Home() {
  const handleLike = (projectId: string) => {
    console.log('Liked project:', projectId);
  };

  const handleComment = (projectId: string) => {
    console.log('Comment on project:', projectId);
  };

  const handleShare = (projectId: string) => {
    Alert.alert('Partage', `Partager le projet ${projectId}`);
  };

  const handleInvest = (projectId: string) => {
    Alert.alert('Investissement', `Investir dans le projet ${projectId}`);
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Projets Agricoles' }} />
      <View style={styles.container}></View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
