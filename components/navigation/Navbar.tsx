// components/Navbar.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
  TouchableWithoutFeedback,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import NotificationPopup from './popups/NotificationPopup';
import ProfilePopup from './popups/ProfilePopup';
import NavIconItem from './items/NavIconItem';
import NavTextItem from './items/NavTextItem';
import NavProfileItem from './items/NavProfileItem';
import { NavItem, Notification, Message, NavbarProps } from './types';

const { width: screenWidth } = Dimensions.get('window');

const Navbar: React.FC<NavbarProps> = ({ 
  activeNavIcon = 'home', 
  onNavChange
}) => {
  const [currentActiveIcon, setCurrentActiveIcon] = useState<string>(activeNavIcon);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showProfile, setShowProfile] = useState<boolean>(false);
  
  const router = useRouter();

  // Données simulées pour les notifications
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Nouveau terrain',
      description: 'Un nouveau terrain "misa" a été ajouté en attente de validation',
      time: 'il y a 7 heures',
      isNew: true,
      route: '/terrain/123' // Exemple de route
    },
    {
      id: '2',
      title: 'Nouveau terrain',
      description: 'Un nouveau terrain "Fonenana Clément manova 1" a été ajouté en attente de validation',
      time: 'il y a 1 mois',
      isNew: true,
      route: '/terrain/456' // Exemple de route
    },
    {
      id: '3',
      title: 'Nouveau terrain',
      description: 'Un nouveau terrain "test" a été ajouté en attente de validation',
      time: 'il y a 1 mois',
      isNew: true,
      route: '/terrain/789' // Exemple de route
    },
    {
      id: '4',
      title: 'Validation terminée',
      description: 'Votre terrain "Parcelle 123" a été validé avec succès',
      time: 'il y a 2 jours',
      isNew: false,
      route: '/terrain/123' // Exemple de route
    },
    {
      id: '5',
      title: 'Mise à jour système',
      description: 'Une nouvelle version de l\'application est disponible',
      time: 'il y a 3 jours',
      isNew: false,
      route: '/settings' // Exemple de route
    }
  ]);

  // Données simulées pour les messages
  const [messages] = useState<Message[]>([
    {
      id: '1',
      sender: 'Admin',
      content: 'Votre terrain a été validé',
      time: 'il y a 2 heures',
      isNew: true
    },
    {
      id: '2',
      sender: 'Support',
      content: 'Bienvenue sur Maintso Vola',
      time: 'il y a 1 jour',
      isNew: true
    },
    {
      id: '3',
      sender: 'Système',
      content: 'Maintenance programmée ce soir',
      time: 'il y a 2 jours',
      isNew: false
    }
  ]);

  const navItems: NavItem[] = [
    { name: 'M', type: 'text', id: 'menu' },
    // { name: 'wifi', type: 'icon', id: 'wifi' },
    { name: 'home', type: 'icon', id: 'home' },
    { name: 'terrain', type: 'icon', id: 'location' },
    { name: 'description', type: 'icon', id: 'projet' },
    { name: 'chat', type: 'icon', id: 'messages' },
    { name: 'notifications', type: 'icon', id: 'notifications' },
    { name: 'RANALISOLOFO...', type: 'profile', id: 'profile' },
  ];

  // Compteurs dynamiques
  const notificationCount = notifications.filter(n => n.isNew).length;
  const messageCount = messages.filter(m => m.isNew).length;

  const handleNavIconPress = (iconId: string): void => {
    setCurrentActiveIcon(iconId);
    onNavChange?.(iconId);
    
    switch(iconId) {
      case 'home':
        router.push('/feed');
        break;
      case 'profil':
        router.push('/profil');
        // setShowProfile(true);
        break;
      case 'messages':
        // Vous pouvez soit ouvrir un popup soit naviguer
        router.push('/messages');
        console.log('Ouvrir les messages');
        break;
      case 'notifications':
        setShowNotifications(true);
        break;
      case 'location':
        router.push('/terrain');
        console.log('Navigation vers location');
        break;
      case 'projet':
        router.push('/projet');
        console.log('Navigation vers projet');
        break;
      case 'menu':
        console.log('Action menu');
        break;
      default:
        console.log('Navigation vers:', iconId);
    }
  };

  // Fonction pour gérer le clic sur une notification
  const handleNotificationClick = (notification: Notification) => {
    // Marquer la notification comme lue
    markNotificationAsRead(notification.id);
    
    // Fermer le popup de notifications
    setShowNotifications(false);
    
    // Naviguer vers la route spécifiée
    if (notification.route) {
      router.push(notification.route);
    }
  };

  // Fonction pour marquer une notification comme lue
  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isNew: false }
          : notification
      )
    );
  };

  // Fonction pour marquer toutes les notifications comme lues
  const markAllNotificationsAsRead = () => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => ({
        ...notification,
        isNew: false
      }))
    );
  };

  const renderBadge = (count: number) => {
    if (count === 0) return null;
    
    return (
      <View className="absolute -top-2 -right-2 bg-red-500 rounded-full min-w-5 h-5 justify-center items-center border-2 border-white">
        <Text className="text-white text-xs font-bold">
          {count > 9 ? '9+' : count.toString()}
        </Text>
      </View>
    );
  };



  return (
    <>
      {/* Barre de navigation */}
      <View className="flex-row justify-between items-center px-4 py-3 bg-white border-b border-gray-200 shadow-sm">
        {navItems.map((item) => {
          const isActive = currentActiveIcon === item.id || (item.type === 'profile' && currentActiveIcon === 'profil');
          switch (item.type) {
            case 'text':
              return (
                <NavTextItem
                  key={item.id}
                  id={item.id}
                  isActive={isActive}
                  onPress={handleNavIconPress}
                />
              );
            case 'icon':
              return (
                <NavIconItem
                  key={item.id}
                  name={item.name}
                  id={item.id}
                  isActive={isActive}
                  onPress={handleNavIconPress}
                  notificationCount={item.id === 'notifications' ? notificationCount : 0}
                  messageCount={item.id === 'messages' ? messageCount : 0}
                />
              );
            case 'profile':
              return (
                <NavProfileItem
                  key={item.id}
                  id={item.id}
                  isActive={isActive}
                  onPress={handleNavIconPress}
                />
              );
            default:
              return null;
          }
        })}
      </View>

      <NotificationPopup
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        notificationCount={notificationCount}
        markNotificationAsRead={markNotificationAsRead}
        markAllNotificationsAsRead={markAllNotificationsAsRead}
        handleNotificationClick={handleNotificationClick}
      />
      <ProfilePopup
        visible={showProfile}
        onClose={() => setShowProfile(false)}
      />
    </>
  );
};

export default Navbar;