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
} from './message_types';

interface ChatScreenProps {
  conversation: Conversation;
  onBack?: () => void;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ conversation, onBack }: ChatScreenProps) => {
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
  
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();
  const screenWidth = Dimensions.get('window').width;

  // Faire défiler vers le bas lors du chargement ou de l'ajout de nouveaux messages
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  // Fonction pour obtenir l'autre participant
  const getOtherParticipant = () => {
    return conversation.participants.find(p => p.id !== 'user_current') || conversation.participants[0];
  };

  // Fonction pour formater l'heure des messages
  const formatMessageTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  // Fonction pour envoyer un message
  const sendMessage = () => {
    if (composerState.text.trim() === '' && composerState.attachments.length === 0) return;

    const message: Message = {
      id: `msg_${Date.now()}`,
      senderId: 'user_current',
      senderName: 'Moi',
      content: composerState.text.trim(),
      timestamp: new Date().toISOString(),
      isRead: true,
      type: composerState.attachments.length > 0 ? 
        (composerState.attachments[0].type === 'image' ? MessageType.IMAGE : MessageType.FILE) : 
        MessageType.TEXT,
      attachments: composerState.attachments.length > 0 ? composerState.attachments : undefined,
      reactions: [],
    };

    setMessages(prevMessages => [...prevMessages, message]);
    setComposerState({
      text: '',
      attachments: [],
      isRecording: false,
      recordingDuration: 0,
    });
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
          const existingReaction = message.reactions?.find(r => r.userId === 'user_current' && r.emoji === emoji);
          if (existingReaction) {
            // Supprimer la réaction si elle existe déjà
            return {
              ...message,
              reactions: message.reactions?.filter(r => !(r.userId === 'user_current' && r.emoji === emoji))
            };
          } else {
            // Ajouter la nouvelle réaction
            const newReaction: MessageReaction = {
              id: `reaction_${Date.now()}`,
              userId: 'user_current',
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
  const sendLike = () => {
    const likeMessage: Message = {
      id: `like_${Date.now()}`,
      senderId: 'user_current',
      senderName: 'Moi',
      content: '👍',
      timestamp: new Date().toISOString(),
      isRead: true,
      type: MessageType.TEXT,
      reactions: [],
    };

    setMessages(prevMessages => [...prevMessages, likeMessage]);
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
  }

  // Composant pour un message individuel
  const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }: MessageBubbleProps) => {
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
        
        <View className={`max-w-3/4 ${isOwn ? 'items-end' : 'items-start'}`}>
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
              <Text className={`text-base ${isOwn ? 'text-white' : 'text-gray-900'}`}>
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
          
          <Text className="text-xs text-gray-500 mt-1 px-2">
            {formatMessageTime(message.timestamp)}
          </Text>
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
        {messages.length === 0 ? (
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
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.senderId === 'user_current'}
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

      {/* Zone de saisie */}
      <View className="flex-row items-center px-4 py-3 border-t border-gray-200 bg-white">
        <TouchableOpacity 
          onPress={() => setShowAttachmentMenu(true)}
          className="p-2"
        >
          <MaterialIcons name="add" size={24} color="#4CAF50" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => setShowEmojiPicker(true)}
          className="p-2 ml-1"
        >
          <MaterialIcons name="emoji-emotions" size={24} color="#4CAF50" />
        </TouchableOpacity>
        
        <View className="flex-1 mx-3 bg-gray-100 rounded-full px-4 py-2">
          <TextInput
            className="text-base"
            placeholder="Tapez un message..."
            value={composerState.text}
            onChangeText={(text) => setComposerState(prev => ({ ...prev, text }))}
            multiline
            maxLength={1000}
          />
        </View>
        
        {composerState.text.trim() || composerState.attachments.length > 0 ? (
          <TouchableOpacity onPress={sendMessage} className="p-2">
            <MaterialIcons name="send" size={24} color="#4CAF50" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={sendLike} className="p-2">
            <MaterialIcons name="thumb-up" size={24} color="#4CAF50" />
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
              <Text className="ml-4 text-base">Fichier</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Sélecteur d'emojis */}
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
              {['😀', '😂', '😍', '🥰', '😊', '😎', '🤔', '😴', '😢', '😡', '👍', '👎', '❤️', '🔥', '💯', '🎉'].map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  onPress={() => {
                    setComposerState(prev => ({ ...prev, text: prev.text + emoji }));
                    setShowEmojiPicker(false);
                  }}
                  className="p-3 m-1"
                >
                  <Text className="text-2xl">{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Menu de réaction */}
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
          <View className="bg-white rounded-2xl p-4 mx-8">
            <Text className="text-lg font-semibold text-center mb-4">Réagir au message</Text>
            <View className="flex-row justify-center">
              {popularEmojis.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  onPress={() => selectedMessageForReaction && addReaction(selectedMessageForReaction, emoji)}
                  className="p-3 m-1"
                >
                  <Text className="text-2xl">{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Menu des paramètres */}
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
            <Text className="text-lg font-semibold text-center mb-4">Paramètres de conversation</Text>
            
            <TouchableOpacity className="flex-row items-center py-4 border-b border-gray-200">
              <MaterialIcons name="notifications" size={24} color="#666" />
              <Text className="ml-4 text-base flex-1">Notifications</Text>
              <MaterialIcons name="toggle-on" size={24} color="#4CAF50" />
            </TouchableOpacity>
            
            <TouchableOpacity className="flex-row items-center py-4 border-b border-gray-200">
              <MaterialIcons name="volume-up" size={24} color="#666" />
              <Text className="ml-4 text-base flex-1">Sons</Text>
              <MaterialIcons name="toggle-on" size={24} color="#4CAF50" />
            </TouchableOpacity>
            
            <TouchableOpacity className="flex-row items-center py-4 border-b border-gray-200">
              <MaterialIcons name="visibility" size={24} color="#666" />
              <Text className="ml-4 text-base flex-1">Accusés de lecture</Text>
              <MaterialIcons name="toggle-on" size={24} color="#4CAF50" />
            </TouchableOpacity>
            
            <TouchableOpacity className="flex-row items-center py-4">
              <MaterialIcons name="block" size={24} color="#f44336" />
              <Text className="ml-4 text-base text-red-600">Bloquer ce contact</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default ChatScreen;

