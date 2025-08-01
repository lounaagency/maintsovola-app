import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import ChatScreen from '~/components/messenger/ChatScreen';
import { useAuth } from '~/contexts/AuthContext';
import { SupabaseMessageService } from '~/services/supabase-service';
import { Conversation } from '../../../../types/message_types';

export default function ChatPage() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversation = async () => {
      if (!user?.id || !id) {
        setError('Utilisateur non connecté ou ID de conversation manquant.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const messageService = new SupabaseMessageService(user.id);
        const fetchedConversation = await messageService.getConversationById(id as string);
        if (fetchedConversation) {
          setConversation(fetchedConversation);
        } else {
          setError('Conversation non trouvée.');
        }
      } catch (err) {
        console.error('Erreur lors du chargement de la conversation:', err);
        setError('Erreur lors du chargement de la conversation.');
      } finally {
        setLoading(false);
      }
    };

    fetchConversation();
  }, [id, user]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text className="text-gray-500 mt-4">Chargement de la conversation...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500 text-lg">Erreur: {error}</Text>
      </View>
    );
  }

  if (!conversation) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-500">Conversation non trouvée</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <ChatScreen conversation={conversation} currentUserId={user?.id || ''} />
    </View>
  );
}