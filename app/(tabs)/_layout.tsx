import { Slot } from 'expo-router';
import { View } from 'react-native';
import {KeyboardAvoidingView} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useState } from 'react';
import Header from '../../components/navigation/Header';
import Navbar from '../../components/navigation/Navbar';

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