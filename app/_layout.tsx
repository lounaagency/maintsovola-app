// _layout.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  TouchableOpacity,
  StatusBar
} from 'react-native';
import { Slot } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Navbar from '../components/navigation/Navbar';
import "../global.css";

const RootLayout: React.FC = () => {
  const [activeNavIcon, setActiveNavIcon] = useState<string>('home');

  // Fonction de callback pour les changements de navigation
  const handleNavChange = (navId: string) => {
    setActiveNavIcon(navId);
    console.log('Navigation changée vers:', navId);
    
    // Vous pouvez ajouter ici une logique spécifique selon la navigation
    switch(navId) {
      case 'home':
        console.log('Affichage de la page d\'accueil');
        break;
      case 'location':
        console.log('Affichage de la carte/localisation');
        break;
      case 'documents':
        console.log('Affichage des documents');
        break;
      case 'messages':
        console.log('Affichage des messages');
        break;
      case 'notifications':
        console.log('Ouverture des notifications');
        break;
      case 'profile':
        console.log('Ouverture du profil');
        break;
      case 'wifi':
        console.log('Vérification de la connexion');
        break;
      case 'menu':
        console.log('Ouverture du menu');
        break;
      default:
        console.log('Navigation inconnue:', navId);
    }
  };

  // Fonction pour simuler l'actualisation des données
  const refreshData = () => {
    console.log('Actualisation des données...');
    // Ici vous pourriez déclencher une actualisation des données
    // Par exemple, recharger les notifications, messages, etc.
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Navbar 
        activeNavIcon={activeNavIcon}
        onNavChange={handleNavChange}
      />

      <View className="flex-1 bg-gray-50">
        <Slot />
      </View>
    </SafeAreaView>
  );
};

export default RootLayout;