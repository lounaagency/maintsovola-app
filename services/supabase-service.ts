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

  constructor(currentUserId: string) {
    this.currentUserId = currentUserId;
    console.log('SupabaseMessageService initialized with userId:', currentUserId);
  }

  // Retrieve all users from the database (excluding current user)
  async getAllUsers(): Promise<DatabaseUser[]> {
    console.log('👥 getAllUsers called, excluding userId:', this.currentUserId);
    
    try {
      const { data: usersData, error } = await supabase
        .from('utilisateur')
        .select('id_utilisateur, nom, prenoms, photo_profil, email')
        .neq('id_utilisateur', this.currentUserId)
        .order('prenoms', { ascending: true });

      if (error) {
        console.error('❌ Error fetching users:', error.message, error.details);
        return [];
      }

      if (!usersData || usersData.length === 0) {
        console.warn('⚠️ No users found in database');
        return [];
      }

      console.log('✅ Users data retrieved:', usersData.length, 'users');
      return usersData;

    } catch (error) {
      console.error('💥 Unexpected error in getAllUsers:', error);
      return [];
    }
  }

  // Search users by name or email
  async searchUsers(searchQuery: string): Promise<DatabaseUser[]> {
    console.log('🔍 searchUsers called with query:', searchQuery);
    
    if (!searchQuery || searchQuery.trim().length < 2) {
      console.warn('⚠️ Search query too short, returning empty array');
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
        .limit(20); // Limiter les résultats pour les performances

      if (error) {
        console.error('❌ Error searching users:', error.message, error.details);
        return [];
      }

      if (!usersData || usersData.length === 0) {
        console.log('⚠️ No users found for search query:', searchQuery);
        return [];
      }

      console.log('✅ Search results:', usersData.length, 'users found');
      return usersData;

    } catch (error) {
      console.error('💥 Unexpected error in searchUsers:', error);
      return [];
    }
  }

  // Get users that don't have existing conversations with current user
  async getAvailableContacts(searchQuery?: string): Promise<DatabaseUser[]> {
    console.log('📞 getAvailableContacts called with query:', searchQuery);
    
    try {
      // Récupérer tous les utilisateurs (ou les résultats de recherche)
      const allUsers = searchQuery 
        ? await this.searchUsers(searchQuery)
        : await this.getAllUsers();

      if (allUsers.length === 0) {
        return [];
      }

      // Récupérer les conversations existantes pour filtrer les contacts déjà en conversation
      const conversations = await this.getConversations();
      const existingContactIds = new Set(
        conversations.flatMap(conv => 
          conv.participants
            .filter(p => p.id !== this.currentUserId)
            .map(p => p.id)
        )
      );

      // Filtrer les utilisateurs qui n'ont pas de conversation existante
      const availableContacts = allUsers.filter(user => 
        !existingContactIds.has(user.id_utilisateur)
      );

      console.log('✅ Available contacts:', availableContacts.length, 'out of', allUsers.length, 'users');
      return availableContacts;

    } catch (error) {
      console.error('💥 Unexpected error in getAvailableContacts:', error);
      return [];
    }
  }

  // Retrieve all conversations for the current user
  async getConversations(): Promise<Conversation[]> {
    console.log('📋 getConversations called for userId:', this.currentUserId);
    
    try {
      const { data: conversationsData, error } = await supabase
        .from('conversation')
        .select('*')
        .or(`id_utilisateur1.eq.${this.currentUserId},id_utilisateur2.eq.${this.currentUserId}`)
        .order('derniere_activite', { ascending: false });

      if (error) {
        console.error('❌ Error fetching conversations:', error.message, error.details);
        return [];
      }

      if (!conversationsData || conversationsData.length === 0) {
        console.warn('⚠️ No conversations found for user:', this.currentUserId);
        return [];
      }

      console.log('✅ Conversations data retrieved:', conversationsData.length, 'conversations');

      const conversations: Conversation[] = [];
      for (const conv of conversationsData) {
        const processedConversation = await this.processConversation(conv);
        if (processedConversation) {
          conversations.push(processedConversation);
        }
      }

      console.log('🎉 Final conversations array:', conversations.length, 'conversations processed');
      return conversations;

    } catch (error) {
      console.error('💥 Unexpected error in getConversations:', error);
      return [];
    }
  }

  // Helper method to process a conversation
  private async processConversation(conv: any): Promise<Conversation | null> {

    try {
      // Fetch user data for both participants
      const { data: user1Data, error: user1Error } = await supabase
        .from('utilisateur')
        .select('id_utilisateur, nom, prenoms, photo_profil')
        .eq('id_utilisateur', conv.id_utilisateur1)
        .maybeSingle(); // Use maybeSingle to handle no results gracefully

      const { data: user2Data, error: user2Error } = await supabase
        .from('utilisateur')
        .select('id_utilisateur, nom, prenoms, photo_profil')
        .eq('id_utilisateur', conv.id_utilisateur2)
        .maybeSingle();

      // Log errors but proceed with defaults if user data is missing
      if (user1Error) {
        console.error(`❌ Error fetching user1 data (${conv.id_utilisateur1}):`, user1Error.message, user1Error.details);
      }
      if (user2Error) {
        console.error(`❌ Error fetching user2 data (${conv.id_utilisateur2}):`, user2Error.message, user2Error.details);
      }

      // Use default values if user data is missing
      const user1 = user1Data || {
        id_utilisateur: conv.id_utilisateur1,
        nom: 'Inconnu',
        prenoms: '',
        photo_profil: 'https://randomuser.me/api/portraits/men/1.jpg',
      };
      const user2 = user2Data || {
        id_utilisateur: conv.id_utilisateur2,
        nom: 'Inconnu',
        prenoms: '',
        photo_profil: 'https://randomuser.me/api/portraits/men/1.jpg',
      };

      const otherParticipantData = user1.id_utilisateur === this.currentUserId ? user2 : user1;

      const otherParticipant: Participant = {
        id: otherParticipantData.id_utilisateur,
        name: `${otherParticipantData.prenoms || ''} ${otherParticipantData.nom || ''}`.trim() || 'Utilisateur inconnu',
        avatar: otherParticipantData.photo_profil || 'https://randomuser.me/api/portraits/men/1.jpg',
      };

      const currentParticipant: Participant = {
        id: this.currentUserId,
        name: 'Moi',
        avatar: 'https://randomuser.me/api/portraits/men/9.jpg',
      };

      // Fetch the last message
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

      console.log(`✅ Processed conversation ${conv.id_conversation}:`, processedConversation);
      return processedConversation;

    } catch (error) {
      console.error(`❌ Error in processConversation for conversation ${conv.id_conversation}:`, error);
      return null;
    }
  }

  // Retrieve a specific conversation by its ID
  async getConversationById(conversationId: string): Promise<Conversation | null> {
    console.log('📋 getConversationById called with ID:', conversationId);
    
    try {
      const { data: convData, error } = await supabase
        .from('conversation')
        .select('*')
        .eq('id_conversation', conversationId)
        .maybeSingle();

      if (error || !convData) {
        console.error('❌ Error in getConversationById:', error?.message, error?.details);
        return null;
      }

      const { data: user1Data, error: user1Error } = await supabase
        .from('utilisateur')
        .select('id_utilisateur, nom, prenoms, photo_profil')
        .eq('id_utilisateur', convData.id_utilisateur1)
        .maybeSingle();

      const { data: user2Data, error: user2Error } = await supabase
        .from('utilisateur')
        .select('id_utilisateur, nom, prenoms, photo_profil')
        .eq('id_utilisateur', convData.id_utilisateur2)
        .maybeSingle();

      if (user1Error) {
        console.error(`❌ Error fetching user1 data (${convData.id_utilisateur1}):`, user1Error.message, user1Error.details);
      }
      if (user2Error) {
        console.error(`❌ Error fetching user2 data (${convData.id_utilisateur2}):`, user2Error.message, user2Error.details);
      }

      const user1 = user1Data || {
        id_utilisateur: convData.id_utilisateur1,
        nom: 'Inconnu',
        prenoms: '',
        photo_profil: 'https://randomuser.me/api/portraits/men/1.jpg',
      };
      const user2 = user2Data || {
        id_utilisateur: convData.id_utilisateur2,
        nom: 'Inconnu',
        prenoms: '',
        photo_profil: 'https://randomuser.me/api/portraits/men/1.jpg',
      };

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
      const unreadCount = messages.filter(msg => msg.senderId !== this.currentUserId && !msg.isRead).length;

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
      console.error('💥 Unexpected error in getConversationById:', error);
      return null;
    }
  }

  // Retrieve messages for a specific conversation
  async getMessagesForConversation(conversationId: string): Promise<Message[]> {
    console.log('💬 getMessagesForConversation called for:', conversationId);
    
    try {
      const { data: messagesData, error } = await supabase
        .from('message')
        .select('*')
        .eq('id_conversation', conversationId)
        .order('date_envoi', { ascending: true });

      if (error) {
        console.error('❌ Error fetching messages:', error.message, error.details);
        return [];
      }

      if (!messagesData || messagesData.length === 0) {
        console.log('⚠️ No messages found for conversation:', conversationId);
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
        attachments: msg.pieces_jointes ? msg.pieces_jointes.map((url: string, index: number) => ({
          id: `attachment_${index}`,
          type: 'file' as const,
          url,
          name: `Fichier ${index + 1}`,
          size: 0,
          mimeType: 'application/octet-stream',
        })) : undefined,
        reactions: [],
      }));

      console.log('✅ Messages processed:', messages.length);
      return messages;
    } catch (error) {
      console.error('💥 Unexpected error in getMessagesForConversation:', error);
      return [];
    }
  }

  // Send a new message
  async sendMessage(conversationId: string, content: string, attachments?: string[]): Promise<Message | null> {
    console.log('📤 sendMessage called:', { conversationId, content, attachments });
    
    try {
      const { data: conversation, error: convError } = await supabase
        .from('conversation')
        .select('id_utilisateur1, id_utilisateur2')
        .eq('id_conversation', conversationId)
        .maybeSingle();

      if (convError || !conversation) {
        console.error('❌ Error fetching conversation for message send:', convError?.message, convError?.details);
        return null;
      }

      const destinataireId = conversation.id_utilisateur1 === this.currentUserId 
        ? conversation.id_utilisateur2 
        : conversation.id_utilisateur1;

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
        console.error('❌ Error sending message:', messageError.message, messageError.details);
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
        attachments: messageData.pieces_jointes ? messageData.pieces_jointes.map((url: string, index: number) => ({
          id: `attachment_${index}`,
          type: 'file' as const,
          url,
          name: `Fichier ${index + 1}`,
          size: 0,
          mimeType: 'application/octet-stream',
        })) : undefined,
        reactions: [],
      };
    } catch (error) {
      console.error('💥 Unexpected error in sendMessage:', error);
      return null;
    }
  }

  // Create a new conversation

  async createConversation(otherUserId: string): Promise<Conversation | null> {
    console.log('➕ createConversation called with otherUserId:', otherUserId);

    try {
        // Check if otherUserId exists in utilisateur table
        const { data: userExists, error: userError } = await supabase
            .from('utilisateur')
            .select('id_utilisateur')
            .eq('id_utilisateur', otherUserId)
            .maybeSingle();

        if (userError || !userExists) {
            console.error(`❌ User with id ${otherUserId} does not exist`);
            return null;
        }

        // Check for existing conversation
        const { data: existingConv } = await supabase
            .from('conversation')
            .select('id_conversation')
            .or(`and(id_utilisateur1.eq.${this.currentUserId},id_utilisateur2.eq.${otherUserId}),and(id_utilisateur1.eq.${otherUserId},id_utilisateur2.eq.${this.currentUserId})`)
            .maybeSingle();

        if (existingConv) {
            console.log('✅ Existing conversation found:', existingConv.id_conversation);
            return this.getConversationById(existingConv.id_conversation);
        }

        // Proceed with creating new conversation
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
            console.log("NEW CONV: ", JSON.stringify(newConv));
            console.error('❌ Error creating conversation:', error?.message, error?.details);
            return null;
        }

        // Fetch user data
        const { data: user1Data, error: user1Error } = await supabase
            .from('utilisateur')
            .select('id_utilisateur, nom, prenoms, photo_profil')
            .eq('id_utilisateur', this.currentUserId)
            .maybeSingle();

        const { data: user2Data, error: user2Error } = await supabase
            .from('utilisateur')
            .select('id_utilisateur, nom, prenoms, photo_profil')
            .eq('id_utilisateur', otherUserId)
            .maybeSingle();

        if (user1Error) {
            console.error(`❌ Error fetching user1 data (${this.currentUserId}):`, user1Error.message, user1Error.details);
        }
        if (user2Error) {
            console.error(`❌ Error fetching user2 data (${otherUserId}):`, user2Error.message, user2Error.details);
        }

        const user1 = user1Data || {
            id_utilisateur: this.currentUserId,
            nom: 'Inconnu',
            prenoms: '',
            photo_profil: 'https://randomuser.me/api/portraits/men/9.jpg',
        };
        const user2 = user2Data || {
            id_utilisateur: otherUserId,
            nom: 'Inconnu',
            prenoms: '',
            photo_profil: 'https://randomuser.me/api/portraits/men/1.jpg',
        };

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

        console.log('✅ New conversation object created:', newConversation);
        return newConversation;
    } catch (error) {
        console.error('💥 Unexpected error in createConversation:', error);
        return null;
    }
}
  // Mark messages as read
  async markMessagesAsRead(conversationId: string): Promise<void> {
    console.log('📖 markMessagesAsRead called for conversation:', conversationId);
    
    try {
      const { error } = await supabase
        .from('message')
        .update({ lu: true })
        .eq('id_conversation', conversationId)
        .eq('id_destinataire', this.currentUserId)
        .neq('id_expediteur', this.currentUserId);

      if (error) {
        console.error('❌ Error marking messages as read:', error.message, error.details);
      } else {
        console.log('✅ Messages marked as read for conversation:', conversationId);
      }
    } catch (error) {
      console.error('💥 Unexpected error in markMessagesAsRead:', error);
    }
  }

  // Add reaction to message
  async addReactionToMessage(messageId: string, userId: string, emoji: string): Promise<void> {
    console.log('😀 addReactionToMessage called:', { messageId, userId, emoji });
    // Implementation would depend on your database schema for reactions
    // This is a placeholder for the reaction functionality
  }

  // Remove reaction from message
  async removeReactionFromMessage(messageId: string, userId: string, emoji: string): Promise<void> {
    console.log('😐 removeReactionFromMessage called:', { messageId, userId, emoji });
    // Implementation would depend on your database schema for reactions
    // This is a placeholder for the reaction functionality
  }

  // Subscribe to conversations updates
  subscribeToConversations(callback: () => void) {
    console.log('🔔 subscribeToConversations called');
    
    const subscription = supabase
      .channel('conversations')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'conversation',
          filter: `or(id_utilisateur1.eq.${this.currentUserId},id_utilisateur2.eq.${this.currentUserId})`
        }, 
        callback
      )
      .subscribe();

    return subscription;
  }

  // Subscribe to messages updates
  subscribeToMessages(conversationId: string, callback: (message: Message) => void) {
    console.log('🔔 subscribeToMessages called for conversation:', conversationId);
    
    const subscription = supabase
      .channel(`messages-${conversationId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'message',
          filter: `id_conversation=eq.${conversationId}`
        }, 
        (payload) => {
          console.log('📨 New message received:', payload);
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
            attachments: msg.pieces_jointes ? msg.pieces_jointes.map((url: string, index: number) => ({
              id: `attachment_${index}`,
              type: 'file' as const,
              url,
              name: `Fichier ${index + 1}`,
              size: 0,
              mimeType: 'application/octet-stream',
            })) : undefined,
            reactions: [],
          };
          callback(message);
        }
      )
      .subscribe();

    return subscription;
  }
}
