import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface NavProfileItemProps {
  id: string;
  isActive: boolean;
  onPress: (id: string) => void;
}

const NavProfileItem: React.FC<NavProfileItemProps> = ({ id, isActive, onPress }) => {
  return (
    <TouchableOpacity
      key={id}
      className={`p-2 rounded-lg items-center ${isActive ? 'bg-green-50' : ''}`}
      onPress={() => onPress(id)}
    >
      <View className="items-center">
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
    </TouchableOpacity>
  );
};

export default NavProfileItem;

