import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface NavIconItemProps {
  name: string;
  id: string;
  isActive: boolean;
  onPress: (id: string) => void;
  notificationCount?: number;
  messageCount?: number;
}

const NavIconItem: React.FC<NavIconItemProps> = ({
  name,
  id,
  isActive,
  onPress,
  notificationCount = 0,
  messageCount = 0,
}) => {
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
    <TouchableOpacity
      key={id}
      className={`p-2 rounded-lg items-center ${isActive ? 'bg-green-50' : ''}`}
      onPress={() => onPress(id)}
    >
      <View className="relative">
        <MaterialIcons
          name={name as any}
          size={24}
          color={isActive ? '#4CAF50' : '#666666'}
        />
        {id === 'notifications' && renderBadge(notificationCount)}
        {id === 'messages' && renderBadge(messageCount)}
      </View>
    </TouchableOpacity>
  );
};

export default NavIconItem;


