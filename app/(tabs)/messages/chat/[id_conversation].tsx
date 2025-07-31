"use client";
import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Alert,
  Keyboard,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getConversationById, getMessages, sendMessage, subscribeToMessages } from '~/services/conversation-message-service';
import { Conversation, Message, Utilisateur } from '~/type/messageInterface';
import { useAuth } from '~/contexts/AuthContext';
import { LucideArrowBigLeft } from 'lucide-react-native';
import { supabase } from '~/lib/data';
import MyImagePicker from '~/utils/picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ChatScreen = () => {
  const { id_conversation } = useLocalSearchParams<{ id_conversation: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();

  const parsedConvId = parseInt(id_conversation, 10);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [receiverId, setReceiverId] = useState<string>('');
  const [convValid, setConvValid] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!parsedConvId || isNaN(parsedConvId)) {
      setConvValid(false);
      return;
    }
    try {
      const fetched = await getMessages({ id_conversation: parsedConvId });
      setMessages(fetched);
    } catch (err) {
      console.error('Erreur chargement messages:', err);
      setError('Impossible de charger les messages. Veuillez réessayer.');
    }
  }, [parsedConvId]);

  useEffect(() => {
    if (!parsedConvId || !user || isNaN(parsedConvId)) {
      console.warn("❌ Invalid conversation ID or user:", id_conversation, user);
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
        setError('Erreur lors du chargement de la conversation.');
      }
    };

    fetchInitialData();
    fetchMessages();
  }, [parsedConvId, user, fetchMessages, id_conversation]);

  useEffect(() => {
    if (!parsedConvId || isNaN(parsedConvId)) return;

    const subscription = subscribeToMessages(parsedConvId, (newMessage) => {
      setMessages((prev) => {
        const exists = prev.some((msg) => msg.id_message === newMessage.id_message);
        if (exists) return prev;
        return [...prev, newMessage];
      });
    });

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [parsedConvId]);

  const handleSend = async (): Promise<void> => {
    if (!input.trim() || !user?.id || !receiverId) {
      console.warn('Missing input, user, or receiverId');
      return;
    }

    const tempMessage: Message = {
      id_message: `temp-${Date.now()}`,
      contenu: input.trim(),
      id_expediteur: user.id,
      id_destinataire: receiverId,
      date_envoi: new Date().toISOString(),
      id_conversation: parsedConvId,
      lu: false,
      created_at: new Date().toISOString(),
      modified_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMessage]);
    const inputToSend = input.trim();
    setInput('');

    try {
      await sendMessage({
        id_conversation: parsedConvId,
        id_expediteur: user.id,
        id_destinataire: receiverId,
        contenu: inputToSend,
      });

      setMessages((prev) => prev.filter((msg) => msg.id_message !== tempMessage.id_message));
    } catch (err) {
      console.error('Erreur envoi message:', err);
      setMessages((prev) => prev.filter((msg) => msg.id_message !== tempMessage.id_message));
      setError('Erreur lors de l’envoi du message. Veuillez réessayer.');
    }
  };

  // Scroll to the latest message when keyboard opens or new messages arrive
  useEffect(() => {
    const keyboardDidShow = Keyboard.addListener('keyboardDidShow', () => {
      flatListRef.current?.scrollToEnd({ animated: true });
    });

    return () => {
      keyboardDidShow.remove();
    };
  }, []);

  const renderMessage = ({ item }: { item: Message }) => {
    const isCurrentUser = item.id_expediteur === user?.id;

    return (
      <View style={[styles.messageContainer, { justifyContent: isCurrentUser ? 'flex-end' : 'flex-start' }]}>
        <View
          style={[
            styles.messageBubble,
            { backgroundColor: isCurrentUser ? '#25D366' : '#F0F0F0' },
          ]}
        >
          <Text style={[styles.messageText, { color: isCurrentUser ? 'white' : '#000' }]}>
            {item.contenu}
          </Text>
          <View style={styles.messageFooter}>
            <Text style={[styles.messageTime, { color: isCurrentUser ? 'rgba(255,255,255,0.7)' : '#8E8E93' }]}>
              {new Date(item.date_envoi).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              })}
            </Text>
            {isCurrentUser && (
              <Text style={styles.messageStatus}>✓✓</Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (!convValid) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Conversation invalide ou introuvable.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    Alert.alert('Erreur', error, [{ text: 'OK', onPress: () => setError(null) }]);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <LucideArrowBigLeft color="white" size={24} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Discussion</Text>
          <Text style={styles.headerSubtitle}>Conversation #{parsedConvId}</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={insets.top + 60} // Adjust for header height (~60px)
      >
        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id_message}
          renderItem={renderMessage}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={false}
          initialNumToRender={15}
          maxToRenderPerBatch={10}
          windowSize={10}
          onContentSizeChange={() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }}
          onLayout={() => {
            flatListRef.current?.scrollToEnd({ animated: false });
          }}
        />

        {/* Input Area */}
        <View style={[styles.inputContainer, { paddingBottom: insets.bottom }]}>
          <View style={styles.textInputContainer}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Écrire un message..."
              placeholderTextColor="#8E8E93"
              multiline
              style={styles.textInput}
              maxLength={1000}
            />
          </View>
          <View style={styles.attachmentButton}>
            <MyImagePicker />
          </View>
          <TouchableOpacity
            onPress={handleSend}
            disabled={!input.trim()}
            style={[styles.sendButton, { backgroundColor: input.trim() ? '#25D366' : '#BDC3C7' }]}
          >
            <Text style={styles.sendButtonText}>↗</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F6F6F6' },
  header: {
    backgroundColor: '#25D366',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: { marginRight: 16, padding: 8, marginLeft: -8 },
  headerTextContainer: { flex: 1 },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: '600' },
  headerSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#8E8E93', fontSize: 18 },
  keyboardAvoidingView: { flex: 1 },
  messageList: { flex: 1, backgroundColor: '#F6F6F6' },
  messageListContent: { paddingVertical: 8, flexGrow: 1, justifyContent: 'flex-end' },
  messageContainer: { flexDirection: 'row', marginVertical: 2, marginHorizontal: 16 },
  messageBubble: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxWidth: '80%',
    minWidth: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  messageText: { fontSize: 16, lineHeight: 20 },
  messageFooter: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 4 },
  messageTime: { fontSize: 12, marginRight: 4 },
  messageStatus: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  inputContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingTop: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderTopWidth: 0.5,
    borderTopColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  textInputContainer: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
    minHeight: 44,
    justifyContent: 'center',
  },
  textInput: {
    fontSize: 16,
    lineHeight: 20,
    color: '#000',
    paddingVertical: 0,
    minHeight: 20,
    textAlignVertical: 'center',
  },
  attachmentButton: { marginRight: 8 },
  sendButton: {
    borderRadius: 25,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    transform: [{ rotate: '-45deg' }],
  },
});

export default ChatScreen;