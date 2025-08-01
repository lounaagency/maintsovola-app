"use client";
import React, { } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  // TextInput,
} from 'react-native';
import {  Utilisateur } from "~/type/messageInterface";
interface RenderUsersProps {
  item: Utilisateur;
  onPress: (Utilisateur: Utilisateur) => void;
}

const RenderUsers: React.FC<RenderUsersProps> = ({ item, onPress }) => {

      
  return (
    <>
    <TouchableOpacity
      onPress={() => onPress(item)}
      className="flex-row items-center p-4 border-b border-gray-100"
    >
      <Image
        source={{ uri: `https://ui-avatars.com/api/?name=${item.id_utilisateur}` }}
        className="w-12 h-12 rounded-full mr-4"
      />
      <View className="flex-1">
        <Image 
            source={{ uri: `https://ui-avatars.com/api/?name=${item.nom}+${item.prenoms}` }}
        className="w-12 h-12 rounded-full mr-4"
        />

        <Text className="text-base font-semibold text-gray-900">
          {item.nom} {item.prenoms}
        </Text>
      </View>
    </TouchableOpacity>
    </>
  );
};

export default RenderUsers;
