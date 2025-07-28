import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Conversation, Message, MessageType } from './message_types';
import { getMessages, sendMessage, getConversation} from "~/services/ms.service";
import { useAuth } from '~/contexts/AuthContext';

interface MessageListProps {
  onConversationSelect?: (conversation: Conversation) => void;
}

// Données statiques pour les contacts disponibles
const availableContacts = [
  { id: "user5", name: "Alice Dubois", avatar: "https://randomuser.me/api/portraits/women/1.jpg" },
  { id: "user6", name: "Pierre Martin", avatar: "https://randomuser.me/api/portraits/men/3.jpg" },
  { id: "user7", name: "Emma Leroy", avatar: "https://randomuser.me/api/portraits/women/2.jpg" },
  { id: "user8", name: "Lucas Bernard", avatar: "https://randomuser.me/api/portraits/men/4.jpg" },
  { id: "user9", name: "Camille Moreau", avatar: "https://randomuser.me/api/portraits/women/4.jpg" },
  { id: "user10", name: "Thomas Petit", avatar: "https://randomuser.me/api/portraits/men/5.jpg" },
];

import { User } from "@supabase/supabase-js";

interface Conversations {
  id_conversation: string;
  id_utilisateur1: string;
  id_utilisateur2: string;
  derniere_activite: string;
  created_at: Date;
}

// Données statiques initiales pour les conversations
const initialConversations: Conversation[] = [
  {
    id: "conv1",
    participants: [
      { id: "user1", name: "Jean Dupont", avatar: "https://randomuser.me/api/portraits/men/1.jpg" },
      { id: "user_current", name: "Moi", avatar: "https://randomuser.me/api/portraits/men/9.jpg" },
    ],
    lastMessage: {
      id: "msg3",
      senderId: "user1",
      senderName: "Jean Dupont",
      content: "Super ! Je voulais te parler du projet Maintso Vola.",
      timestamp: "2025-07-28T10:10:00Z",
      isRead: false,
      type: MessageType.TEXT,
    },
    unreadCount: 1,
    messages: [
      {
        id: "msg1",
        senderId: "user1",
        senderName: "Jean Dupont",
        content: "Salut, comment vas-tu ?",
        timestamp: "2025-07-28T10:00:00Z",
        isRead: true,
        type: MessageType.TEXT,
      },
      {
        id: "msg2",
        senderId: "user_current",
        senderName: "Moi",
        content: "Je vais bien, merci ! Et toi ?",
        timestamp: "2025-07-28T10:05:00Z",
        isRead: true,
        type: MessageType.TEXT,
      },
      {
        id: "msg3",
        senderId: "user1",
        senderName: "Jean Dupont",
        content: "Super ! Je voulais te parler du projet Maintso Vola.",
        timestamp: "2025-07-28T10:10:00Z",
        isRead: false,
        type: MessageType.TEXT,
      },
    ],
  },
  {
    id: "conv2",
    participants: [
      { id: "user3", name: "Admin", avatar: "https://randomuser.me/api/portraits/men/2.jpg" },
      { id: "user_current", name: "Moi", avatar: "https://randomuser.me/api/portraits/men/9.jpg" },
    ],
    lastMessage: {
      id: "msg4",
      senderId: "user3",
      senderName: "Admin",
      content: "Votre terrain a été validé avec succès.",
      timestamp: "2025-07-28T09:30:00Z",
      isRead: false,
      type: MessageType.TEXT,
    },
    unreadCount: 1,
    messages: [
      {
        id: "msg4",
        senderId: "user3",
        senderName: "Admin",
        content: "Votre terrain a été validé avec succès.",
        timestamp: "2025-07-28T09:30:00Z",
        isRead: false,
        type: MessageType.TEXT,
      },
    ],
  },
  {
    id: "conv3",
    participants: [
      { id: "user4", name: "Sophie Martin", avatar: "https://randomuser.me/api/portraits/women/3.jpg" },
      { id: "user_current", name: "Moi", avatar: "https://randomuser.me/api/portraits/men/9.jpg" },
    ],
    lastMessage: {
      id: "msg5",
      senderId: "user4",
      senderName: "Sophie Martin",
      content: "Bonjour, j'ai une question concernant l'application.",
      timestamp: "2025-07-27T15:45:00Z",
      isRead: true,
      type: MessageType.TEXT,
    },
    unreadCount: 0,

    messages: [
      {
        id: "msg5",
        senderId: "user4",
        senderName: "Sophie Martin",
        content: "Bonjour, j'ai une question concernant l'application.",
        timestamp: "2025-07-27T15:45:00Z",
        isRead: true,
        type: MessageType.TEXT,
      },
    ],
  },
];

const MessageList: React.FC<MessageListProps> = ({ onConversationSelect }: MessageListProps) => {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showNewConversationModal, setShowNewConversationModal] = useState<boolean>(false);
  const [contactSearchQuery, setContactSearchQuery] = useState<string>('');
  const [conv, setConv] = useState<Conversations[]>()
  const router = useRouter();

  const [mes, setMes] = useState<Message[]>();
  const currentAuth = useAuth();

  const filteredConversations = conversations.filter((conversation) =>
    conversation.participants.some((participant) =>
      participant.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const filteredContacts = availableContacts.filter((contact) =>
    contact.name.toLowerCase().includes(contactSearchQuery.toLowerCase()) &&
    !conversations.some((conv) => 
      conv.participants.some((participant) => participant.id === contact.id)
    )
  );

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 jours
      return date.toLocaleDateString('fr-FR', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    }
  };

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(p => p.id !== 'user_current') || conversation.participants[0];
  };

  const handleConversationPress = (conversation: Conversation) => {
    if (onConversationSelect) {
      onConversationSelect(conversation);
    } else {
      router.push(`/messages/chat/${conversation.id}`);
    }
  };

  const createNewConversation = (contact: typeof availableContacts[0]) => {
    const newConversationId = `conv_${Date.now()}`;
    const welcomeMessage: Message = {
      id: `msg_${Date.now()}`,
      senderId: 'system',
      senderName: 'Système',
      content: `Conversation démarrée avec ${contact.name}`,
      timestamp: new Date().toISOString(),
      isRead: true,
      type: MessageType.TEXT,
    };

    const newConversation: Conversation = {
      id: newConversationId,
      participants: [
        contact,
        { id: "user_current", name: "Moi", avatar: "https://randomuser.me/api/portraits/men/9.jpg" },
      ],
      lastMessage: welcomeMessage,
      unreadCount: 0,
      messages: [welcomeMessage],
    };

    setConversations(prevConversations => [newConversation, ...prevConversations]);
    
    setShowNewConversationModal(false);
    setContactSearchQuery('');

    if (onConversationSelect) {
      onConversationSelect(newConversation);
    } else {
      router.push(`/messages/chat/${newConversationId}`);
    }
    Alert.alert(
      'Nouvelle conversation',
      `Conversation créée avec ${contact.name}`,
      [{ text: 'OK' }]
    );
  };

  // Fonction pour gérer le bouton de nouvelle conversation
  const handleNewConversation = () => {
    setShowNewConversationModal(true);
  };

  // Interface pour les props du composant ConversationItem
  interface ConversationItemProps {
    conversation: Conversation;
  }

  // Composant pour un élément de conversation
  const ConversationItem: React.FC<ConversationItemProps> = ({ conversation }: ConversationItemProps) => {
    const otherParticipant = getOtherParticipant(conversation);
    const isUnread = conversation.unreadCount > 0;

    const loadConversations = async () => {
     try {
      const conv = await getConversation(currentAuth?.user);
        
        setConv(conv);
        console.log("Conversations chargées LOADCONV:", conv);
      } catch (error) {
        console.error("Erreur lors du chargement des conversations:", error);
      } 
    }

    useEffect( ()=> {
      loadConversations();
    }, [])

    console.log("ETOOOOOOOO:", JSON.stringify(conv))



    return (
      <TouchableOpacity
        className="flex-row items-center p-4 border-b border-gray-100"
        onPress={() => handleConversationPress(conversation)}
      >
        {/* Avatar */}
        <View className="relative">
          <Image
            source={{ uri: otherParticipant.avatar }}
            className="w-12 h-12 rounded-full"
          />
          {/* Indicateur en ligne (optionnel) */}
          <View className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
        </View>

        {/* Contenu de la conversation */}
        <View className="flex-1 ml-3">
          <View className="flex-row justify-between items-center mb-1">
            <Text className={`text-base font-semibold ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>
              {otherParticipant.name}
            </Text>
            <Text className={`text-xs ${isUnread ? 'text-green-600' : 'text-gray-500'}`}>
              {formatTime(conversation.lastMessage.timestamp)}
            </Text>
          </View>

          <View className="flex-row justify-between items-center">
            <Text
              className={`text-sm flex-1 ${isUnread ? 'text-gray-800 font-medium' : 'text-gray-500'}`}
              numberOfLines={1}
            >
              {conversation.lastMessage.content}
            </Text>
            
            {/* Badge de messages non lus */}
            {conversation.unreadCount > 0 && (
              <View className="ml-2 bg-green-600 rounded-full min-w-5 h-5 justify-center items-center">
                <Text className="text-white text-xs font-bold">
                  {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount.toString()}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Interface pour les props du composant ContactItem
  interface ContactItemProps {
    contact: typeof availableContacts[0];
  }

  // Composant pour un élément de contact
  const ContactItem: React.FC<ContactItemProps> = ({ contact }: ContactItemProps) => {
    return (
      <TouchableOpacity
        className="flex-row items-center p-4 border-b border-gray-100"
        onPress={() => createNewConversation(contact)}
      >
        <Image
          source={{ uri: contact.avatar }}
          className="w-12 h-12 rounded-full"
        />
        <View className="flex-1 ml-3">
          <Text className="text-base font-semibold text-gray-900">
            {contact.name}
          </Text>
          <Text className="text-sm text-gray-500">
            Appuyer pour démarrer une conversation
          </Text>
        </View>
        <MaterialIcons name="chat" size={20} color="#4CAF50" />
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 py-3 border-b border-gray-200">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-2xl font-bold text-gray-900">Messages</Text>
          <TouchableOpacity onPress={handleNewConversation} className="p-2">
            <MaterialIcons name="edit" size={24} color="#4CAF50" />
          </TouchableOpacity>
        </View>

        {/* Barre de recherche */}
        <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2">
          <MaterialIcons name="search" size={20} color="#666666" />
          <TextInput
            className="flex-1 ml-2 text-base"
            placeholder="Rechercher des conversations..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="clear" size={20} color="#666666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Liste des conversations */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {filteredConversations.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20">
            <MaterialIcons name="chat-bubble-outline" size={64} color="#CCCCCC" />
            <Text className="text-gray-400 text-lg mt-4">
              {searchQuery ? 'Aucune conversation trouvée' : 'Aucune conversation'}
            </Text>
            {!searchQuery && (
              <Text className="text-gray-400 text-sm mt-2 text-center px-8">
                Commencez une nouvelle conversation en appuyant sur le bouton d'édition ou le bouton +
              </Text>
            )}
          </View>
        ) : (
          filteredConversations.map((conversation) => (
            <ConversationItem key={conversation.id} conversation={conversation} />
          ))
        )}
      </ScrollView>

      {/* Bouton flottant pour nouvelle conversation */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 w-14 h-14 bg-green-600 rounded-full justify-center items-center shadow-lg"
        onPress={handleNewConversation}
      >
        <MaterialIcons name="add" size={28} color="white" />
      </TouchableOpacity>

      {/* Modal pour nouvelle conversation */}
      <Modal
        visible={showNewConversationModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowNewConversationModal(false)}
      >
        <View className="flex-1 bg-black bg-opacity-50">
          <View className="flex-1 bg-white mt-20 rounded-t-3xl">
            {/* Header du modal */}
            <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
              <Text className="text-xl font-semibold text-gray-900">
                Nouvelle conversation
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowNewConversationModal(false);
                  setContactSearchQuery('');
                }}
              >
                <MaterialIcons name="close" size={24} color="#666666" />
              </TouchableOpacity>
            </View>

            {/* Barre de recherche des contacts */}
            <View className="px-4 py-3 border-b border-gray-200">
              <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2">
                <MaterialIcons name="search" size={20} color="#666666" />
                <TextInput
                  className="flex-1 ml-2 text-base"
                  placeholder="Rechercher un contact..."
                  value={contactSearchQuery}
                  onChangeText={setContactSearchQuery}
                />
                {contactSearchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setContactSearchQuery('')}>
                    <MaterialIcons name="clear" size={20} color="#666666" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Liste des contacts */}
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              {filteredContacts.length === 0 ? (
                <View className="flex-1 justify-center items-center py-20">
                  <MaterialIcons name="person-outline" size={64} color="#CCCCCC" />
                  <Text className="text-gray-400 text-lg mt-4">
                    {contactSearchQuery ? 'Aucun contact trouvé' : 'Aucun nouveau contact disponible'}
                  </Text>
                  <Text className="text-gray-400 text-sm mt-2 text-center px-8">
                    {contactSearchQuery 
                      ? 'Essayez un autre terme de recherche'
                      : 'Tous vos contacts ont déjà une conversation active'
                    }
                  </Text>
                </View>
              ) : (
                filteredContacts.map((contact) => (
                  <ContactItem key={contact.id} contact={contact} />
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default MessageList;

