"use client"

import { useState, useEffect } from "react"
import { supabase } from "~/lib/data" // Assurez-vous que le chemin est correct
import type { Message, ConversationWithUser } from "../types/messaging"

// Vous devez configurer votre client Supabase
const supabaseClient = supabase // Remplacez par votre client Supabase configuré

export const useMessaging = (currentUserId: string, conversationId?: string) => {
  const [conversations, setConversations] = useState<ConversationWithUser[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  // Récupérer les conversations
  const fetchConversations = async () => {
    try {
      const { data: conversationsData, error } = await supabaseClient
        .from("conversations")
        .select(`
          *,
          user1:users!conversations_id_utilisateur1_fkey(*),
          user2:users!conversations_id_utilisateur2_fkey(*)
        `)
        .or(`id_utilisateur1.eq.${currentUserId},id_utilisateur2.eq.${currentUserId}`)
        .order("derniere_activite", { ascending: false })

      if (error) throw error

      const conversationsWithUsers: ConversationWithUser[] =
        conversationsData?.map((conv) => ({
          ...conv,
          other_user: conv.id_utilisateur1 === currentUserId ? conv.user2 : conv.user1,
        })) || []

      setConversations(conversationsWithUsers)
    } catch (error) {
      console.error("Erreur lors de la récupération des conversations:", error)
    } finally {
      setLoading(false)
    }
  }

  // Récupérer les messages d'une conversation
  const fetchMessages = async (convId: string) => {
    try {
      const { data, error } = await supabaseClient
        .from("messages")
        .select("*")
        .eq("id_conversation", convId)
        .order("created_at", { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error("Erreur lors de la récupération des messages:", error)
    }
  }

  // Envoyer un message
  const sendMessage = async (convId: string, content: string, recipientId: string) => {
    try {
      const messageData = {
        id_conversation: convId,
        id_expediteur: currentUserId,
        id_destinateur: recipientId,
        contenu: content,
        date_envoi: new Date().toISOString(),
        lu: false,
        pieces_jointes: null,
      }

      const { data, error } = await supabaseClient.from("messages").insert([messageData]).select().single()

      if (error) throw error

      // Mettre à jour la dernière activité
      await supabaseClient
        .from("conversations")
        .update({ derniere_activite: new Date().toISOString() })
        .eq("id_conversation", convId)

      return data
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error)
      throw error
    }
  }

  // Marquer les messages comme lus
  const markMessagesAsRead = async (convId: string) => {
    try {
      await supabaseClient
        .from("messages")
        .update({ lu: true })
        .eq("id_conversation", convId)
        .eq("id_destinateur", currentUserId)
    } catch (error) {
      console.error("Erreur lors du marquage des messages comme lus:", error)
    }
  }

  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId)
      markMessagesAsRead(conversationId)

      // Écouter les nouveaux messages en temps réel
      const messagesSubscription = supabaseClient
        .channel(`messages:${conversationId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `id_conversation=eq.${conversationId}`,
          },
          (payload) => {
            fetchMessages(conversationId)
          },
        )
        .subscribe()

      return () => {
        messagesSubscription.unsubscribe()
      }
    } else {
      fetchConversations()
    }
  }, [currentUserId, conversationId])

  return {
    conversations,
    messages,
    loading,
    sendMessage,
    markMessagesAsRead,
    refreshConversations: fetchConversations,
    refreshMessages: () => conversationId && fetchMessages(conversationId),
    fetchMessages,
  }
}

export default useMessaging