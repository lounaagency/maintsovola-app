import { supabase } from '~/lib/data';
import { Conversation, Message, MessageType, Participant } from '../types/message_types';

// Interface pour un utilisateur de la base de données
export interface DatabaseUser {
  id_utilisateur: string;
  nom: string;
  prenoms: string;
  photo_profil: string;
  email?: string;
}

export class SupabaseMessageService {
  private currentUserId: string;
  private userCache: Map<string, DatabaseUser> = new Map();
  private isDebug = process.env.NODE_ENV === 'development';

  constructor(currentUserId: string) {
    this.currentUserId = currentUserId;
    this.log('SupabaseMessageService initialized with userId:', currentUserId);
  }

  private log(...args: any[]) {
    if (this.isDebug) {
      console.log(...args);
    }
  }

  // Méthode pour récupérer ou mettre en cache les données d'un utilisateur
  private async getCachedUser(userId: string): Promise<DatabaseUser> {
    if (this.userCache.has(userId)) {
      this.log(`Cache hit for user ${userId}`);
      return this.userCache.get(userId)!;
    }

    this.log(`Fetching user ${userId} from database`);
    const { data, error } = await supabase
      .from('utilisateur')
      .select('id_utilisateur, nom, prenoms, photo_profil, email')
      .eq('id_utilisateur', userId)
      .maybeSingle();

    if (error || !data) {
      this.log(`Error fetching user ${userId}:`, error?.message);
      const defaultUser: DatabaseUser = {
        id_utilisateur: userId,
        nom: 'Inconnu',
        prenoms: '',
        photo_profil: 'https://randomuser.me/api/portraits/men/1.jpg',
        email: '',
      };
      this.userCache.set(userId, defaultUser);
      return defaultUser;
    }

    this.userCache.set(userId, data);
    return data;
  }

  // Retrieve all users from the database (excluding current user)
  async getAllUsers(): Promise<DatabaseUser[]> {
    this.log('👥 getAllUsers called, excluding userId:', this.currentUserId);

    try {
      const { data: usersData, error } = await supabase
        .from('utilisateur')
        .select('id_utilisateur, nom, prenoms, photo_profil, email')
        .neq('id_utilisateur', this.currentUserId)
        .order('prenoms', { ascending: true });

      if (error) {
        this.log('❌ Error fetching users:', error.message, error.details);
        return [];
      }

      if (!usersData || usersData.length === 0) {
        this.log('⚠️ No users found in database');
        return [];
      }

      this.log('✅ Users data retrieved:', usersData.length, 'users');
      usersData.forEach((user) => this.userCache.set(user.id_utilisateur, user));
      return usersData;
    } catch (error) {
      this.log('💥 Unexpected error in getAllUsers:', error);
      return [];
    }
  }

  // Search users by name or email
  async searchUsers(searchQuery: string): Promise<DatabaseUser[]> {
    this.log('🔍 searchUsers called with query:', searchQuery);

    if (!searchQuery || searchQuery.trim().length < 2) {
      this.log('⚠️ Search query too short, returning empty array');
      return [];
    }

    try {
      const query = searchQuery.trim().toLowerCase();

      const { data: usersData, error } = await supabase
        .from('utilisateur')
        .select('id_utilisateur, nom, prenoms, photo_profil, email')
        .neq('id_utilisateur', this.currentUserId)
        .or(`prenoms.ilike.%${query}%,nom.ilike.%${query}%,email.ilike.%${query}%`)
        .order('prenoms', { ascending: true })
        .limit(20);

      if (error) {
        this.log('❌ Error searching users:', error.message, error.details);
        return [];
      }

      if (!usersData || usersData.length === 0) {
        this.log('⚠️ No users found for search query:', searchQuery);
        return [];
      }

      this.log('✅ Search results:', usersData.length, 'users found');
      usersData.forEach((user) => this.userCache.set(user.id_utilisateur, user));
      return usersData;
    } catch (error) {
      this.log('💥 Unexpected error in searchUsers:', error);
      return [];
    }
  }

  // Get users that don't have existing conversations with current user
  async getAvailableContacts(searchQuery?: string): Promise<DatabaseUser[]> {
    this.log('📞 getAvailableContacts called with query:', searchQuery);

    try {
      const allUsers = searchQuery ? await this.searchUsers(searchQuery) : await this.getAllUsers();

      if (allUsers.length === 0) {
        return [];
      }

      const conversations = await this.getConversations();
      const existingContactIds = new Set(
        conversations.flatMap((conv) =>
          conv.participants.filter((p) => p.id !== this.currentUserId).map((p) => p.id)
        )
      );

      const availableContacts = allUsers.filter((user) => !existingContactIds.has(user.id_utilisateur));

      this.log('✅ Available contacts:', availableContacts.length, 'out of', allUsers.length, 'users');
      return availableContacts;
    } catch (error) {
      this.log('💥 Unexpected error in getAvailableContacts:', error);
      return [];
    }
  }

  // Retrieve all conversations for the current user
  async getConversations(): Promise<Conversation[]> {
    this.log('📋 getConversations called for userId:', this.currentUserId);

    try {
      const { data: conversationsData, error } = await supabase
        .from('conversation')
        .select('*')
        .or(`id_utilisateur1.eq.${this.currentUserId},id_utilisateur2.eq.${this.currentUserId}`)
        .order('derniere_activite', { ascending: false });

      if (error) {
        this.log('❌ Error fetching conversations:', error.message, error.details);
        return [];
      }

      if (!conversationsData || conversationsData.length === 0) {
        this.log('⚠️ No conversations found for user:', this.currentUserId);
        return [];
      }

      this.log('✅ Conversations data retrieved:', conversationsData.length, 'conversations');

      const conversations: Conversation[] = [];
      for (const conv of conversationsData) {
        const processedConversation = await this.processConversation(conv);
        if (processedConversation) {
          conversations.push(processedConversation);
        }
      }

      this.log('🎉 Final conversations array:', conversations.length, 'conversations processed');
      return conversations;
    } catch (error) {
      this.log('💥 Unexpected error in getConversations:', error);
      return [];
    }
  }

  // Helper method to process a conversation
  private async processConversation(conv: any): Promise<Conversation | null> {
    try {
      const user1 = await this.getCachedUser(conv.id_utilisateur1);
      const user2 = await this.getCachedUser(conv.id_utilisateur2);

      const otherParticipantData = user1.id_utilisateur === this.currentUserId ? user2 : user1;

      const otherParticipant: Participant = {
        id: otherParticipantData.id_utilisateur,
        name: `${otherParticipantData.prenoms || ''} ${otherParticipantData.nom || ''}`.trim() || 'Utilisateur inconnu',
        avatar: otherParticipantData.photo_profil || 'https://randomuser.me/api/portraits/men/1.jpg',
      };

      const currentParticipant: Participant = {
        id: this.currentUserId,
        name: 'Moi',
        avatar: user1.id_utilisateur === this.currentUserId ? user1.photo_profil : 'https://randomuser.me/api/portraits/men/9.jpg',
      };

      let lastMessage: Message = {
        id: '',
        conversationId: conv.id_conversation,
        senderId: '',
        content: 'Aucun message',
        timestamp: conv.created_at,
        isRead: true,
        isDelivered: true,
        type: MessageType.TEXT,
      };

      const messages = await this.getMessagesForConversation(conv.id_conversation);
      if (messages.length > 0) {
        lastMessage = messages[messages.length - 1];
      }

      const processedConversation: Conversation = {
        id: conv.id_conversation,
        participants: [otherParticipant, currentParticipant],
        lastMessage,
        unreadCount: 0,
        isArchived: false,
        isMuted: false,
        createdAt: conv.created_at,
        updatedAt: conv.derniere_activite || conv.created_at,
        messages: [],
      };

      this.log(`✅ Processed conversation ${conv.id_conversation}:`, processedConversation);
      return processedConversation;
    } catch (error) {
      this.log(`❌ Error in processConversation for conversation ${conv.id_conversation}:`, error);
      return null;
    }
  }

  // Retrieve a specific conversation by its ID
  async getConversationById(conversationId: string): Promise<Conversation | null> {
    this.log('📋 getConversationById called with ID:', conversationId);

    try {
      const { data: convData, error } = await supabase
        .from('conversation')
        .select('*')
        .eq('id_conversation', conversationId)
        .maybeSingle();

      if (error || !convData) {
        this.log('❌ Error in getConversationById:', error?.message, error?.details);
        return null;
      }

      const user1 = await this.getCachedUser(convData.id_utilisateur1);
      const user2 = await this.getCachedUser(convData.id_utilisateur2);

      const participants: Participant[] = [
        {
          id: user1.id_utilisateur,
          name: `${user1.prenoms || ''} ${user1.nom || ''}`.trim() || 'Utilisateur inconnu',
          avatar: user1.photo_profil || 'https://randomuser.me/api/portraits/men/1.jpg',
        },
        {
          id: user2.id_utilisateur,
          name: `${user2.prenoms || ''} ${user2.nom || ''}`.trim() || 'Utilisateur inconnu',
          avatar: user2.photo_profil || 'https://randomuser.me/api/portraits/men/1.jpg',
        },
      ];

      const messages = await this.getMessagesForConversation(conversationId);
      const unreadCount = messages.filter((msg) => msg.senderId !== this.currentUserId && !msg.isRead).length;

      const conversation: Conversation = {
        id: convData.id_conversation,
        participants,
        lastMessage: messages[messages.length - 1] || {
          id: '',
          conversationId: convData.id_conversation,
          senderId: '',
          content: 'Aucun message',
          timestamp: convData.created_at,
          isRead: true,
          isDelivered: true,
          type: MessageType.TEXT,
        },
        unreadCount,
        isArchived: false,
        isMuted: false,
        createdAt: convData.created_at,
        updatedAt: convData.derniere_activite || convData.created_at,
        messages,
      };

      return conversation;
    } catch (error) {
      this.log('💥 Unexpected error in getConversationById:', error);
      return null;
    }
  }

  // Retrieve messages for a specific conversation
  async getMessagesForConversation(conversationId: string): Promise<Message[]> {
    this.log('💬 getMessagesForConversation called for:', conversationId);

    try {
      const { data: messagesData, error } = await supabase
        .from('message')
        .select('*')
        .eq('id_conversation', conversationId)
        .order('date_envoi', { ascending: true });

      if (error) {
        this.log('❌ Error fetching messages:', error.message, error.details);
        return [];
      }

      if (!messagesData || messagesData.length === 0) {
        this.log('⚠️ No messages found for conversation:', conversationId);
        return [];
      }

      const messages: Message[] = messagesData.map((msg: any) => ({
        id: msg.id_message,
        conversationId: msg.id_conversation,
        senderId: msg.id_expediteur,
        content: msg.contenu,
        timestamp: msg.date_envoi || msg.created_at,
        isRead: msg.lu,
        isDelivered: true,
        type: MessageType.TEXT,
        attachments: msg.pieces_jointes
          ? msg.pieces_jointes.map((url: string, index: number) => ({
              id: `attachment_${index}`,
              type: 'file' as const,
              url,
              name: `Fichier ${index + 1}`,
              size: 0,
              mimeType: 'application/octet-stream',
            }))
          : undefined,
        reactions: [],
      }));

      this.log('✅ Messages processed:', messages.length);
      return messages;
    } catch (error) {
      this.log('💥 Unexpected error in getMessagesForConversation:', error);
      return [];
    }
  }

  // Send a new message
  async sendMessage(conversationId: string, content: string, attachments?: string[]): Promise<Message | null> {
    this.log('📤 sendMessage called:', { conversationId, content, attachments });

    try {
      const { data: conversation, error: convError } = await supabase
        .from('conversation')
        .select('id_utilisateur1, id_utilisateur2')
        .eq('id_conversation', conversationId)
        .maybeSingle();

      if (convError || !conversation) {
        this.log('❌ Error fetching conversation for message send:', convError?.message, convError?.details);
        return null;
      }

      const destinataireId = conversation.id_utilisateur1 === this.currentUserId ? conversation.id_utilisateur2 : conversation.id_utilisateur1;

      const { data: messageData, error: messageError } = await supabase
        .from('message')
        .insert({
          id_conversation: conversationId,
          id_expediteur: this.currentUserId,
          id_destinataire: destinataireId,
          contenu: content,
          date_envoi: new Date().toISOString(),
          pieces_jointes: attachments || null,
          lu: false,
        })
        .select()
        .maybeSingle();

      if (messageError) {
        this.log('❌ Error sending message:', messageError.message, messageError.details);
        return null;
      }

      await supabase
        .from('conversation')
        .update({ derniere_activite: new Date().toISOString() })
        .eq('id_conversation', conversationId);

      return {
        id: messageData.id_message,
        conversationId: messageData.id_conversation,
        senderId: messageData.id_expediteur,
        content: messageData.contenu,
        timestamp: messageData.date_envoi || messageData.created_at,
        isRead: messageData.lu,
        isDelivered: true,
        type: MessageType.TEXT,
        attachments: messageData.pieces_jointes
          ? messageData.pieces_jointes.map((url: string, index: number) => ({
              id: `attachment_${index}`,
              type: 'file' as const,
              url,
              name: `Fichier ${index + 1}`,
              size: 0,
              mimeType: 'application/octet-stream',
            }))
          : undefined,
        reactions: [],
      };
    } catch (error) {
      this.log('💥 Unexpected error in sendMessage:', error);
      return null;
    }
  }

  // Create a new conversation
  async createConversation(otherUserId: string): Promise<Conversation | null> {
    this.log('➕ createConversation called with otherUserId:', otherUserId);

    try {
      const { data: userExists, error: userError } = await supabase
        .from('utilisateur')
        .select('id_utilisateur')
        .eq('id_utilisateur', otherUserId)
        .maybeSingle();

      if (userError || !userExists) {
        this.log(`❌ User with id ${otherUserId} does not exist`);
        return null;
      }

      const { data: existingConv } = await supabase
        .from('conversation')
        .select('id_conversation')
        .or(`and(id_utilisateur1.eq.${this.currentUserId},id_utilisateur2.eq.${otherUserId}),and(id_utilisateur1.eq.${otherUserId},id_utilisateur2.eq.${this.currentUserId})`)
        .maybeSingle();

      if (existingConv) {
        this.log('✅ Existing conversation found:', existingConv.id_conversation);
        return this.getConversationById(existingConv.id_conversation);
      }

      const { data: newConv, error } = await supabase
        .from('conversation')
        .insert({
          id_utilisateur1: this.currentUserId,
          id_utilisateur2: otherUserId,
          derniere_activite: new Date().toISOString(),
        })
        .select('*')
        .maybeSingle();

      if (error || !newConv) {
        this.log('❌ Error creating conversation:', error?.message, error?.details);
        return null;
      }

      const user1 = await this.getCachedUser(this.currentUserId);
      const user2 = await this.getCachedUser(otherUserId);

      const participants: Participant[] = [
        {
          id: user1.id_utilisateur,
          name: `${user1.prenoms || ''} ${user1.nom || ''}`.trim() || 'Moi',
          avatar: user1.photo_profil || 'https://randomuser.me/api/portraits/men/9.jpg',
        },
        {
          id: user2.id_utilisateur,
          name: `${user2.prenoms || ''} ${user2.nom || ''}`.trim() || 'Utilisateur inconnu',
          avatar: user2.photo_profil || 'https://randomuser.me/api/portraits/men/1.jpg',
        },
      ];

      const newConversation: Conversation = {
        id: newConv.id_conversation,
        participants,
        lastMessage: {
          id: '',
          conversationId: newConv.id_conversation,
          senderId: '',
          content: 'Nouvelle conversation créée',
          timestamp: newConv.created_at,
          isRead: true,
          isDelivered: true,
          type: MessageType.TEXT,
        },
        unreadCount: 0,
        isArchived: false,
        isMuted: false,
        createdAt: newConv.created_at,
        updatedAt: newConv.derniere_activite,
        messages: [],
      };

      this.log('✅ New conversation created:', newConversation);
      return newConversation;
    } catch (error) {
      this.log('💥 Unexpected error in createConversation:', error);
      return null;
    }
  }

  // Mark messages as read
  async markMessagesAsRead(conversationId: string): Promise<void> {
    this.log('📖 markMessagesAsRead called for conversation:', conversationId);

    try {
      const { error } = await supabase
        .from('message')
        .update({ lu: true })
        .eq('id_conversation', conversationId)
        .eq('id_destinataire', this.currentUserId)
        .neq('id_expediteur', this.currentUserId);

      if (error) {
        this.log('❌ Error marking messages as read:', error.message, error.details);
      } else {
        this.log('✅ Messages marked as read for conversation:', conversationId);
      }
    } catch (error) {
      this.log('💥 Unexpected error in markMessagesAsRead:', error);
    }
  }

  // Add reaction to message
  async addReactionToMessage(messageId: string, userId: string, emoji: string): Promise<void> {
    this.log('😀 addReactionToMessage called:', { messageId, userId, emoji });
    // Placeholder for reaction functionality
  }

  // Remove reaction from message
  async removeReactionFromMessage(messageId: string, userId: string, emoji: string): Promise<void> {
    this.log('😐 removeReactionFromMessage called:', { messageId, userId, emoji });
    // Placeholder for reaction functionality
  }

  // Subscribe to conversations updates
  subscribeToConversations(callback: (conversations: Conversation[]) => void) {
    this.log('🔔 subscribeToConversations called');

    const subscription = supabase
      .channel('conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversation',
          filter: `or(id_utilisateur1.eq.${this.currentUserId},id_utilisateur2.eq.${this.currentUserId})`,
        },
        async () => {
          this.log('🔔 Conversation change detected');
          const updatedConversations = await this.getConversations();
          callback(updatedConversations);
        }
      )
      .subscribe();

    return subscription;
  }

  // Subscribe to messages updates
  subscribeToMessages(conversationId: string, callback: (message: Message) => void) {
    this.log('🔔 subscribeToMessages called for conversation:', conversationId);

    const subscription = supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'message',
          filter: `id_conversation=eq.${conversationId}`,
        },
        (payload) => {
          this.log('📨 New message received:', payload);
          const msg = payload.new as any;
          const message: Message = {
            id: msg.id_message,
            conversationId: msg.id_conversation,
            senderId: msg.id_expediteur,
            content: msg.contenu,
            timestamp: msg.date_envoi || msg.created_at,
            isRead: msg.lu,
            isDelivered: true,
            type: MessageType.TEXT,
            attachments: msg.pieces_jointes
              ? msg.pieces_jointes.map((url: string, index: number) => ({
                  id: `attachment_${index}`,
                  type: 'file' as const,
                  url,
                  name: `Fichier ${index + 1}`,
                  size: 0,
                  mimeType: 'application/octet-stream',
                }))
              : undefined,
            reactions: [],
          };
          callback(message);
        }
      )
      .subscribe();

    return subscription;
  }
}
