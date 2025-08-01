import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, TextInput, Modal, Alert, RefreshControl } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { debounce } from 'lodash';
import { Conversation} from '../../types/message_type';
import { SupabaseMessageService, DatabaseUser } from '~/services/supabase-services';

// Interface pour les props du composant MessageList
interface MessageListProps {
  onConversationSelect?: (conversation: Conversation) => void;
  currentUserId: string;
}

// Interface pour les props du composant ConversationItem
interface ConversationItemProps {
  conversation: Conversation;
}

// Interface pour les props du composant ContactItem
interface ContactItemProps {
  contact: DatabaseUser;
}

const MessageList: React.FC<MessageListProps> = ({ onConversationSelect, currentUserId }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  const [availableContacts, setAvailableContacts] = useState<DatabaseUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const router = useRouter();
  const messageService = useMemo(() => new SupabaseMessageService(currentUserId), [currentUserId]);

  // Charge les conversations depuis la base de données avec pagination
  const loadConversations = useCallback(
    async (pageNum: number = 1, reset: boolean = false) => {
      try {
        setIsLoading(pageNum === 1 && reset);
        const conversationsFromDB = await messageService.getConversations(pageNum);
        setConversations((prev) => (reset ? conversationsFromDB : [...prev, ...conversationsFromDB]));
        setHasMore(conversationsFromDB.length === 20); // Ajuster selon pageSize dans getConversations
        setPage(pageNum);
      } catch (error) {
        console.error('Erreur lors du chargement des conversations:', error);
        Alert.alert('Erreur', 'Impossible de charger les conversations');
      } finally {
        if (pageNum === 1 && reset) {
          setIsLoading(false);
        }
      }
    },
    [messageService]
  );

  // Charge les contacts disponibles
  const loadAvailableContacts = useCallback(
    async (searchQuery?: string) => {
      try {
        setIsLoadingContacts(true);
        const contacts = await messageService.getAvailableContacts(searchQuery);
        setAvailableContacts(contacts);
      } catch (error) {
        console.error('Erreur lors du chargement des contacts:', error);
        Alert.alert('Erreur', 'Impossible de charger les contacts');
      } finally {
        setIsLoadingContacts(false);
      }
    },
    [messageService]
  );

  // Debounce pour la recherche de contacts
  const debouncedLoadContacts = useMemo(
    () => debounce((query: string) => {
      if (showNewConversationModal) {
        loadAvailableContacts(query);
      }
    }, 300),
    [loadAvailableContacts, showNewConversationModal]
  );

  // Effet pour charger les conversations et s'abonner aux mises à jour
  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      await loadConversations(1, true);
    };

    fetchData();
    const subscription = messageService.subscribeToConversations(async (conversationId) => {
      if (!mounted) return;
      try {
        const updatedConversation = await messageService.getConversationById(conversationId);
        if (updatedConversation) {
          setConversations((prev) =>
            prev.some((conv) => conv.id === conversationId)
              ? prev.map((conv) => (conv.id === conversationId ? updatedConversation : conv))
              : [updatedConversation, ...prev]
          );
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour de la conversation:', error);
      }
    });

    return () => {
      mounted = false;
      void subscription.unsubscribe(); // Wrap async unsubscribe in synchronous cleanup
    };
  }, [messageService, loadConversations]);

  // Effet pour gérer la recherche de contacts
  useEffect(() => {
    if (showNewConversationModal) {
      debouncedLoadContacts(contactSearchQuery);
    }
    return () => debouncedLoadContacts.cancel();
  }, [contactSearchQuery, showNewConversationModal, debouncedLoadContacts]);

  // Rafraîchissement pull-to-refresh
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadConversations(1, true);
    setIsRefreshing(false);
  }, [loadConversations]);

  // Charger plus de conversations au scroll
  const loadMoreConversations = useCallback(() => {
    if (hasMore && !isLoading && !isRefreshing) {
      loadConversations(page + 1);
    }
  }, [hasMore, isLoading, isRefreshing, page, loadConversations]);

  // Filtre les conversations selon la requête de recherche
  const filteredConversations = useMemo(
    () =>
      searchQuery
        ? conversations.filter((conversation) =>
            conversation.participants.some((participant) =>
              participant.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
          )
        : conversations,
    [conversations, searchQuery]
  );

  // Formate l'heure d'un message
  const formatTime = useCallback((timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString('fr-FR', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    }
  }, []);

  // Obtient l'autre participant d'une conversation
  const getOtherParticipant = useCallback(
    (conversation: Conversation) =>
      conversation.participants.find((p) => p.id !== currentUserId) || conversation.participants[0],
    [currentUserId]
  );

  // Gère la sélection d'une conversation
  const handleConversationPress = useCallback(
    (conversation: Conversation) => {
      if (onConversationSelect) {
        onConversationSelect(conversation);
      } else {
        router.push(`/messages/chat/${conversation.id}`);
      }
    },
    [onConversationSelect, router]
  );

  // Crée une nouvelle conversation avec un contact
  const createNewConversation = useCallback(
    async (contact: DatabaseUser) => {
      try {
        setIsLoading(true);
        const newConversation = await messageService.createConversation(contact.id_utilisateur);

        if (newConversation) {
          setConversations((prev) => [newConversation, ...prev]);
          setAvailableContacts((prev) => prev.filter((c) => c.id_utilisateur !== contact.id_utilisateur));
          setShowNewConversationModal(false);
          setContactSearchQuery('');

          if (onConversationSelect) {
            onConversationSelect(newConversation);
          } else {
            router.push(`/messages/chat/${newConversation.id}`);
          }

          const contactName = `${contact.prenoms || ''} ${contact.nom || ''}`.trim() || 'Utilisateur inconnu';
          Alert.alert('Nouvelle conversation', `Conversation créée avec ${contactName}`, [{ text: 'OK' }]);
        } else {
          Alert.alert('Erreur', 'Le contact sélectionné est invalide ou une conversation existe déjà.');
        }
      } catch (error) {
        console.error('Erreur lors de la création de la conversation:', error);
        Alert.alert('Erreur', 'Une erreur est survenue lors de la création de la conversation. Veuillez réessayer.');
      } finally {
        setIsLoading(false);
      }
    },
    [messageService, onConversationSelect, router]
  );

  // Gère l'ouverture du modal
  const handleNewConversation = useCallback(() => {
    setShowNewConversationModal(true);
  }, []);

  // Gère la fermeture du modal
  const handleCloseNewConversationModal = useCallback(() => {
    setShowNewConversationModal(false);
    setContactSearchQuery('');
    setAvailableContacts([]);
  }, []);

  // Composant pour afficher un élément de conversation
  const ConversationItem: React.FC<ConversationItemProps> = React.memo(
    ({ conversation }) => {
      const otherParticipant = useMemo(() => getOtherParticipant(conversation), [conversation]);
      const isUnread = conversation.unreadCount > 0;

      return (
        <TouchableOpacity
          className="flex-row items-center p-4 border-b border-gray-100"
          onPress={() => handleConversationPress(conversation)}
        >
          <View className="relative">
            <Image source={{ uri: otherParticipant.avatar }} className="w-12 h-12 rounded-full" />
            <View className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
          </View>
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
                {conversation.lastMessage.content || 'Aucun message'}
              </Text>
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
    },
    (prevProps, nextProps) =>
      prevProps.conversation.id === nextProps.conversation.id &&
      prevProps.conversation.lastMessage.timestamp === nextProps.conversation.lastMessage.timestamp
  );

  // Composant pour afficher un contact disponible
  const ContactItem: React.FC<ContactItemProps> = React.memo(({ contact }) => {
    const contactName = `${contact.prenoms || ''} ${contact.nom || ''}`.trim() || 'Utilisateur inconnu';
    const contactAvatar = contact.photo_profil || 'https://randomuser.me/api/portraits/men/1.jpg';

    return (
      <TouchableOpacity
        className="flex-row items-center p-4 border-b border-gray-100"
        onPress={() => createNewConversation(contact)}
        disabled={isLoading}
      >
        <Image source={{ uri: contactAvatar }} className="w-12 h-12 rounded-full" />
        <View className="flex-1 ml-3">
          <Text className="text-base font-semibold text-gray-900">{contactName}</Text>
          {contact.email && <Text className="text-sm text-gray-500">{contact.email}</Text>}
          <Text className="text-xs text-gray-400">Appuyer pour démarrer une conversation</Text>
        </View>
        <MaterialIcons name="chat" size={20} color="#4CAF50" />
      </TouchableOpacity>
    );
  });

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
      <FlatList
        data={filteredConversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ConversationItem conversation={item} />}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={['#4CAF50']} tintColor="#4CAF50" />}
        onEndReached={loadMoreConversations}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          hasMore && !isLoading ? (
            <View className="py-4">
              <Text className="text-center text-gray-400">Chargement de plus de conversations...</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          isLoading && conversations.length === 0 ? (
            <View className="flex justify-center items-center py-20">
              <MaterialIcons name="hourglass-empty" size={64} color="#CCCCCC" />
              <Text className="text-gray-400 text-lg mt-4">Chargement des conversations...</Text>
            </View>
          ) : (
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
          )
        }
      />

      {/* Bouton flottant */}
      <TouchableOpacity
        className="absolute bottom-6 right-4 w-14 h-14 bg-green-600 rounded-full justify-center items-center shadow-lg"
        onPress={handleNewConversation}
        disabled={isLoading}
        style={{ elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 }}
      >
        <MaterialIcons name="add" size={28} color="white" />
      </TouchableOpacity>

      {/* Modal pour nouvelle conversation */}
      <Modal visible={showNewConversationModal} transparent={true} animationType="slide" onRequestClose={handleCloseNewConversationModal}>
        <View className="flex-1 bg-black bg-opacity-50">
          <View className="flex-1 bg-white mt-20 rounded-t-3xl">
            <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
              <Text className="text-xl font-semibold text-gray-900">Nouvelle conversation</Text>
              <TouchableOpacity onPress={handleCloseNewConversationModal}>
                <MaterialIcons name="close" size={24} color="#666666" />
              </TouchableOpacity>
            </View>
            <View className="px-4 py-3 border-b border-gray-200">
              <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2">
                <MaterialIcons name="search" size={20} color="#666666" />
                <TextInput
                  className="flex-1 ml-2 text-base"
                  placeholder="Rechercher un contact par nom ou email..."
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
            <FlatList
              data={availableContacts}
              keyExtractor={(item) => item.id_utilisateur}
              renderItem={({ item }) => <ContactItem contact={item} />}
              ListEmptyComponent={
                isLoadingContacts ? (
                  <View className="flex-1 justify-center items-center py-20">
                    <MaterialIcons name="hourglass-empty" size={48} color="#CCCCCC" />
                    <Text className="text-gray-400 text-lg mt-4">Recherche en cours...</Text>
                  </View>
                ) : (
                  <View className="flex-1 justify-center items-center py-20">
                    <MaterialIcons name="person-outline" size={64} color="#CCCCCC" />
                    <Text className="text-gray-400 text-lg mt-4">
                      {contactSearchQuery ? 'Aucun contact trouvé' : 'Aucun nouveau contact disponible'}
                    </Text>
                    <Text className="text-gray-400 text-sm mt-2 text-center px-8">
                      {contactSearchQuery
                        ? 'Essayez un autre terme de recherche'
                        : 'Tous vos contacts ont déjà une conversation active ou aucun utilisateur n\'est disponible'}
                    </Text>
                  </View>
                )
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default MessageList;