// app/messages/index.tsx
import React, { use, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Image,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/data';

interface Message {
  id: string;
  sender: string;
  content: string;
  time: string;
  isNew: boolean;
  avatar?: string;
}

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  avatar?: string;
  messages: Message[];
}

interface Sms {
  id_message: string;
  id_conversation: string;
  id_expediteur: string;
  id_destinataire: string;
  contenu: string;
  date_envoi: string;
  lu: boolean;
  created_at: Date;
  created_by: string;
  modified_at: Date;
  pieces_jointes: string[];
}
interface Conversations {
  id_conversation: string;
  id_utilisateur1: string;
  id_utilisateur2: string;
  created_at: Date;
  derniere_activite: Date; 
}

const MessengerScreen = () => {
  const router = useRouter();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Données simulées pour les conversations
  
  const [conversation, setConversation] = useState<Conversations[]>([]);

  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      name: 'Admin Système',
      lastMessage: 'Votre terrain a été validé avec succès',
      time: 'il y a 2h',
      unreadCount: 2,
      messages: [
        {
          id: '1',
          sender: 'Admin Système',
          content: 'Bonjour, nous avons reçu votre demande de validation de terrain.',
          time: 'il y a 4h',
          isNew: false
        },
        {
          id: '2',
          sender: 'Admin Système',
          content: 'Votre terrain a été validé avec succès. Vous pouvez maintenant le publier.',
          time: 'il y a 2h',
          isNew: true
        }
      ]
    },
    {
      id: '2',
      name: 'Support Client',
      lastMessage: 'Merci pour votre retour, nous allons examiner cela.',
      time: 'il y a 1j',
      unreadCount: 0,
      messages: [
        {
          id: '1',
          sender: 'Vous',
          content: 'J\'ai un problème avec l\'upload de photos',
          time: 'il y a 2j',
          isNew: false
        },
        {
          id: '2',
          sender: 'Support Client',
          content: 'Merci pour votre retour, nous allons examiner cela.',
          time: 'il y a 1j',
          isNew: false
        }
      ]
    },
    {
      id: '3',
      name: 'Notifications Système',
      lastMessage: 'Bienvenue sur Maintso Vola !',
      time: 'il y a 3j',
      unreadCount: 1,
      messages: [
        {
          id: '1',
          sender: 'Système',
          content: 'Bienvenue sur Maintso Vola ! N\'hésitez pas à explorer toutes les fonctionnalités.',
          time: 'il y a 3j',
          isNew: true
        }
      ]
    }
  ]);

  const [messages, setMessages] = useState<Sms[]>([]);

  useEffect(() => {
    fetchSms();
    fetchConversations();
  }, []);
  
  const fetchConversations = async () => {
    // setLoading(true);
    const { data, error } = await supabase
      .from('conversation')
      .select('*')
      .gt("id_conversation", 10); // Tu peux filtrer ici
    console.log('Données récupérées:', data);
    console.log('Erreur:', error);
    if (error) {
      console.error('Erreur Supabase:', error.message);
    } else {
      setConversations(data);
      console.log('Données récupérées:', JSON.stringify(data));
    }
    // setLoading(false);
  };

  const fetchSms = async () => {
      //  setLoading(true);
    const { data, error } = await supabase
      .from('message') 
      .select('*')
      .gt("id_message",10);     // Tu peux filtrer ici
    console.log('Données récupérées:', data);
    console.log('Erreur:', error);
    if (error) {
      console.error('Erreur Supabase:', error.message);
    } else {
      setMessages(data);
      console.log('Données récupérées:', JSON.stringify(data));
    }
    // setLoading(false);
  };

  const handleSendMessage = (conversationId: string) => {
    if (newMessage.trim() === '') return;

    const updatedConversations = conversations.map(conv => {
      
      if (conv.id === conversationId) {
        const newMsg: Message = {
          id: Date.now().toString(),
          sender: 'Vous',
          content: newMessage,
          time: 'À l\'instant',
          isNew: false
        };
        return {
          ...conv,
          messages: [...conv.messages, newMsg],
          lastMessage: newMessage,
          time: 'À l\'instant'
        };
      }
      return conv;
    });

    setConversations(updatedConversations);
    setNewMessage('');
  };

  const markConversationAsRead = (conversationId: string) => {
    setConversations(prevConversations =>
      prevConversations.map(conv =>
        conv.id === conversationId
          ? { ...conv, unreadCount: 0 }
          : conv
      )
    );
  };

  const renderConversationList = () => (
    <ScrollView className="flex-1 bg-gray-50 w-full">
      <View className="w-full p-4 bg-white">
        <View className="flex-row w-full justify-around items-center mb-4">
          <Text className="text-2xl font-bold text-gray-800">Messages</Text>
          <TouchableOpacity
            className="bg-green-500 rounded-full p-2"
            onPress={() => setShowNewMessageModal(true)}
          >
            <MaterialIcons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {conversations.map((conversation) => (
          <TouchableOpacity
            key={conversation.id}
            className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-100"
            onPress={() => {
              setSelectedConversation(conversation.id);
              markConversationAsRead(conversation.id);
            }}
          >
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-green-500 rounded-full justify-center items-center mr-3">
                <MaterialIcons name="person" size={24} color="white" />
              </View>
              
              <View className="flex-1">
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="font-semibold text-gray-800 text-base">
                    {conversation.name}
                  </Text>
                  <Text className="text-xs text-gray-500">{conversation.time}</Text>
                </View>
                
                <View className="flex-row justify-between items-center">
                  <Text 
                    className="text-gray-600 text-sm flex-1" 
                    numberOfLines={1}
                  >
                    {conversation.lastMessage}''
                  </Text>
                  {conversation.unreadCount > 0 && (
                    <View className="bg-red-500 rounded-full min-w-5 h-5 justify-center items-center ml-2">
                      <Text className="text-white text-xs font-bold">
                        {conversation.unreadCount}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const renderConversationDetail = () => {
    const conversation = conversations.find(c => c.id === selectedConversation);
    if (!conversation) return null;

    return (
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center p-4 border-b border-gray-200 bg-white">
          <TouchableOpacity
            className="mr-3"
            onPress={() => setSelectedConversation(null)}
          >
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          
          <View className="w-10 h-10 bg-green-500 rounded-full justify-center items-center mr-3">
            <MaterialIcons name="person" size={20} color="white" />
          </View>
          
          <View className="flex-1">
            <Text className="font-semibold text-gray-800 text-lg">
              {conversation.name}
            </Text>
            <Text className="text-gray-500 text-sm">En ligne</Text>
          </View>
        </View>

        {/* Messages */}
        <ScrollView className="flex-1 p-4">
          {conversation.messages.map((message) => (
            <View
              key={message.id}
              className={`mb-4 ${
                message.sender === 'Vous' ? 'items-end' : 'items-start'
              }`}
            >
              <View
                className={`max-w-4/5 p-3 rounded-lg ml-3 ${
                  message.sender === 'Vous'
                    ? 'bg-green-500'
                    : 'bg-gray-200'
                }`}
              >
                <Text
                  className={`text-sm ${
                    message.sender === 'Vous' ? 'text-white' : 'text-gray-800'
                  }`}
                >
                
                  {message.content}
                </Text>
              </View>
              
              {is_sender(message) ? '' :  
                <View className='flex-row items-center relative mt-[-10px] mr-4'>
                  <Image source={require('../assets/profile.png')} style={{width: 25, height: 25, borderRadius: 12.5}} />
                </View>
              }

              <Text className="text-xs text-gray-500 mt-1">
                {message.time}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Input de message */}
        <View className="flex-row items-center p-4 border-t border-gray-200">
          <TextInput
            className={`flex-1 border  rounded-full px-4 pt-3 mr-3 ${isFocused ? 'text-green-500' : 'border-gray-300'}`}
            underlineColorAndroid={'transparent'}
            placeholder="Tapez votre message..."
            placeholderTextColor="#9ca3af"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            // style={{ maxHeight: 100, textAlignVertical: 'top' }}
            
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
          />
          <TouchableOpacity
            className="bg-green-500 rounded-full p-2"
            onPress={() => handleSendMessage(conversation.id)}
          >
            <MaterialIcons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-white w-full">
      {/* <Navbar activeNavIcon="messages" /> */}
      
      {selectedConversation ? renderConversationDetail() : renderConversationList()}

      {/* Modal nouveau message */}
      <Modal
        visible={showNewMessageModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowNewMessageModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="bg-white rounded-lg w-4/5 p-6">
            <Text className="text-lg font-bold mb-4">Nouveau message</Text>
            <Text className="text-gray-600 mb-4">
              Cette fonctionnalité sera bientôt disponible.
            </Text>
            <TouchableOpacity
              className="bg-green-500 rounded-lg p-3"
              onPress={() => setShowNewMessageModal(false)}
            >
              <Text className="text-white text-center font-semibold">Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const is_sender = (message: Message): boolean => {
  return message.sender === 'Vous';
}

export default MessengerScreen;