"use client";
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Conversation } from "~/type/messageInterface";
import { useAuth } from '~/contexts/AuthContext';
import { getUsername } from '~/services/conversation-message-service'; // Assuming you have a utility to get user names
interface RenderConversationProps {
  item: Conversation;
  onPress: (conversation: Conversation) => void;
}

const RenderConversation: React.FC<RenderConversationProps> = ({ item, onPress }) => {
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const otherUserId = item.id_utilisateur1 === userId ? item.id_utilisateur2 : item.id_utilisateur1;
  const [otherUsername, setOtherUsername] = useState<string>('Utilisateur');

  useEffect(() => {
    const fetchUsername = async () => {
      const username = await getUsername({ id: otherUserId });
      setOtherUsername(username);
      console.log("Fetched username:", JSON.stringify(username,null, 2));
      if (!username) {
        console.warn("Username not found for user ID:", otherUserId);
      }
    };

    fetchUsername();
  }, [otherUserId]);

  return (
    <TouchableOpacity
      onPress={() => onPress(item)}
      className="flex-row items-center p-4 border-b border-gray-100"
    >
      <Image
        source={{ uri: `https://ui-avatars.com/api/?name=${otherUserId}` }}
        className="w-12 h-12 rounded-full mr-4"
      />
      <View className="flex-1">
        <Text className="text-base font-semibold text-gray-900">
          {otherUsername}
          CONV {item.id_conversation.toString()}

        </Text>
        <Text className="text-sm text-gray-500">
          Dernière activité : {new Date(item.derniere_activite).toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default RenderConversation;
