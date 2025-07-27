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

interface NavItem {
  name: string;
  type: 'text' | 'icon' | 'profile';
  id: string;
}

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  isNew: boolean;
}

interface Message {
  id: string;
  sender: string;
  content: string;
  time: string;
  isNew: boolean;
}

interface NavbarProps {
  activeNavIcon?: string;
  onNavChange?: (navId: string) => void;
}

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
      isNew: true
    },
    {
      id: '2',
      title: 'Nouveau terrain',
      description: 'Un nouveau terrain "Fonenana Clément manova 1" a été ajouté en attente de validation',
      time: 'il y a 1 mois',
      isNew: true
    },
    {
      id: '3',
      title: 'Nouveau terrain',
      description: 'Un nouveau terrain "test" a été ajouté en attente de validation',
      time: 'il y a 1 mois',
      isNew: true
    },
    {
      id: '4',
      title: 'Validation terminée',
      description: 'Votre terrain "Parcelle 123" a été validé avec succès',
      time: 'il y a 2 jours',
      isNew: false
    },
    {
      id: '5',
      title: 'Mise à jour système',
      description: 'Une nouvelle version de l\'application est disponible',
      time: 'il y a 3 jours',
      isNew: false
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
    { name: 'location-on', type: 'icon', id: 'location' },
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
      case 'M':
        router.push('/feed');
        break;
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

const renderNavIcon = (item: NavItem) => {
  const isActive = currentActiveIcon === item.id || (item.type === 'profile' && currentActiveIcon === 'profil');

  const isLogo = item.id === 'menu';

  return (
    <View className='flex-1 w-full min-h-fit pt-2  pb-6 flex-col gap-3 justify-between relative items-start'>
    <View
      key={item.id}
      className={`flex-1 items-center bg-red-200 justify-center ${isLogo ? 'z-50 -mt-4' : ''}`}
      style={isLogo ? { position: 'relative' } : {}}
    >
      <TouchableOpacity
        className={`p-2 rounded-lg relative ${isActive ? 'bg-green-50' : ''}`}
        onPress={() => handleNavIconPress(item.id)}
      >
        {item.type === 'text' && (
          <View className="w-12 h-12 rounded-full justify-center items-center bg-white shadow-md">
            <Image
              source={require('../../assets/maintsovola_logo_pm.png')}
              style={{ width: 45, height: 45, borderRadius: 22.5 }}
            />
          </View>
        )}
      </TouchableOpacity>
    </View>
    
    {isLogo === false && (
      <View className='flex-1 flex-col items-start bg-violet-200 justify-start relative '>
      <TouchableOpacity
          key={item.id}
          className={`p-2 rounded-lg items-start ${isActive ? 'bg-green-50' : ''}`}
          onPress={() => handleNavIconPress(item.id)}
        >
            {item.type === 'icon' && (
              <View className="flex justify-start items-end flex-1 rounded-full p-1">
                <MaterialIcons 
                  name={item.name as any} 
                  size={24} 
                  color={isActive ? '#4CAF50' : '#666666'} 
                />
                {item.id === 'notifications' && renderBadge(notificationCount)}
                {item.id === 'messages' && renderBadge(messageCount)}
              </View>
            )}
            
            {item.type === 'profile' && (
              <View className=" rounded-full p-1 mb-5 items-start">
                <View className={`w-8 h-8 rounded-full justify-center items-center ${
                  isActive ? 'bg-green-500' : 'bg-gray-300'
                }`}>
                  <MaterialIcons 
                    name="person" 
                    size={20} 
                    color={isActive ? '#FFFFFF' : '#666666'} 
                  />
                </View>
                <Text className={`text-xs mt-1 max-w-15 ${
                  isActive ? 'text-green-500' : 'text-gray-600'
                }`} numberOfLines={1}>
                </Text>
              </View>
            )}
          </TouchableOpacity>
    </View>)}
    </View>
  );
};

const NotificationPopup = () => (
    <Modal
      visible={showNotifications}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowNotifications(false)}
    >
      <TouchableWithoutFeedback onPress={() => setShowNotifications(false)}>
        <View className="flex-1 bg-black/50 justify-center items-center">
          <TouchableWithoutFeedback>
            <View 
              className="bg-white rounded-xl shadow-lg absolute top-30 right-5"
              style={{ width: screenWidth * 0.9, maxHeight: 400 }}
            >
              {/* Header */}
              <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
                <Text className="text-lg font-bold text-gray-800">Notifications</Text>
                <TouchableOpacity onPress={() => setShowNotifications(false)}>
                  <MaterialIcons name="close" size={24} color="#666666" />
                </TouchableOpacity>
              </View>
              
              {/* Bouton "Marquer tout comme lu" */}
              {notificationCount > 0 && (
                <View className="px-4 py-2 border-b border-gray-200">
                  <TouchableOpacity 
                    className="flex-row items-center justify-center py-2 px-3 bg-green-50 border border-green-500 rounded-md"
                    onPress={markAllNotificationsAsRead}
                  >
                    <MaterialIcons name="done-all" size={16} color="#4CAF50" />
                    <Text className="text-green-500 ml-2 font-medium">Marquer tout comme lu</Text>
                  </TouchableOpacity>
                </View>
              )}
              
              {/* Liste des notifications */}
              <ScrollView className="max-h-72" showsVerticalScrollIndicator={true}>
                {notifications.length === 0 ? (
                  <View className="items-center justify-center py-10">
                    <MaterialIcons name="notifications-none" size={48} color="#CCCCCC" />
                    <Text className="text-gray-400 text-base mt-3">Aucune notification</Text>
                  </View>
                ) : (
                  notifications.map((notification) => (
                    <View key={notification.id} className="flex-row p-4 border-b border-gray-100">
                      <View className="mr-3 pt-1">
                        <View className={`w-2 h-2 rounded-full ${
                          notification.isNew ? 'bg-green-500' : 'bg-gray-300'
                        }`} />
                      </View>
                      <View className="flex-1">
                        <Text className={`text-sm font-semibold mb-1 ${
                          notification.isNew ? 'text-gray-800' : 'text-gray-500'
                        }`}>
                          {notification.title}
                        </Text>
                        <Text className={`text-xs leading-4 mb-1 ${
                          notification.isNew ? 'text-gray-600' : 'text-gray-400'
                        }`}>
                          {notification.description}
                        </Text>
                        <Text className="text-xs text-gray-400">{notification.time}</Text>
                      </View>
                      {notification.isNew && (
                        <TouchableOpacity 
                          className="p-1"
                          onPress={() => markNotificationAsRead(notification.id)}
                        >
                          <MaterialIcons name="done" size={16} color="#4CAF50" />
                        </TouchableOpacity>
                      )}
                    </View>
                  ))
                )}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  const ProfilePopup = () => (
    <Modal
      visible={showProfile}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowProfile(false)}
    >
      <TouchableWithoutFeedback onPress={() => setShowProfile(false)}>
        <View className="flex-1 bg-black/50 justify-center items-center">
          <TouchableWithoutFeedback>
            <View className="bg-white rounded-xl shadow-lg w-50 absolute top-30 right-5">
              <TouchableOpacity 
                className="flex-row items-center p-4 border-b border-gray-100"
                onPress={() => {
                  setShowProfile(false);
                  console.log('Navigation vers profil');
                  router.push('/profil');
                }}
              >
                <MaterialIcons name="person" size={20} color="#333333" />
                <Text className="text-gray-800 ml-3">Mon Profil</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="flex-row items-center p-4 border-b border-gray-100"
                onPress={() => {
                  setShowProfile(false);
                  console.log('Navigation vers réglages');
                }}
              >
                <MaterialIcons name="settings" size={20} color="#333333" />
                <Text className="text-gray-800 ml-3">Réglages</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="flex-row items-center p-4"
                onPress={() => {
                  setShowProfile(false);
                  console.log('Déconnexion');
                }}
              >
                <MaterialIcons name="logout" size={20} color="#FF5722" />
                <Text className="text-red-600 ml-3">Déconnexion</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  return (
    <>
      {/* Barre de navigation */}
      <View className="flex-row justify-between items-center px-4 py-3 bg-white border-b border-gray-200 shadow-sm">
        {navItems.map(renderNavIcon)}
      </View>

      <NotificationPopup />
      <ProfilePopup />
    </>
  );
};

export default Navbar;