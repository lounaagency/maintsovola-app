"use client"

import { useEffect, useState } from "react"
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Alert, ActivityIndicator } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { supabase } from "~/lib/data"

interface Message {
  id: string
  sender: string
  content: string
  time: string
  isNew: boolean
  avatar?: string
  senderId?: string
}

interface Conversation {
  id: string
  name: string
  lastMessage: string
  time: string
  unreadCount: number
  avatar?: string
  messages: Message[]
  otherUserId?: string
}

// Interfaces exactes de votre base de données
interface Sms {
  id_message: string
  id_conversation: string
  id_expediteur: string
  id_destinataire: string
  contenu: string
  date_envoi: string
  lu: boolean
  created_at: Date
  created_by: string
  modified_at: Date
  pieces_jointes: string[]
}

interface Conversations {
  id_conversation: string
  id_utilisateur1: string
  id_utilisateur2: string
  created_at: Date
  derniere_activite: Date
}

interface User {
  id_utilisateur: string
  nom?: string
  prenom?: string
  email?: string
}

const MessengerScreen = () => {
  const router = useRouter()
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [showNewMessageModal, setShowNewMessageModal] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)

  // États pour les données Supabase (utilisant vos interfaces exactes)
  const [supabaseConversations, setSupabaseConversations] = useState<Conversations[]>([])
  const [supabaseMessages, setSupabaseMessages] = useState<Sms[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [currentUserId, setCurrentUserId] = useState<string>("")

  // État pour les conversations formatées
  const [conversations, setConversations] = useState<Conversation[]>([])

  useEffect(() => {
    initializeData()
  }, [])

  const initializeData = async () => {
    setLoading(true)
    try {
      // Récupérer l'utilisateur actuel
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setCurrentUserId(user.id)
      }

      // Récupérer toutes les données en parallèle
      await Promise.all([fetchConversations(), fetchMessages(), fetchUsers()])
    } catch (error) {
      console.error("Erreur lors de l'initialisation:", error)
      Alert.alert("Erreur", "Impossible de charger les données")
    } finally {
      setLoading(false)
    }
  }

  const fetchConversations = async () => {
    try {
      console.log("Fetching conversations for user:", currentUserId)
      const { data, error } = await supabase
        .from("conversation") // Nom de votre table
        .select("*")
        // .where("id_utilisateur1", "eq", currentUserId)
        // .or("id_utilisateur2", "eq", currentUserId)
        .order("derniere_activite", { ascending: false })

      if (error) {
        console.error("Erreur lors de la récupération des conversations:", error)

        return
      }
      console.log("Conversations récupérées:", JSON.stringify(data))
      // Conversion des données avec vos champs exacts
      const formattedData: Conversations[] = (data || []).map((item: any) => ({
        id_conversation: item.id_conversation,
        id_utilisateur1: item.id_utilisateur1,
        id_utilisateur2: item.id_utilisateur2,
        created_at: new Date(item.created_at),
        derniere_activite: new Date(item.derniere_activite),
      }))

      setSupabaseConversations(formattedData)
      console.log("Conversations récupérées:", formattedData.length)
    } catch (error) {
      console.error("Erreur fetchConversations:", error)
    }
  }

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("message") // Nom de votre table
        .select("*")
        .order("date_envoi", { ascending: true })

      if (error) {
        console.error("Erreur lors de la récupération des messages:", error)
        return
      }

      // Conversion des données avec vos champs exacts
      const formattedData: Sms[] = (data || []).map((item: any) => ({
        id_message: item.id_message,
        id_conversation: item.id_conversation,
        id_expediteur: item.id_expediteur,
        id_destinataire: item.id_destinataire,
        contenu: item.contenu,
        date_envoi: item.date_envoi,
        lu: item.lu,
        created_at: new Date(item.created_at),
        created_by: item.created_by,
        modified_at: new Date(item.modified_at),
        pieces_jointes: item.pieces_jointes || [],
      }))

      setSupabaseMessages(formattedData)
      console.log("Messages récupérés:", formattedData.length)
    } catch (error) {
      console.error("Erreur fetchMessages:", error)
    }
  }

  const fetchUsers = async () => {
    try {
      // Ajustez le nom de la table selon votre schéma
      const { data, error } = await supabase.from("utilisateur").select("id_utilisateur, nom, prenoms, email")

      if (error) {
        console.error("Erreur lors de la récupération des utilisateurs:", error)
        return
      }

      setUsers(data)

      console.log("Utilisateurs récupérés:", data?.length)
    } catch (error) {
      console.error("Erreur fetchUsers:", error)
    }
  }

  // Formater les données Supabase en conversations utilisables
  useEffect(() => {
    if (supabaseConversations.length > 0 && currentUserId) {
      formatConversations()
    }
  }, [supabaseConversations, supabaseMessages, users, currentUserId])

  const formatConversations = () => {
    const formattedConversations: Conversation[] = supabaseConversations.map((conv) => {
      // Déterminer l'autre utilisateur dans la conversation
      const otherUserId = conv.id_utilisateur1 === currentUserId ? conv.id_utilisateur2 : conv.id_utilisateur1

      const otherUser = users.find((u) => u.id_utilisateur === otherUserId)
      const userName = otherUser
        ? `${otherUser.prenom || ""} ${otherUser.nom || ""}`.trim() || otherUser.email || "Utilisateur"
        : "Utilisateur inconnu"

      // Récupérer les messages de cette conversation
      const conversationMessages = supabaseMessages
        .filter((msg) => msg.id_conversation === conv.id_conversation)
        .map((msg) => {
          const sender = msg.id_expediteur === currentUserId ? "Vous" : userName
          const senderUser = users.find((u) => u.id_utilisateur === msg.id_expediteur)

          return {
            id: msg.id_message,
            sender,
            content: msg.contenu,
            time: formatTime(new Date(msg.date_envoi)),
            isNew: !msg.lu && msg.id_expediteur !== currentUserId,
            senderId: msg.id_expediteur,
            avatar: senderUser?.nom?.charAt(0) || userName.charAt(0) || "U",
          }
        })

      // Calculer les messages non lus
      const unreadCount = conversationMessages.filter((msg) => msg.isNew && msg.senderId !== currentUserId).length

      // Dernier message
      const lastMessage = conversationMessages[conversationMessages.length - 1]

      return {
        id: conv.id_conversation,
        name: userName,
        lastMessage: lastMessage?.content || "Aucun message",
        time: lastMessage ? lastMessage.time : formatTime(conv.derniere_activite),
        unreadCount,
        messages: conversationMessages,
        otherUserId,
        avatar: userName.charAt(0).toUpperCase(),
      }
    })

    setConversations(formattedConversations)
  }

  const formatTime = (date: Date): string => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "À l'instant"
    if (minutes < 60) return `il y a ${minutes}min`
    if (hours < 24) return `il y a ${hours}h`
    if (days < 7) return `il y a ${days}j`
    return date.toLocaleDateString()
  }

  const handleSendMessage = async (conversationId: string) => {
    if (newMessage.trim() === "" || !currentUserId) return

    setSendingMessage(true)
    try {
      const conversation = supabaseConversations.find((c) => c.id_conversation === conversationId)
      if (!conversation) return

      const otherUserId =
        conversation.id_utilisateur1 === currentUserId ? conversation.id_utilisateur2 : conversation.id_utilisateur1

      const now = new Date().toISOString()

      // Insérer le message dans Supabase avec vos champs exacts
      const { data, error } = await supabase
        .from("message")
        .insert({
          id_conversation: conversationId,
          id_expediteur: currentUserId,
          id_destinataire: otherUserId,
          contenu: newMessage.trim(),
          date_envoi: now,
          lu: false,
          created_by: currentUserId,
          modified_at: now,
          pieces_jointes: [],
        })
        .select()
        .single()

      if (error) {
        console.error("Erreur lors de l'envoi du message:", error)
        Alert.alert("Erreur", "Impossible d'envoyer le message")
        return
      }

      // Mettre à jour la dernière activité de la conversation
      await supabase.from("conversation").update({ derniere_activite: now }).eq("id_conversation", conversationId)

      // Actualiser les données
      await fetchMessages()
      await fetchConversations()
      setNewMessage("")
    } catch (error) {
      console.error("Erreur handleSendMessage:", error)
      Alert.alert("Erreur", "Impossible d'envoyer le message")
    } finally {
      setSendingMessage(false)
    }
  }

  const markConversationAsRead = async (conversationId: string) => {
    try {
      // Marquer tous les messages non lus de cette conversation comme lus
      const { error } = await supabase
        .from("message")
        .update({
          lu: true,
          modified_at: new Date().toISOString(),
        })
        .eq("id_conversation", conversationId)
        .eq("id_destinataire", currentUserId)
        .eq("lu", false)

      if (error) {
        console.error("Erreur lors du marquage comme lu:", error)
        return
      }

      // Actualiser les messages
      await fetchMessages()
    } catch (error) {
      console.error("Erreur markConversationAsRead:", error)
    }
  }

  const is_sender = (message: Message): boolean => {
    return message.sender === "Vous"
  }

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#10B981" />
        <Text className="mt-4 text-gray-600">Chargement des conversations...</Text>
      </View>
    )
  }

  const renderConversationList = () => (
    <ScrollView className="flex-1 bg-gray-50 w-full">
      <View className="w-full p-4 bg-white">
        <View className="flex-row w-full justify-between items-center mb-4">
          <Text className="text-2xl font-bold text-gray-800">Messages</Text>
          <TouchableOpacity className="bg-green-500 rounded-full p-2" onPress={() => setShowNewMessageModal(true)}>
            <MaterialIcons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {conversations.length === 0 ? (
          <View className="items-center py-8">
            <MaterialIcons name="chat-bubble-outline" size={64} color="#9CA3AF" />
            <Text className="text-gray-500 mt-4 text-center">Aucune conversation pour le moment</Text>
          </View>
        ) : (
          conversations.map((conversation) => (
            <TouchableOpacity
              key={conversation.id}
              className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-100"
              onPress={() => {
                setSelectedConversation(conversation.id)
                markConversationAsRead(conversation.id)
              }}
            >
              <View className="flex-row items-center">
                <View className="w-12 h-12 bg-green-500 rounded-full justify-center items-center mr-3">
                  <Text className="text-white font-bold text-lg">{conversation.avatar}</Text>
                </View>
                <View className="flex-1">
                  <View className="flex-row justify-between items-center mb-1">
                    <Text className="font-semibold text-gray-800 text-base">{conversation.name}</Text>
                    <Text className="text-xs text-gray-500">{conversation.time}</Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-gray-600 text-sm flex-1" numberOfLines={1}>
                      {conversation.lastMessage}
                    </Text>
                    {conversation.unreadCount > 0 && (
                      <View className="bg-red-500 rounded-full min-w-5 h-5 justify-center items-center ml-2">
                        <Text className="text-white text-xs font-bold">{conversation.unreadCount}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  )

  const renderConversationDetail = () => {
    const conversation = conversations.find((c) => c.id === selectedConversation)
    if (!conversation) return null

    return (
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center p-4 border-b border-gray-200 bg-white">
          <TouchableOpacity className="mr-3" onPress={() => setSelectedConversation(null)}>
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <View className="w-10 h-10 bg-green-500 rounded-full justify-center items-center mr-3">
            <Text className="text-white font-bold">{conversation.avatar}</Text>
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-gray-800 text-lg">{conversation.name}</Text>
            <Text className="text-gray-500 text-sm">En ligne</Text>
          </View>
        </View>

        {/* Messages */}
        <ScrollView className="flex-1 p-4">
          {conversation.messages.length === 0 ? (
            <View className="flex-1 justify-center items-center py-8">
              <MaterialIcons name="chat-bubble-outline" size={48} color="#9CA3AF" />
              <Text className="text-gray-500 mt-4 text-center">Aucun message dans cette conversation</Text>
            </View>
          ) : (
            conversation.messages.map((message) => (
              <View key={message.id} className={`mb-4 ${message.sender === "Vous" ? "items-end" : "items-start"}`}>
                <View
                  className={`max-w-4/5 p-3 rounded-lg ${message.sender === "Vous" ? "bg-green-500" : "bg-gray-200"}`}
                >
                  <Text className={`text-sm ${message.sender === "Vous" ? "text-white" : "text-gray-800"}`}>
                    {message.content}
                  </Text>
                </View>
                {!is_sender(message) && (
                  <View className="flex-row items-center relative mt-1">
                    <View className="w-6 h-6 bg-gray-400 rounded-full justify-center items-center">
                      <Text className="text-white text-xs font-bold">{message.avatar}</Text>
                    </View>
                  </View>
                )}
                <Text className="text-xs text-gray-500 mt-1">{message.time}</Text>
              </View>
            ))
          )}
        </ScrollView>

        {/* Input de message */}
        <View className="flex-row items-center p-4 border-t border-gray-200">
          <TextInput
            className={`flex-1 border rounded-full px-4 py-3 mr-3 ${
              isFocused ? "border-green-500" : "border-gray-300"
            }`}
            placeholder="Tapez votre message..."
            placeholderTextColor="#9ca3af"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            editable={!sendingMessage}
          />
          <TouchableOpacity
            className={`rounded-full p-2 ${sendingMessage ? "bg-gray-400" : "bg-green-500"}`}
            onPress={() => handleSendMessage(conversation.id)}
            disabled={sendingMessage || newMessage.trim() === ""}
          >
            {sendingMessage ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <MaterialIcons name="send" size={20} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-white w-full">
      {selectedConversation ? renderConversationDetail() : renderConversationList()}

      {/* Modal nouveau message */}
      <Modal
        visible={showNewMessageModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowNewMessageModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="bg-white rounded-lg w-4/5 p-6">
            <Text className="text-lg font-bold mb-4">Nouveau message</Text>
            <Text className="text-gray-600 mb-4">Cette fonctionnalité sera bientôt disponible.</Text>
            <TouchableOpacity className="bg-green-500 rounded-lg p-3" onPress={() => setShowNewMessageModal(false)}>
              <Text className="text-white text-center font-semibold">Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

export default MessengerScreen
