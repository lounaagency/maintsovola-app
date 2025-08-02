import React from 'react';
import { Stack } from 'expo-router';
import NotifScreen from '~/components/Notif/NotifScreen';

export default function NotificationsPage() {
  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Notifications',
          headerShown: false, // Le composant gère son propre header
        }} 
      />
      <NotifScreen />
    </>
  );
};