import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';

interface NavTextItemProps {
  id: string;
  isActive: boolean;
  onPress: (id: string) => void;
}

const NavTextItem: React.FC<NavTextItemProps> = ({ id, isActive, onPress }) => {
  return (
    <TouchableOpacity
      key={id}
      className={`p-2 rounded-lg items-center ${isActive ? 'bg-green-50' : ''}`}
      onPress={() => onPress(id)}
    >
      <View className="w-8 h-8 rounded-full justify-center items-center">
        <Image
          source={require('../../../assets/maintsovola_logo_pm.png')}
          style={{ width: 45, height: 45, borderRadius: 22.5 }}
        />
      </View>
    </TouchableOpacity>
  );
};

export default NavTextItem;

