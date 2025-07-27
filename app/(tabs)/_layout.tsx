import { Slot } from 'expo-router';
import { View, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Navbar from '../../components/navigation/Navbar';
import Header from '../../components/navigation/Header';
import React, { useState } from 'react';

export default function TabsLayout() {
  const [activeNavIcon, setActiveNavIcon] = useState('home');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }} edges={['top', 'bottom']}>
        <View style={{ flex: 1 }}>
        <Header />
        <Navbar activeNavIcon={activeNavIcon} onNavChange={setActiveNavIcon} />
          <Slot />
        </View>
    </SafeAreaView>
  );
}
