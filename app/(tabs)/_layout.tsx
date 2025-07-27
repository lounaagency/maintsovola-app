import { Stack } from 'expo-router';

export default function TabLayout() {
  return (
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="feed/index" />
          <Stack.Screen name="terrain/index" />
          <Stack.Screen name="projet/index" />
          <Stack.Screen name="notification/index" />
          <Stack.Screen name="messages/index" />
          <Stack.Screen name="profil/index" />
        </Stack>
  );
}
