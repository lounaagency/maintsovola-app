
import { supabase } from "../../integrations/supabase/client";
import { Message, Conversation } from "../../types/message";
import { useAuth } from "../../contexts/AuthContext";
import { useEffect } from "react";

export const createConversation = async (userId1: string, userId2: string) => {
  try {
    // Vérifier si une conversation existe déjà
    const { data: existingConversation, error: fetchError } = await supabase
      .from('conversation')
      .select('*')
      .or(`and(id_utilisateur1.eq.${userId1},id_utilisateur2.eq.${userId2}),and(id_utilisateur1.eq.${userId2},id_utilisateur2.eq.${userId1})`)
      .maybeSingle();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }
    
    if (existingConversation) {
      return existingConversation;
    }
    
    // Créer une nouvelle conversation
    const { data, error } = await supabase
      .from('conversation')
      .insert({
        id_utilisateur1: userId1,
        id_utilisateur2: userId2,
        derniere_activite: new Date().toISOString()
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Erreur lors de la création de la conversation:', error);
    throw error;
  }
};

export const sendMessage = async (message: Message) => {
  try {
    // Envoyer le message
    const { data, error } = await supabase
      .from('message')
      .insert({
        id_conversation: message.id_conversation,
        id_expediteur: message.id_expediteur,
        id_destinataire: message.id_destinataire,
        contenu: message.contenu,
        date_envoi: new Date().toISOString(),
        lu: false,
        pieces_jointes: message.pieces_jointes || null
      })
      .select()
      .single();
      
    if (error) throw error;
    
    // Mettre à jour la dernière activité de la conversation
    await updateConversationActivity(message.id_conversation);
    
    return data;
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error);
    throw error;
  }
};

export const getMessages = async (conversationId: number) => {
  try {
    const { data, error } = await supabase
      .from('message')
      .select(`
        *,
        expediteur:id_expediteur(id_utilisateur, nom, prenoms, photo_profil),
        destinataire:id_destinataire(id_utilisateur, nom, prenoms, photo_profil)
      `)
      .eq('id_conversation', conversationId)
      .order('date_envoi', { ascending: true });
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error);
    throw error;
  }
};

export const getConversations = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('conversation')
      .select(`
        *,
        utilisateur1:id_utilisateur1(id_utilisateur, nom, prenoms, photo_profil),
        utilisateur2:id_utilisateur2(id_utilisateur, nom, prenoms, photo_profil)
      `)
      .or(`id_utilisateur1.eq.${userId},id_utilisateur2.eq.${userId}`)
      .order('derniere_activite', { ascending: false });
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des conversations:', error);
    throw error;
  }
};

export const markMessagesAsRead = async (conversationId: number, userId: string) => {
  try {
    // First, count how many unread messages there are
    const { count } = await supabase
      .from('message')
      .select('*', { count: 'exact', head: true })
      .eq('id_conversation', conversationId)
      .eq('id_destinataire', userId)
      .eq('lu', false);
      
    if (!count || count === 0) return 0;
    
    // Then mark them as read
    const { error } = await supabase
      .from('message')
      .update({ lu: true })
      .eq('id_conversation', conversationId)
      .eq('id_destinataire', userId)
      .eq('lu', false);
      
    if (error) throw error;
    
    return count;
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};

export const updateConversationActivity = async (conversationId: number) => {
  try {
    const { error } = await supabase
      .from('conversation')
      .update({ derniere_activite: new Date().toISOString() })
      .eq('id_conversation', conversationId);
      
    if (error) throw error;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'activité de la conversation:', error);
    throw error;
  }
};

export const useGetMessagesRealTime = (conversationId: number, callback: (messages: any[]) => void) => {
  const { user } = useAuth();
  
  useEffect(() => {
    if (!conversationId || !user) return;
    
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'message',
        filter: `id_conversation=eq.${conversationId}`
      }, (payload) => {
        getMessages(conversationId).then(messages => {
          if (messages) {
            callback(messages);
            
            // Marquer les messages comme lus si l'utilisateur est le destinataire
            if (payload.new.id_destinataire === user.id) {
              markMessagesAsRead(conversationId, user.id);
            }
          }
        });
      })
      .subscribe();
    
    // Charger les messages initiaux
    getMessages(conversationId).then(messages => {
      if (messages) {
        callback(messages);
        // Marquer les messages comme lus
        markMessagesAsRead(conversationId, user.id);
      }
    });
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, user, callback]);
};

/**
 * Create a conversation between two users if it doesn't already exist
 * @param userId1 - First user ID
 * @param userId2 - Second user ID
 * @returns The conversation ID
 */
export const createConversationIfNotExists = async (
  userId1: string,
  userId2: string
): Promise<number | null> => {
  try {
    // Check if conversation already exists
    const { data: existingConversation, error: findError } = await supabase
      .from("conversation")
      .select("id_conversation")
      .or(`and(id_utilisateur1.eq.${userId1},id_utilisateur2.eq.${userId2}),and(id_utilisateur1.eq.${userId2},id_utilisateur2.eq.${userId1})`)
      .maybeSingle();

    if (findError && findError.code !== 'PGRST116') {
      console.error("Error checking for existing conversation:", findError);
      return null;
    }

    // Return existing conversation if found
    if (existingConversation) {
      return existingConversation.id_conversation;
    }

    // Create new conversation if not found
    const { data: newConversation, error: insertError } = await supabase
      .from("conversation")
      .insert({
        id_utilisateur1: userId1,
        id_utilisateur2: userId2,
        derniere_activite: new Date().toISOString()
      })
      .select("id_conversation")
      .single();

    if (insertError) {
      console.error("Error creating conversation:", insertError);
      return null;
    }

    return newConversation.id_conversation;
  } catch (error) {
    console.error("Error in createConversationIfNotExists:", error);
    return null;
  }
};
