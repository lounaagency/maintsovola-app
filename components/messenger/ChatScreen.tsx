import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  Dimensions,
  Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { 
  Conversation, 
  Message, 
  MessageType, 
  MessageAttachment, 
  MessageReaction,
  ComposerState,
  popularEmojis 
} from '../../types/message_types';
import { SupabaseMessageService } from '~/services/supabase-service';

interface ChatScreenProps {
  conversation: Conversation;
  onBack?: () => void;
  currentUserId: string; // ID de l'utilisateur actuel
}

const ChatScreen: React.FC<ChatScreenProps> = ({ conversation, onBack, currentUserId }: ChatScreenProps) => {
  const [messages, setMessages] = useState<Message[]>(conversation.messages);
  const [composerState, setComposerState] = useState<ComposerState>({
    text: '',
    attachments: [],
    isRecording: false,
    recordingDuration: 0,
  });
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [selectedMessageForReaction, setSelectedMessageForReaction] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const textInputRef = useRef<TextInput>(null);
  const router = useRouter();
  const screenWidth = Dimensions.get('window').width;

  // Service Supabase
  const messageService = new SupabaseMessageService(currentUserId);

  // Faire défiler vers le bas lors du chargement ou de l'ajout de nouveaux messages
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  // Charger les messages depuis Supabase au montage du composant
  useEffect(() => {
    loadMessages();
    markMessagesAsRead();
    
    // S'abonner aux nouveaux messages en temps réel
    const subscription = messageService.subscribeToMessages(
      conversation.id,
      (newMessage: Message) => {
        setMessages(prevMessages => [...prevMessages, newMessage]);
        if (newMessage.senderId !== currentUserId) {
          markMessagesAsRead();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [conversation.id]);

  // Charger les messages depuis Supabase
  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const messagesFromDB = await messageService.getMessagesForConversation(conversation.id);
      setMessages(messagesFromDB);
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
      Alert.alert('Erreur', 'Impossible de charger les messages');
    } finally {
      setIsLoading(false);
    }
  };

  // Marquer les messages comme lus
  const markMessagesAsRead = async () => {
    try {
      await messageService.markMessagesAsRead(conversation.id);
    } catch (error) {
      console.error('Erreur lors du marquage des messages comme lus:', error);
    }
  };

  // Fonction pour obtenir l'autre participant
  const getOtherParticipant = () => {
    return conversation.participants.find(p => p.id !== currentUserId) || conversation.participants[0];
  };

  // Fonction pour formater l'heure des messages avec optimisation pour les messages consécutifs
  const formatMessageTime = (timestamp: string, previousTimestamp?: string): string => {
    const date = new Date(timestamp);
    
    // Si il y a un message précédent, vérifier la différence de temps
    if (previousTimestamp) {
      const previousDate = new Date(previousTimestamp);
      const diffInSeconds = Math.abs(date.getTime() - previousDate.getTime()) / 1000;
      
      // Ne pas afficher l'heure si la différence est inférieure à 60 secondes
      if (diffInSeconds < 60) {
        return '';
      }
    }
    
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  // Fonction pour envoyer un message
  const sendMessage = async () => {
    if (composerState.text.trim() === '' && composerState.attachments.length === 0) return;

    try {
      setIsLoading(true);
      
      // Préparer les pièces jointes (URLs)
      const attachmentUrls = composerState.attachments.map(att => att.url);
      
      // Envoyer le message via Supabase
      const sentMessage = await messageService.sendMessage(
        conversation.id,
        composerState.text.trim(),
        attachmentUrls.length > 0 ? attachmentUrls : undefined
      );

      if (sentMessage) {
        // Ajouter le message à la liste locale (il sera aussi reçu via la subscription)
        setMessages(prevMessages => [...prevMessages, sentMessage]);
        
        // Réinitialiser le composer
        setComposerState({
          text: '',
          attachments: [],
          isRecording: false,
          recordingDuration: 0,
        });
      } else {
        Alert.alert('Erreur', 'Impossible d\'envoyer le message');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer le message');
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour gérer le retour
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  // Fonction pour ajouter une réaction
  const addReaction = (messageId: string, emoji: string) => {
    setMessages(prevMessages => 
      prevMessages.map(message => {
        if (message.id === messageId) {
          const existingReaction = message.reactions?.find(r => r.userId === currentUserId && r.emoji === emoji);
          if (existingReaction) {
            // Supprimer la réaction si elle existe déjà
            return {
              ...message,
              reactions: message.reactions?.filter(r => !(r.userId === currentUserId && r.emoji === emoji))
            };
          } else {
            // Ajouter la nouvelle réaction
            const newReaction: MessageReaction = {
              id: `reaction_${Date.now()}`,
              userId: currentUserId,
              emoji,
              timestamp: new Date().toISOString(),
            };
            return {
              ...message,
              reactions: [...(message.reactions || []), newReaction]
            };
          }
        }
        return message;
      })
    );
    setSelectedMessageForReaction(null);
  };

  // Fonction pour gérer la sélection d'image
  const handleImagePicker = () => {
    Alert.alert(
      'Sélectionner une image',
      'Choisissez une source',
      [
        { text: 'Galerie', onPress: () => selectFromGallery() },
        { text: 'Caméra', onPress: () => takePhoto() },
        { text: 'Annuler', style: 'cancel' },
      ]
    );
    setShowAttachmentMenu(false);
  };

  // Fonction pour sélectionner depuis la galerie
  const selectFromGallery = () => {
    // Simulation de sélection d'image
    const mockImage: MessageAttachment = {
      id: `img_${Date.now()}`,
      type: 'image',
      url: 'https://picsum.photos/300/200',
      name: 'image_galerie.jpg',
      size: 1024000,
      mimeType: 'image/jpeg',
    };
    
    setComposerState(prev => ({
      ...prev,
      attachments: [...prev.attachments, mockImage]
    }));
  };

  // Fonction pour prendre une photo
  const takePhoto = () => {
    // Simulation de prise de photo
    const mockPhoto: MessageAttachment = {
      id: `photo_${Date.now()}`,
      type: 'image',
      url: 'https://picsum.photos/300/200?random=' + Date.now(),
      name: 'photo_camera.jpg',
      size: 2048000,
      mimeType: 'image/jpeg',
    };
    
    setComposerState(prev => ({
      ...prev,
      attachments: [...prev.attachments, mockPhoto]
    }));
  };

  // Fonction pour sélectionner un fichier
  const handleFilePicker = () => {
    // Simulation de sélection de fichier
    const mockFile: MessageAttachment = {
      id: `file_${Date.now()}`,
      type: 'file',
      url: 'https://example.com/document.pdf',
      name: 'document.pdf',
      size: 5120000,
      mimeType: 'application/pdf',
    };
    
    setComposerState(prev => ({
      ...prev,
      attachments: [...prev.attachments, mockFile]
    }));
    setShowAttachmentMenu(false);
  };

  // Fonction pour démarrer un appel vocal
  const startVoiceCall = () => {
    Alert.alert(
      'Appel vocal',
      `Appeler ${getOtherParticipant().name} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Appeler', onPress: () => {
          Alert.alert('Appel en cours', 'Fonctionnalité d\'appel vocal simulée');
        }},
      ]
    );
  };

  // Fonction pour envoyer un "J'aime"
  const sendLike = async () => {
    try {
      setIsLoading(true);
      const sentMessage = await messageService.sendMessage(conversation.id, '👍');
      
      if (sentMessage) {
        setMessages(prevMessages => [...prevMessages, sentMessage]);
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du like:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour supprimer une pièce jointe
  const removeAttachment = (attachmentId: string) => {
    setComposerState(prev => ({
      ...prev,
      attachments: prev.attachments.filter(att => att.id !== attachmentId)
    }));
  };

  // Interface pour les props du composant MessageBubble
  interface MessageBubbleProps {
    message: Message;
    isOwn: boolean;
    previousMessage?: Message;
  }

  // Composant pour un message individuel
  const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn, previousMessage }: MessageBubbleProps) => {
    const timeDisplay = formatMessageTime(message.timestamp, previousMessage?.timestamp);
    
    return (
      <TouchableOpacity
        onLongPress={() => setSelectedMessageForReaction(message.id)}
        className={`flex-row mb-3 ${isOwn ? 'justify-end' : 'justify-start'}`}
      >
        {!isOwn && (
          <Image
            source={{ uri: getOtherParticipant().avatar }}
            className="w-8 h-8 rounded-full mr-2 mt-1"
          />
        )}
        
        <View className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}>
          <View
            className={`px-4 py-2 rounded-2xl ${
              isOwn
                ? 'bg-blue-600 rounded-br-md'
                : 'bg-gray-200 rounded-bl-md'
            }`}
          >
            {/* Affichage des pièces jointes */}
            {message.attachments && message.attachments.map((attachment) => (
              <View key={attachment.id} className="mb-2">
                {attachment.type === 'image' ? (
                  <Image
                    source={{ uri: attachment.url }}
                    className="w-48 h-32 rounded-lg"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="flex-row items-center p-2 bg-white bg-opacity-20 rounded-lg">
                    <MaterialIcons name="attach-file" size={20} color={isOwn ? "white" : "#333"} />
                    <Text className={`ml-2 text-sm ${isOwn ? 'text-white' : 'text-gray-900'}`}>
                      {attachment.name}
                    </Text>
                  </View>
                )}
              </View>
            ))}
            
            {/* Contenu du message */}
            {message.content && (
              <Text 
                className={`text-base ${isOwn ? 'text-white' : 'text-gray-900'}`}
                style={{ maxWidth: screenWidth * 0.6 }} // Limiter la largeur des messages longs
              >
                {message.content}
              </Text>
            )}
          </View>
          
          {/* Réactions */}
          {message.reactions && message.reactions.length > 0 && (
            <View className="flex-row flex-wrap mt-1">
              {message.reactions.map((reaction) => (
                <View key={reaction.id} className="bg-white rounded-full px-2 py-1 mr-1 mb-1 shadow-sm">
                  <Text className="text-sm">{reaction.emoji}</Text>
                </View>
              ))}
            </View>
          )}
          
          {/* Affichage conditionnel du timestamp */}
          {timeDisplay && (
            <Text className="text-xs text-gray-500 mt-1 px-2">
              {timeDisplay}
            </Text>
          )}
        </View>

        {isOwn && (
          <View className="w-8 h-8 ml-2 mt-1 justify-center items-center">
            <View className="w-6 h-6 bg-gray-300 rounded-full justify-center items-center">
              <Text className="text-xs font-bold text-gray-600">M</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const otherParticipant = getOtherParticipant();

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-white" 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-200 bg-white">
        <TouchableOpacity onPress={handleBack} className="mr-3">
          <MaterialIcons name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
        
        <Image
          source={{ uri: otherParticipant.avatar }}
          className="w-10 h-10 rounded-full mr-3"
        />
        
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-900">
            {otherParticipant.name}
          </Text>
          <Text className="text-sm text-green-600">En ligne</Text>
        </View>
        
        <TouchableOpacity onPress={startVoiceCall} className="p-2 ml-2">
          <MaterialIcons name="call" size={24} color="#4CAF50" />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => setShowSettings(true)} className="p-2 ml-2">
          <MaterialIcons name="more-vert" size={24} color="#666666" />
        </TouchableOpacity>
      </View>

      {/* Zone des messages */}
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 px-4 py-4"
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {isLoading && messages.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20">
            <MaterialIcons name="hourglass-empty" size={48} color="#CCCCCC" />
            <Text className="text-gray-400 text-lg mt-4">Chargement des messages...</Text>
          </View>
        ) : messages.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20">
            <Image
              source={{ uri: otherParticipant.avatar }}
              className="w-20 h-20 rounded-full mb-4"
            />
            <Text className="text-lg font-semibold text-gray-900 mb-2">
              {otherParticipant.name}
            </Text>
            <Text className="text-gray-500 text-center px-8">
              Vous êtes maintenant connectés sur Maintso Vola. Dites bonjour !
            </Text>
          </View>
        ) : (
          messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.senderId === currentUserId}
              previousMessage={index > 0 ? messages[index - 1] : undefined}
            />
          ))
        )}
      </ScrollView>

      {/* Aperçu des pièces jointes */}
      {composerState.attachments.length > 0 && (
        <View className="px-4 py-2 border-t border-gray-200 bg-gray-50">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {composerState.attachments.map((attachment) => (
              <View key={attachment.id} className="mr-3 relative">
                {attachment.type === 'image' ? (
                  <Image
                    source={{ uri: attachment.url }}
                    className="w-16 h-16 rounded-lg"
                  />
                ) : (
                  <View className="w-16 h-16 bg-gray-300 rounded-lg justify-center items-center">
                    <MaterialIcons name="attach-file" size={24} color="#666" />
                  </View>
                )}
                <TouchableOpacity
                  onPress={() => removeAttachment(attachment.id)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full justify-center items-center"
                >
                  <MaterialIcons name="close" size={16} color="white" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Zone de saisie améliorée */}
      <View className="flex-row items-end px-4 py-3 border-t border-gray-200 bg-white">
        <TouchableOpacity 
          onPress={() => setShowAttachmentMenu(true)}
          className="p-2 mb-1"
        >
          <MaterialIcons name="add" size={24} color="#4CAF50" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => setShowEmojiPicker(true)}
          className="p-2 ml-1 mb-1"
        >
          <MaterialIcons name="emoji-emotions" size={24} color="#4CAF50" />
        </TouchableOpacity>
        
        <View className="flex-1 mx-3 bg-gray-100 rounded-full px-4 py-2 max-h-24">
          <TextInput
            ref={textInputRef}
            className="text-base min-h-6"
            placeholder="Tapez un message..."
            value={composerState.text}
            onChangeText={(text) => setComposerState(prev => ({ ...prev, text }))}
            multiline
            maxLength={1000}
            scrollEnabled={true} // Permettre le scroll dans le TextInput
            style={{ 
              maxHeight: 80, // Hauteur maximale avant scroll
              textAlignVertical: 'top' 
            }}
          />
        </View>
        
        {composerState.text.trim() || composerState.attachments.length > 0 ? (
          <TouchableOpacity 
            onPress={sendMessage} 
            className="p-2 mb-1"
            disabled={isLoading}
          >
            <MaterialIcons 
              name="send" 
              size={24} 
              color={isLoading ? "#CCCCCC" : "#4CAF50"} 
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            onPress={sendLike} 
            className="p-2 mb-1"
            disabled={isLoading}
          >
            <MaterialIcons 
              name="thumb-up" 
              size={24} 
              color={isLoading ? "#CCCCCC" : "#4CAF50"} 
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Menu des pièces jointes */}
      <Modal
        visible={showAttachmentMenu}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAttachmentMenu(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black bg-opacity-50 justify-end"
          onPress={() => setShowAttachmentMenu(false)}
        >
          <View className="bg-white rounded-t-3xl p-6">
            <Text className="text-lg font-semibold text-center mb-4">Ajouter une pièce jointe</Text>
            
            <TouchableOpacity
              onPress={handleImagePicker}
              className="flex-row items-center py-4 border-b border-gray-200"
            >
              <MaterialIcons name="photo" size={24} color="#4CAF50" />
              <Text className="ml-4 text-base">Photo ou vidéo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={takePhoto}
              className="flex-row items-center py-4 border-b border-gray-200"
            >
              <MaterialIcons name="photo-camera" size={24} color="#4CAF50" />
              <Text className="ml-4 text-base">Caméra</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleFilePicker}
              className="flex-row items-center py-4"
            >
              <MaterialIcons name="attach-file" size={24} color="#4CAF50" />
              <Text className="ml-4 text-base">Document</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Sélecteur d'emoji */}
      <Modal
        visible={showEmojiPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEmojiPicker(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black bg-opacity-50 justify-end"
          onPress={() => setShowEmojiPicker(false)}
        >
          <View className="bg-white rounded-t-3xl p-6">
            <Text className="text-lg font-semibold text-center mb-4">Choisir un emoji</Text>
            <View className="flex-row flex-wrap justify-center">
              {popularEmojis.map((emoji, index) => (
                <TouchableOpacity
                  key={index}
                  className="p-3 m-2 bg-gray-100 rounded-full"
                  onPress={() => {
                    setComposerState(prev => ({ ...prev, text: prev.text + emoji }));
                    setShowEmojiPicker(false);
                  }}
                >
                  <Text className="text-2xl">{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Sélecteur de réaction */}
      <Modal
        visible={selectedMessageForReaction !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedMessageForReaction(null)}
      >
        <TouchableOpacity
          className="flex-1 bg-black bg-opacity-50 justify-center items-center"
          onPress={() => setSelectedMessageForReaction(null)}
        >
          <View className="bg-white rounded-2xl p-6 mx-8">
            <Text className="text-lg font-semibold text-center mb-4">Ajouter une réaction</Text>
            <View className="flex-row flex-wrap justify-center">
              {popularEmojis.map((emoji, index) => (
                <TouchableOpacity
                  key={index}
                  className="p-3 m-2 bg-gray-100 rounded-full"
                  onPress={() => selectedMessageForReaction && addReaction(selectedMessageForReaction, emoji)}
                >
                  <Text className="text-2xl">{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal des paramètres */}
      <Modal
        visible={showSettings}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSettings(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black bg-opacity-50 justify-end"
          onPress={() => setShowSettings(false)}
        >
          <View className="bg-white rounded-t-3xl p-6">
            <Text className="text-lg font-semibold text-center mb-4">Options de conversation</Text>
            
            <TouchableOpacity className="flex-row items-center py-4 border-b border-gray-200">
              <MaterialIcons name="notifications" size={24} color="#666666" />
              <Text className="ml-4 text-base">Notifications</Text>
            </TouchableOpacity>
            
            <TouchableOpacity className="flex-row items-center py-4 border-b border-gray-200">
              <MaterialIcons name="block" size={24} color="#666666" />
              <Text className="ml-4 text-base">Bloquer</Text>
            </TouchableOpacity>
            
            <TouchableOpacity className="flex-row items-center py-4">
              <MaterialIcons name="delete" size={24} color="#FF5252" />
              <Text className="ml-4 text-base text-red-500">Supprimer la conversation</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default ChatScreen;
