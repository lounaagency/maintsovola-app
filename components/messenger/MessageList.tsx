import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Modal,
  Alert,
  RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Conversation, Message, MessageType } from '../../types/message_types';
import { SupabaseMessageService } from '~/services/supabase-service';

interface MessageListProps {
  onConversationSelect?: (conversation: Conversation) => void;
  currentUserId: string; // ID de l'utilisateur actuel
}

// Données statiques pour les contacts disponibles (à remplacer par des données Supabase)
const availableContacts = [
  { id: "user5", name: "Alice Dubois", avatar: "https://randomuser.me/api/portraits/women/1.jpg" },
  { id: "user6", name: "Pierre Martin", avatar: "https://randomuser.me/api/portraits/men/3.jpg" },
  { id: "user7", name: "Emma Leroy", avatar: "https://randomuser.me/api/portraits/women/2.jpg" },
  { id: "user8", name: "Lucas Bernard", avatar: "https://randomuser.me/api/portraits/men/4.jpg" },
  { id: "user9", name: "Camille Moreau", avatar: "https://randomuser.me/api/portraits/women/4.jpg" },
  { id: "user10", name: "Thomas Petit", avatar: "https://randomuser.me/api/portraits/men/5.jpg" },
];

const MessageList: React.FC<MessageListProps> = ({ onConversationSelect, currentUserId }: MessageListProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showNewConversationModal, setShowNewConversationModal] = useState<boolean>(false);
  const [contactSearchQuery, setContactSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const router = useRouter();

  // Service Supabase
  const messageService = new SupabaseMessageService(currentUserId);

  // Charger les conversations au montage du composant
  useEffect(() => {
    loadConversations();
    
    // S'abonner aux mises à jour des conversations
    const subscription = messageService.subscribeToConversations(() => {
      loadConversations();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Charger les conversations depuis Supabase
  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const conversationsFromDB = await messageService.getConversations();
      setConversations(conversationsFromDB);
    } catch (error) {
      console.error('Erreur lors du chargement des conversations:', error);
      Alert.alert('Erreur', 'Impossible de charger les conversations');
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction de rafraîchissement
  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadConversations();
    setIsRefreshing(false);
  };

  // Filtrer les conversations selon la recherche
  const filteredConversations = conversations.filter((conversation) =>
    conversation.participants.some((participant) =>
      participant.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // Filtrer les contacts disponibles selon la recherche
  const filteredContacts = availableContacts.filter((contact) =>
    contact.name.toLowerCase().includes(contactSearchQuery.toLowerCase()) &&
    !conversations.some((conv) => 
      conv.participants.some((participant) => participant.id === contact.id)
    )
  );

  // Fonction pour formater l'heure avec optimisation pour les messages consécutifs
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

  // Fonction pour obtenir l'autre participant (pas l'utilisateur actuel)
  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(p => p.id !== currentUserId) || conversation.participants[0];
  };

  // Fonction pour gérer la sélection d'une conversation
  const handleConversationPress = (conversation: Conversation) => {
    if (onConversationSelect) {
      onConversationSelect(conversation);
    } else {
      // Navigation par défaut vers la page de chat
      router.push(`/messages/chat/${conversation.id}`);
    }
  };

  // Fonction pour créer une nouvelle conversation
  const createNewConversation = async (contact: typeof availableContacts[0]) => {
    try {
      setIsLoading(true);
      
      const newConversation = await messageService.createConversation(contact.id);
      
      if (newConversation) {
        // Recharger les conversations pour inclure la nouvelle
        await loadConversations();
        
        // Fermer le modal
        setShowNewConversationModal(false);
        setContactSearchQuery('');

        // Naviguer vers la nouvelle conversation
        if (onConversationSelect) {
          onConversationSelect(newConversation);
        } else {
          router.push(`/messages/chat/${newConversation.id}`);
        }

        // Afficher un message de confirmation
        Alert.alert(
          'Nouvelle conversation',
          `Conversation créée avec ${contact.name}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Erreur', 'Impossible de créer la conversation');
      }
    } catch (error) {
      console.error('Erreur lors de la création de la conversation:', error);
      Alert.alert('Erreur', 'Impossible de créer la conversation');
    } finally {
      setIsLoading(false);
    }
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
            <Text className={`text-xs ${isUnread ? 'text-blue-600' : 'text-gray-500'}`}>
              {formatTime(conversation.lastMessage.timestamp)}
            </Text>
          </View>

          <View className="flex-row justify-between items-center">
            <Text
              className={`text-sm flex-1 ${isUnread ? 'text-gray-800 font-medium' : 'text-gray-500'}`}
              numberOfLines={1}
            >
              {conversation.lastMessage.content || 'Aucun message'}
            </Text>
            
            {/* Badge de messages non lus */}
            {conversation.unreadCount > 0 && (
              <View className="ml-2 bg-blue-600 rounded-full min-w-5 h-5 justify-center items-center">
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
        disabled={isLoading}
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
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={['#4CAF50']}
            tintColor="#4CAF50"
          />
        }
      >
        {isLoading && conversations.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20">
            <MaterialIcons name="hourglass-empty" size={64} color="#CCCCCC" />
            <Text className="text-gray-400 text-lg mt-4">Chargement des conversations...</Text>
          </View>
        ) : filteredConversations.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20">
            <MaterialIcons name="chat-bubble-outline" size={64} color="#CCCCCC" />
            <Text className="text-gray-400 text-lg mt-4">
              {searchQuery ? 'Aucune conversation trouvée' : 'Aucune conversation'}
            </Text>
            {!searchQuery && (
              <Text className="text-gray-400 text-sm mt-2 text-center px-8">
                Commencez une nouvelle conversation en appuyant sur le bouton d&apos;édition ou le bouton +
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
        className="absolute bottom-6 right-6 w-14 h-14 bg-blue-600 rounded-full justify-center items-center shadow-lg"
        onPress={handleNewConversation}
        disabled={isLoading}
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
              {isLoading ? (
                <View className="flex-1 justify-center items-center py-20">
                  <MaterialIcons name="hourglass-empty" size={48} color="#CCCCCC" />
                  <Text className="text-gray-400 text-lg mt-4">Chargement...</Text>
                </View>
              ) : filteredContacts.length === 0 ? (
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
