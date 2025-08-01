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
import { SupabaseMessageService, DatabaseUser } from '~/services/supabase-service';

// Interface pour les props du composant MessageList
interface MessageListProps {
  onConversationSelect?: (conversation: Conversation) => void;
  currentUserId: string; // ID de l'utilisateur actuel
}

/**
 * Composant MessageList - Affiche la liste des conversations de l'utilisateur
 * Permet de rechercher des conversations et de créer de nouvelles conversations
 * Utilise les données de la base de données Supabase
 */
const MessageList: React.FC<MessageListProps> = ({ onConversationSelect, currentUserId }: MessageListProps) => {
  // États pour gérer les données et l'interface utilisateur
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showNewConversationModal, setShowNewConversationModal] = useState<boolean>(false);
  const [contactSearchQuery, setContactSearchQuery] = useState<string>('');
  const [availableContacts, setAvailableContacts] = useState<DatabaseUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isLoadingContacts, setIsLoadingContacts] = useState<boolean>(false);
  const router = useRouter();

  // Service Supabase pour les opérations de messagerie
  const messageService = new SupabaseMessageService(currentUserId);

  /**
   * Effet pour charger les conversations au montage du composant
   * S'abonne également aux mises à jour en temps réel
   */
  useEffect(() => {
    loadConversations();
    
    // S'abonner aux mises à jour des conversations en temps réel
    const subscription = messageService.subscribeToConversations(() => {
      loadConversations();
    });

    // Nettoyer l'abonnement lors du démontage
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Effet pour charger les contacts disponibles quand le modal s'ouvre
   */
  useEffect(() => {
    if (showNewConversationModal) {
      loadAvailableContacts();
    }
  }, [showNewConversationModal]);

  /**
   * Effet pour rechercher les contacts avec debounce
   * Évite trop de requêtes lors de la frappe
   */
  useEffect(() => {
    if (showNewConversationModal) {
      const timeoutId = setTimeout(() => {
        loadAvailableContacts(contactSearchQuery);
      }, 300); // Debounce de 300ms pour optimiser les performances

      return () => clearTimeout(timeoutId);
    }
  }, [contactSearchQuery, showNewConversationModal]);

  /**
   * Charge les conversations depuis la base de données
   */
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

  /**
   * Charge les contacts disponibles depuis la base de données
   * @param searchQuery - Requête de recherche optionnelle
   */
  const loadAvailableContacts = async (searchQuery?: string) => {
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
  };

  /**
   * Fonction de rafraîchissement pull-to-refresh
   */
  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadConversations();
    setIsRefreshing(false);
  };

  /**
   * Filtre les conversations selon la requête de recherche
   */
  const filteredConversations = conversations.filter((conversation) =>
    conversation.participants.some((participant) =>
      participant.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  /**
   * Formate l'heure d'un message avec optimisation pour les messages récents
   * @param timestamp - Timestamp du message
   * @returns Chaîne formatée de l'heure
   */
  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      // Moins de 24h : afficher l'heure
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 jours
      // Moins d'une semaine : afficher le jour
      return date.toLocaleDateString('fr-FR', { weekday: 'short' });
    } else {
      // Plus d'une semaine : afficher la date
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    }
  };

  /**
   * Obtient l'autre participant d'une conversation (pas l'utilisateur actuel)
   * @param conversation - La conversation
   * @returns Le participant qui n'est pas l'utilisateur actuel
   */
  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(p => p.id !== currentUserId) || conversation.participants[0];
  };

  /**
   * Gère la sélection d'une conversation
   * @param conversation - La conversation sélectionnée
   */
  const handleConversationPress = (conversation: Conversation) => {
    if (onConversationSelect) {
      // Utiliser le callback si fourni
      onConversationSelect(conversation);
    } else {
      // Navigation par défaut vers la page de chat
      router.push(`/messages/chat/${conversation.id}`);
    }
  };

  /**
   * Crée une nouvelle conversation avec un contact
   * @param contact - Le contact avec qui créer la conversation
   */
  const createNewConversation = async (contact: DatabaseUser) => {
    try {
      setIsLoading(true);
      
      const newConversation = await messageService.createConversation(contact.id_utilisateur);
      
      if (newConversation) {
        // Recharger les conversations pour inclure la nouvelle
        await loadConversations();
        
        // Fermer le modal et réinitialiser la recherche
        setShowNewConversationModal(false);
        setContactSearchQuery('');

        // Naviguer vers la nouvelle conversation
        if (onConversationSelect) {
          onConversationSelect(newConversation);
        } else {
          router.push(`/messages/chat/${newConversation.id}`);
        }

        // Afficher un message de confirmation
        const contactName = `${contact.prenoms || ''} ${contact.nom || ''}`.trim() || 'Utilisateur inconnu';
        Alert.alert(
          'Nouvelle conversation',
          `Conversation créée avec ${contactName}`,
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

  /**
   * Gère l'ouverture du modal de nouvelle conversation
   */
  const handleNewConversation = () => {
    setShowNewConversationModal(true);
    setContactSearchQuery('');
  };

  /**
   * Gère la fermeture du modal de nouvelle conversation
   */
  const handleCloseNewConversationModal = () => {
    setShowNewConversationModal(false);
    setContactSearchQuery('');
    setAvailableContacts([]);
  };

  // Interface pour les props du composant ConversationItem
  interface ConversationItemProps {
    conversation: Conversation;
  }

  /**
   * Composant pour afficher un élément de conversation dans la liste
   */
  
  const ConversationItem: React.FC<ConversationItemProps> = ({ conversation }: ConversationItemProps) => {
    const otherParticipant = getOtherParticipant(conversation);
    const isUnread = conversation.unreadCount > 0;

    return (
      <TouchableOpacity
        className="flex-row items-center p-4 border-b border-gray-100"
        onPress={() => handleConversationPress(conversation)}
      >
        {/* Avatar du participant */}
        <View className="relative">
          <Image
            source={{ uri: otherParticipant.avatar }}
            className="w-12 h-12 rounded-full"
          />
          {/* Indicateur de statut en ligne */}
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
              {conversation.lastMessage.content || 'Aucun message'}
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
    contact: DatabaseUser;
  }

  /**
   * Composant pour afficher un contact disponible dans le modal
   */
  const ContactItem: React.FC<ContactItemProps> = ({ contact }: ContactItemProps) => {
    const contactName = `${contact.prenoms || ''} ${contact.nom || ''}`.trim() || 'Utilisateur inconnu';
    const contactAvatar = contact.photo_profil || 'https://randomuser.me/api/portraits/men/1.jpg';

    return (
      <TouchableOpacity
        className="flex-row items-center p-4 border-b border-gray-100"
        onPress={() => createNewConversation(contact)}
        disabled={isLoading}
      >
        <Image
          source={{ uri: contactAvatar }}
          className="w-12 h-12 rounded-full"
        />
        <View className="flex-1 ml-3">
          <Text className="text-base font-semibold text-gray-900">
            {contactName}
          </Text>
          {contact.email && (
            <Text className="text-sm text-gray-500">
              {contact.email}
            </Text>
          )}
          <Text className="text-xs text-gray-400">
            Appuyer pour démarrer une conversation
          </Text>
        </View>
        <MaterialIcons name="chat" size={20} color="#4CAF50" />
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header avec titre et bouton de nouvelle conversation */}
      <View className="px-4 py-3 border-b border-gray-200">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-2xl font-bold text-gray-900">Messages</Text>
          <TouchableOpacity onPress={handleNewConversation} className="p-2">
            <MaterialIcons name="edit" size={24} color="#4CAF50" />
          </TouchableOpacity>
        </View>

        {/* Barre de recherche des conversations */}
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
          // État de chargement initial
          <View className="flex justify-center items-center py-20">
            <MaterialIcons name="hourglass-empty" size={64} color="#CCCCCC" />
            <Text className="text-gray-400 text-lg mt-4">Chargement des conversations...</Text>
          </View>
        ) : filteredConversations.length === 0 ? (
          // État vide (aucune conversation)
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
          // Liste des conversations
          filteredConversations.map((conversation) => (
            <ConversationItem key={conversation.id} conversation={conversation} />
          ))
        )}
      </ScrollView>

      {/* Bouton flottant pour nouvelle conversation */}
      <TouchableOpacity
        className="absolute bottom-6 right-4 w-14 h-14 bg-green-600 rounded-full justify-center items-center shadow-lg"
        onPress={handleNewConversation}
        disabled={isLoading}
        style={{
          // Style inline pour s'assurer que le bouton est bien positionné
          elevation: 8, // Ombre sur Android
          shadowColor: '#000', // Ombre sur iOS
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        }}
      >
        <MaterialIcons name="add" size={28} color="white" />
      </TouchableOpacity>

      {/* Modal pour nouvelle conversation */}
      <Modal
        visible={showNewConversationModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseNewConversationModal}
      >
        <View className="flex-1 bg-black bg-opacity-50">
          <View className="flex-1 bg-white mt-20 rounded-t-3xl">
            {/* Header du modal */}
            <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
              <Text className="text-xl font-semibold text-gray-900">
                Nouvelle conversation
              </Text>
              <TouchableOpacity onPress={handleCloseNewConversationModal}>
                <MaterialIcons name="close" size={24} color="#666666" />
              </TouchableOpacity>
            </View>

            {/* Barre de recherche des contacts */}
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

            {/* Liste des contacts disponibles */}
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              {isLoadingContacts ? (
                // État de chargement des contacts
                <View className="flex-1 justify-center items-center py-20">
                  <MaterialIcons name="hourglass-empty" size={48} color="#CCCCCC" />
                  <Text className="text-gray-400 text-lg mt-4">Recherche en cours...</Text>
                </View>
              ) : availableContacts.length === 0 ? (
                // État vide (aucun contact disponible)
                <View className="flex-1 justify-center items-center py-20">
                  <MaterialIcons name="person-outline" size={64} color="#CCCCCC" />
                  <Text className="text-gray-400 text-lg mt-4">
                    {contactSearchQuery ? 'Aucun contact trouvé' : 'Aucun nouveau contact disponible'}
                  </Text>
                  <Text className="text-gray-400 text-sm mt-2 text-center px-8">
                    {contactSearchQuery 
                      ? 'Essayez un autre terme de recherche'
                      : 'Tous vos contacts ont déjà une conversation active ou aucun utilisateur n\'est disponible'
                    }
                  </Text>
                </View>
              ) : (
                // Liste des contacts disponibles
                availableContacts.map((contact) => (
                  <ContactItem key={contact.id_utilisateur} contact={contact} />
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