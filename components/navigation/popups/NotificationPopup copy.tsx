import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  isNew: boolean;
  route?: string;
}

interface NotificationPopupProps {
  visible: boolean;
  onClose: () => void;
  notifications: Notification[];
  notificationCount: number;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  handleNotificationClick: (notification: Notification) => void;
}

const { width: screenWidth } = Dimensions.get('window');

const NotificationPopup: React.FC<NotificationPopupProps> = ({
  visible,
  onClose,
  notifications,
  notificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  handleNotificationClick,
}) => (
  <Modal
    visible={visible}
    transparent={true}
    animationType="fade"
    onRequestClose={onClose}
  >
    <TouchableWithoutFeedback onPress={onClose}>
      <View className="flex-1 bg-black/50 justify-center items-center">
        <TouchableWithoutFeedback>
          <View
            className="bg-white rounded-xl shadow-lg absolute top-30 right-5"
            style={{ width: screenWidth * 0.9, maxHeight: 400 }}
          >
            {/* Header */}
            <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
              <Text className="text-lg font-bold text-gray-800">Notifications</Text>
              <TouchableOpacity onPress={onClose}>
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
                  <TouchableOpacity
                    key={notification.id}
                    className="flex-row p-4 border-b border-gray-100"
                    onPress={() => handleNotificationClick(notification)}
                  >
                    <View className="mr-3 pt-1">
                      <View className={`w-2 h-2 rounded-full ${
                        notification.isNew ? 'bg-blue-500' : 'bg-gray-300'
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
                        onPress={(e) => {
                          e.stopPropagation();
                          markNotificationAsRead(notification.id);
                        }}
                      >
                        <MaterialIcons name="done" size={16} color="#4CAF50" />
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  </Modal>
); 

export default NotificationPopup;

