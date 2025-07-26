import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface ProfilePopupProps {
  visible: boolean;
  onClose: () => void;
}

const ProfilePopup: React.FC<ProfilePopupProps> = ({ visible, onClose }) => {
  const router = useRouter();

  const handleProfilePress = () => {
    onClose();
    router.push('/profil');
  };

  const handleSettingsPress = () => {
    onClose();
    console.log('Navigation vers réglages');
  };

  const handleLogoutPress = () => {
    onClose();
    console.log('Déconnexion');
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/50 justify-center items-center">
          <TouchableWithoutFeedback>
            <View className="bg-white rounded-xl shadow-lg w-50 absolute top-30 right-5">
              <TouchableOpacity
                className="flex-row items-center p-4 border-b border-gray-100"
                onPress={handleProfilePress}
              >
                <MaterialIcons name="person" size={20} color="#333333" />
                <Text className="text-gray-800 ml-3">Mon Profil</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center p-4 border-b border-gray-100"
                onPress={handleSettingsPress}
              >
                <MaterialIcons name="settings" size={20} color="#333333" />
                <Text className="text-gray-800 ml-3">Réglages</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center p-4"
                onPress={handleLogoutPress}
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
};

export default ProfilePopup;

