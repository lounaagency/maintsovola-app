import React from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import ChatScreen from '~/components/messaging/ChatScreen';
import { staticConversations } from '~/components/messaging/message_types';
import { useAuth } from '~/contexts/AuthContext';

export default function ChatPage() {

  const { id } = useLocalSearchParams();
  
  // Trouver la conversation correspondante
  const conversation = staticConversations.find(conv => conv.id === id);

  const user = useAuth().user;

  if (!conversation) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-500">Conversation non trouvée</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <ChatScreen conversation={conversation} />
    </View>
  );
}

