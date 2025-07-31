"use client";
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Utilisateur } from "~/type/messageInterface";

interface RenderUsersProps {
  item: Utilisateur;
  onPress: (Utilisateur: Utilisateur) => void;
}

const RenderUsers: React.FC<RenderUsersProps> = ({ item, onPress }) => {
  return (
    <TouchableOpacity
      onPress={() => onPress(item)}
      className="flex-row items-center px-4 py-3 bg-white active:bg-gray-50"
      activeOpacity={0.7}
    >
      {/* Avatar */}
      <View className="relative">
        <Image
          source={{ 
            uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(item.nom + ' ' + item.prenoms)}&background=25D366&color=fff&size=128&font-size=0.5&bold=true`
          }}
          className="w-14 h-14 rounded-full"
        />
        {/* Indicateur en ligne (optionnel) */}
        {/* <View className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white" /> */}
      </View>

      {/* Contenu principal */}
      <View className="flex-1 ml-4 border-b border-gray-100 pb-3">
        <View className="flex-row items-center justify-between">
          {/* Nom complet */}
          <View className="flex-1">
            <Text className="text-base font-medium text-gray-900 mb-1" numberOfLines={1}>
              {item.nom} {item.prenoms}
            </Text>
            
            {/* Email ou statut */}
            <Text className="text-sm text-gray-500" numberOfLines={1}>
              {item.email || "Disponible"}
            </Text>
          </View>

          {/* Icône ou badge (optionnel) */}
          <View className="ml-2">
            <View className="w-2 h-2 bg-gray-300 rounded-full" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default RenderUsers;