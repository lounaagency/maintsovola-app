"use client";
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getConversationById, getMessages, sendMessage, subscribeToMessages } from '~/services/conversation-message-service';
import { Conversation, Message, Utilisateur } from '~/type/messageInterface';
import { useAuth } from '~/contexts/AuthContext';
import { LucideArrowBigLeft } from 'lucide-react-native';
import { supabase } from '~/lib/data';

const ChatScreen = () => {
  const { id_conversation } = useLocalSearchParams();
  const { user } = useAuth();

  const parsedConvId = parseInt(id_conversation as string, 10);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [receiverId, setReceiverId] = useState<string>('');
  const [convValid, setConvValid] = useState<boolean>(true);
  const router = useRouter();
 
  const fetchMessages = useCallback(async () => {
    if (!parsedConvId || isNaN(parsedConvId)) return;
    try {
      const fetched = await getMessages({ id_conversation: parsedConvId });
      setMessages(fetched);
    } catch (err) {
      console.error('Erreur chargement messages:', err);
    }
  }, [parsedConvId]);

  useEffect(() => {
    if (!parsedConvId || !user || isNaN(parsedConvId)) {
      console.warn("❌ Invalid conversation ID:", id_conversation);
      setConvValid(false);
      return;
    }

    

    const fetchInitialData = async () => {
      try {
        const data: Conversation | null = await getConversationById({
          id_conversation: parsedConvId,
        });

        if (!data) {
          setConvValid(false);
          return;
        }

        const otherId =
          data.id_utilisateur1 === user.id ? data.id_utilisateur2 : data.id_utilisateur1;

        setReceiverId(otherId);
      } catch (err) {
        console.error('Erreur identification destinataire:', err);
        setConvValid(false);
      }
    };

    fetchInitialData();
    fetchMessages();
  }, [parsedConvId, user, fetchMessages, id_conversation]);


  useEffect(() => {
    if (!parsedConvId) return;
  
    const subscription = subscribeToMessages(parsedConvId, (newMessage) => {
      setMessages((prev) => [newMessage, ...prev]);
    });
  
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [parsedConvId]);
  
  const handleSend = async () => {
    if (!input.trim() || !user) return;
    try {
      if (!receiverId) throw new Error('Missing receiver ID');

      const newMessage = await sendMessage({
        id_conversation: parsedConvId,
        id_expediteur: user.id,
        id_destinataire: receiverId,
        contenu: input.trim(),
      });

      setMessages((prev) => [...prev, newMessage]);
      setInput('');
    } catch (err) {
      console.error('Erreur envoi message:', err);
    }
  };

  if (!convValid) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-600 text-lg">Conversation invalide ou introuvable.</Text>
      </View>
    );
  }



  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-white"
    >
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-blue-600 text-base">
           <LucideArrowBigLeft />
          </Text>
        </TouchableOpacity>
        <Text className="text-base font-semibold text-gray-800">Discussion</Text>
        <View className="w-12" /> {/* placeholder pour équilibrer */}
      </View>



      <FlatList
        data={messages}
        keyExtractor={(item) => item.id_message}
        renderItem={({ item }) => (
          <View
            className={`p-2 m-2 rounded-xl max-w-[80%] ${
              item.id_expediteur === user?.id ? 'self-end bg-blue-100' : 'self-start bg-gray-100'
            }`}
          >
            <Text>{item.contenu}</Text>
            <Text className="text-[10px] text-gray-500 mt-1">
              {new Date(item.date_envoi).toLocaleTimeString()}
            </Text>
          </View>
        )}
        inverted
      />

      <View className="flex-row items-center p-2 border-t border-gray-200">
        <TextInput
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-base"
          placeholder="Écrire un message..."
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity onPress={handleSend} className="ml-2 bg-blue-600 rounded-full px-4 py-2">
          <Text className="text-white font-semibold">Envoyer</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatScreen;
