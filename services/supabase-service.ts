import { supabase } from '~/lib/data'; // Assurez-vous que le chemin est correct
import { Conversation, Message, MessageType } from '../types/message_types';


interface User {
  id_utilisateur: string;
  email: string;
  nom: string;
  prenom: string;
}

// interface Conversation {
//   id_conversation: string;
//   id_utilisateur1: string;
//   id_utilisateur2: string;
//   derniere_activite: string;
//   created_at: Date;
// }

interface SupabaseMessage {
  id_message: string;
  id_conversation: string;
  id_expediteur: string;
  id_destinateur: string;
  date_envoi: string;
  contenu: string;
  created_at: Date;
  created_by: Date;
  modified_at: Date;
  pirces_jointes: string[] | null;
  lu: boolean;
}

export class SupabaseMessageService {
  private currentUserId: string;

  constructor(currentUserId: string) {
    this.currentUserId = currentUserId;
  }

  // Récupérer toutes les conversations de l'utilisateur actuel
  async getConversations(): Promise<Conversation[]> {
    try {
      const { data: conversationsData, error } = await supabase
        .from('conversation')
        .select(`
          *,
          message (
            *,
            id_expediteur:id_expediteur (id, nom, ),
            id_destinateur:id_destinateur (id, nom, photo_de_profil)
          )
        `)
        .or(`id_utilisateur1.eq.${this.currentUserId},id_utilisateur2.eq.${this.currentUserId}`)
        .order('derniere_activite', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des conversations:', error);
        return [];
      }

      // Transformer les données Supabase en format de l'application
      const conversations: Conversation[] = await Promise.all(
        conversationsData.map(async (conv: any) => {
          // Récupérer les informations de l'autre utilisateur
          const otherUserId = conv.id_utilisateur1 === this.currentUserId 
            ? conv.id_utilisateur2 
            : conv.id_utilisateur1;

          const { data: otherUser } = await supabase
            .from('utilisateur')
            .select('*')
            .eq('id', otherUserId)
            .single();

          // Récupérer les messages de cette conversation
          const messages = await this.getMessagesForConversation(conv.id_conversation);
          
          // Calculer le nombre de messages non lus
          const unreadCount = messages.filter(msg => 
            msg.senderId !== this.currentUserId && !msg.isRead
          ).length;

          return {
            id: conv.id_conversation,
            participants: [
              {
                id: otherUserId,
                name: otherUser?.nom || 'Utilisateur inconnu',
                avatar: otherUser?.avatar || 'https://randomuser.me/api/portraits/men/1.jpg'
              },
              {
                id: this.currentUserId,
                name: 'Moi',
                avatar: 'https://randomuser.me/api/portraits/men/9.jpg'
              }
            ],
            lastMessage: messages[messages.length - 1] || {
              id: '',
              senderId: '',
              senderName: '',
              content: 'Aucun message',
              timestamp: conv.created_at,
              isRead: true,
              type: MessageType.TEXT
            },
            unreadCount,
            messages
          };
        })
      );

      return conversations;
    } catch (error) {
      console.error('Erreur lors de la récupération des conversations:', error);
      return [];
    }
  }

  // Récupérer les messages d'une conversation spécifique
  async getMessagesForConversation(conversationId: string): Promise<Message[]> {
    try {
      const { data: messagesData, error } = await supabase
        .from('message')
        .select(`
          *,
          expediteur:id_expediteur (id, nom, avatar)
        `)
        .eq('id_conversation', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erreur lors de la récupération des messages:', error);
        return [];
      }

      // Transformer les données Supabase en format de l'application
      const messages: Message[] = messagesData.map((msg: any) => ({
        id: msg.id_message,
        senderId: msg.id_expediteur,
        senderName: msg.expediteur?.nom || 'Utilisateur inconnu',
        content: msg.contenu,
        timestamp: msg.date_envoi || msg.created_at,
        isRead: msg.lu,
        type: MessageType.TEXT,
        attachments: msg.pirces_jointes ? msg.pirces_jointes.map((url: string, index: number) => ({
          id: `attachment_${index}`,
          type: 'file' as const,
          url,
          name: `Fichier ${index + 1}`,
          size: 0,
          mimeType: 'application/octet-stream'
        })) : undefined,
        reactions: []
      }));

      return messages;
    } catch (error) {
      console.error('Erreur lors de la récupération des messages:', error);
      return [];
    }
  }

  // Envoyer un nouveau message
  async sendMessage(conversationId: string, content: string, attachments?: string[]): Promise<Message | null> {
    try {
      // Récupérer les informations de la conversation pour obtenir l'ID du destinataire
      const { data: conversation, error: convError } = await supabase
        .from('conversation')
        .select('*')
        .eq('id_conversation', conversationId)
        .single();

      if (convError || !conversation) {
        console.error('Erreur lors de la récupération de la conversation:', convError);
        return null;
      }

      const destinataireId = conversation.id_utilisateur1 === this.currentUserId 
        ? conversation.id_utilisateur2 
        : conversation.id_utilisateur1;

      // Insérer le nouveau message
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert({
          id_conversation: conversationId,
          id_expediteur: this.currentUserId,
          id_destinateur: destinataireId,
          contenu: content,
          date_envoi: new Date().toISOString(),
          pirces_jointes: attachments || null,
          lu: false
        })
        .select()
        .single();

      if (messageError) {
        console.error('Erreur lors de l\'envoi du message:', messageError);
        return null;
      }

      // Mettre à jour la dernière activité de la conversation
      await supabase
        .from('conversations')
        .update({ derniere_activite: new Date().toISOString() })
        .eq('id_conversation', conversationId);

      // Récupérer les informations de l'utilisateur actuel
      const { data: currentUser } = await supabase
        .from('users')
        .select('nom')
        .eq('id', this.currentUserId)
        .single();

      // Retourner le message au format de l'application
      return {
        id: messageData.id_message,
        senderId: this.currentUserId,
        senderName: currentUser?.nom || 'Moi',
        content,
        timestamp: messageData.date_envoi || messageData.created_at,
        isRead: true,
        type: MessageType.TEXT,
        attachments: attachments ? attachments.map((url, index) => ({
          id: `attachment_${index}`,
          type: 'file' as const,
          url,
          name: `Fichier ${index + 1}`,
          size: 0,
          mimeType: 'application/octet-stream'
        })) : undefined,
        reactions: []
      };
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      return null;
    }
  }

  // Créer une nouvelle conversation
  async createConversation(otherUserId: string): Promise<Conversation | null> {
    try {
      // Vérifier si une conversation existe déjà entre ces deux utilisateurs
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('*')
        .or(`and(id_utilisateur1.eq.${this.currentUserId},id_utilisateur2.eq.${otherUserId}),and(id_utilisateur1.eq.${otherUserId},id_utilisateur2.eq.${this.currentUserId})`)
        .single();

      if (existingConv) {
        // Retourner la conversation existante
        const conversations = await this.getConversations();
        return conversations.find(conv => conv.id === existingConv.id_conversation) || null;
      }

      // Créer une nouvelle conversation
      const { data: newConv, error } = await supabase
        .from('conversations')
        .insert({
          id_utilisateur1: this.currentUserId,
          id_utilisateur2: otherUserId,
          derniere_activite: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création de la conversation:', error);
        return null;
      }

      // Récupérer les informations de l'autre utilisateur
      const { data: otherUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', otherUserId)
        .single();

      return {
        id: newConv.id_conversation,
        participants: [
          {
            id: otherUserId,
            name: otherUser?.nom || 'Utilisateur inconnu',
            avatar: otherUser?.avatar || 'https://randomuser.me/api/portraits/men/1.jpg'
          },
          {
            id: this.currentUserId,
            name: 'Moi',
            avatar: 'https://randomuser.me/api/portraits/men/9.jpg'
          }
        ],
        lastMessage: {
          id: '',
          senderId: '',
          senderName: '',
          content: 'Nouvelle conversation',
          timestamp: newConv.created_at,
          isRead: true,
          type: MessageType.TEXT
        },
        unreadCount: 0,
        messages: []
      };
    } catch (error) {
      console.error('Erreur lors de la création de la conversation:', error);
      return null;
    }
  }

  // Marquer les messages comme lus
  async markMessagesAsRead(conversationId: string): Promise<void> {
    try {
      await supabase
        .from('message')
        .update({ lu: true })
        .eq('id_conversation', conversationId)
        .eq('id_destinateur', this.currentUserId);
    } catch (error) {
      console.error('Erreur lors du marquage des messages comme lus:', error);
    }
  }

  // S'abonner aux nouveaux messages en temps réel
  subscribeToMessages(conversationId: string, onNewMessage: (message: Message) => void) {
    return supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `id_conversation=eq.${conversationId}`
        },
        async (payload) => {
          const newMessageData = payload.new as SupabaseMessage;
          
          // Récupérer les informations de l'expéditeur
          const { data: sender } = await supabase
            .from('usutilisateur')
            .select('nom')
            .eq('id', newMessageData.id_expediteur)
            .single();

          const message: Message = {
            id: newMessageData.id_message,
            senderId: newMessageData.id_expediteur,
            senderName: sender?.nom || 'Utilisateur inconnu',
            content: newMessageData.contenu,
            timestamp: newMessageData.date_envoi || newMessageData.created_at.toString(),
            isRead: newMessageData.lu,
            type: MessageType.TEXT,
            attachments: newMessageData.pirces_jointes ? newMessageData.pirces_jointes.map((url, index) => ({
              id: `attachment_${index}`,
              type: 'file' as const,
              url,
              name: `Fichier ${index + 1}`,
              size: 0,
              mimeType: 'application/octet-stream'
            })) : undefined,
            reactions: []
          };

          onNewMessage(message);
        }
      )
      .subscribe();
  }


  subscribeToConversations(onConversationUpdate: () => void) {
    return supabase
      .channel('conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        () => {
          onConversationUpdate();
        }
      )
      .subscribe();
  }
}

