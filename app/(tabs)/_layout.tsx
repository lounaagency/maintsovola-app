// app/(tabs)/_layout.tsx
import { Slot } from 'expo-router';
import { SafeAreaView, View } from 'react-native';
import Navbar from '~/components/navigation/Navbar';
import React, { useState } from 'react';
import Header from '~/components/navigation/Header';

export default function TabsLayout() {
  const [activeNavIcon, setActiveNavIcon] = useState('home');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <Header />
      <Navbar activeNavIcon={activeNavIcon} onNavChange={setActiveNavIcon} />
      <View style={{ flex: 1 }}>
        <Slot />
      </View>
    </SafeAreaView>
  );
}
