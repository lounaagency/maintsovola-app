"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native"
import { MaterialIcons } from "@expo/vector-icons"
import { useRouter } from "expo-router"

interface Message {
  id: string
  text: string
  timestamp: Date
  isMe: boolean
  isRead?: boolean
  type?: "text" | "image" | "emoji"
}

interface Conversation {
  id: string
  name: string
  avatar: string
  lastMessage: string
  timestamp: string
  isOnline: boolean
  unreadCount: number
  messages: Message[]
}

interface MessengerScreenProps {
  activeConversation?: string | null
  onBack?: () => void
}

const { width: screenWidth, height: screenHeight } = Dimensions.get("window")

const MessengerScreen: React.FC<MessengerScreenProps> = ({ activeConversation, onBack }) => {
  const [conversations] = useState<Conversation[]>([
    {
      id: "1",
      name: "Admin Maintso Vola",
      avatar: "MV",
      lastMessage: "Votre terrain a été validé avec succès !",
      timestamp: "2min",
      isOnline: true,
      unreadCount: 2,
      messages: [
        {
          id: "1",
          text: "Bonjour ! Comment puis-je vous aider ?",
          timestamp: new Date(Date.now() - 3600000),
          isMe: false,
        },
        {
          id: "2",
          text: "Bonjour, j'aimerais savoir l'état de mon terrain",
          timestamp: new Date(Date.now() - 3500000),
          isMe: true,
        },
        {
          id: "3",
          text: "Laissez-moi vérifier pour vous...",
          timestamp: new Date(Date.now() - 3400000),
          isMe: false,
        },
        {
          id: "4",
          text: "Votre terrain a été validé avec succès ! 🎉",
          timestamp: new Date(Date.now() - 120000),
          isMe: false,
          isRead: false,
        },
        {
          id: "5",
          text: "Vous pouvez maintenant procéder aux démarches suivantes.",
          timestamp: new Date(Date.now() - 60000),
          isMe: false,
          isRead: false,
        },
      ],
    },
    {
      id: "2",
      name: "Support Technique",
      avatar: "ST",
      lastMessage: "L'application a été mise à jour",
      timestamp: "1h",
      isOnline: false,
      unreadCount: 0,
      messages: [
        {
          id: "1",
          text: "Bonjour ! L'application a été mise à jour avec de nouvelles fonctionnalités.",
          timestamp: new Date(Date.now() - 3600000),
          isMe: false,
        },
        {
          id: "2",
          text: "Merci pour l'information !",
          timestamp: new Date(Date.now() - 3500000),
          isMe: true,
        },
      ],
    },
    {
      id: "3",
      name: "Jean Rakoto",
      avatar: "JR",
      lastMessage: "Merci pour votre aide",
      timestamp: "3h",
      isOnline: true,
      unreadCount: 0,
      messages: [
        {
          id: "1",
          text: "Salut ! Tu peux m'aider avec mon terrain ?",
          timestamp: new Date(Date.now() - 10800000),
          isMe: false,
        },
        {
          id: "2",
          text: "Bien sûr ! Quel est le problème ?",
          timestamp: new Date(Date.now() - 10700000),
          isMe: true,
        },
        {
          id: "3",
          text: "Merci pour votre aide",
          timestamp: new Date(Date.now() - 10600000),
          isMe: false,
        },
      ],
    },
  ])

  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(
    activeConversation ? conversations.find((c) => c.id === activeConversation) || null : null,
  )
  const [messageText, setMessageText] = useState("")
  const [messages, setMessages] = useState<Message[]>(selectedConversation?.messages || [])
  const scrollViewRef = useRef<ScrollView>(null)
  const router = useRouter()

  useEffect(() => {
    if (selectedConversation) {
      setMessages(selectedConversation.messages)
    }
  }, [selectedConversation])

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true })
    }, 100)
  }, [messages])

  const sendMessage = () => {
    if (messageText.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: messageText.trim(),
        timestamp: new Date(),
        isMe: true,
        isRead: true,
      }
      setMessages([...messages, newMessage])
      setMessageText("")

      // Simulate response after 2 seconds
      setTimeout(() => {
        const responseMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "Message reçu ! Merci pour votre message.",
          timestamp: new Date(),
          isMe: false,
          isRead: false,
        }
        setMessages((prev) => [...prev, responseMessage])
      }, 2000)
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)

    if (minutes < 1) return "maintenant"
    if (minutes < 60) return `${minutes}min`
    if (hours < 24) return `${hours}h`
    return date.toLocaleDateString()
  }

  // Liste des conversations
  if (!selectedConversation) {
    return (
      <View className="flex-1 bg-white">
        {/* Header Messenger */}
        <View className="bg-white border-b border-gray-200 shadow-sm">
          <View className="flex-row items-center justify-between px-4 py-3" style={{ height: 56 }}>
            <View className="flex-row items-center">
              <TouchableOpacity onPress={onBack} className="mr-3">
                <MaterialIcons name="arrow-back" size={24} color="#050505" />
              </TouchableOpacity>
              <Text className="text-xl font-bold text-gray-900">Messenger</Text>
            </View>
            <View className="flex-row items-center">
              <TouchableOpacity className="w-10 h-10 rounded-full items-center justify-center mr-2">
                <MaterialIcons name="videocam" size={24} color="#050505" />
              </TouchableOpacity>
              <TouchableOpacity className="w-10 h-10 rounded-full items-center justify-center">
                <MaterialIcons name="edit" size={22} color="#050505" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Barre de recherche */}
        <View className="px-4 py-3 bg-white border-b border-gray-100">
          <View className="flex-row items-center bg-gray-100 rounded-full px-3 py-2">
            <MaterialIcons name="search" size={18} color="#8A8D91" />
            <TextInput
              className="flex-1 ml-2 text-gray-800"
              placeholder="Rechercher dans Messenger"
              placeholderTextColor="#8A8D91"
              style={{ fontSize: 14 }}
            />
          </View>
        </View>

        {/* Liste des conversations */}
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {conversations.map((conversation) => (
            <TouchableOpacity
              key={conversation.id}
              onPress={() => setSelectedConversation(conversation)}
              className="flex-row items-center px-4 py-3 border-b border-gray-50 active:bg-gray-50"
              activeOpacity={0.8}
            >
              {/* Avatar */}
              <View className="relative mr-3">
                <View className="w-14 h-14 rounded-full bg-blue-100 items-center justify-center">
                  <Text className="text-blue-600 font-bold text-lg">{conversation.avatar}</Text>
                </View>
                {conversation.isOnline && (
                  <View className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                )}
              </View>

              {/* Contenu */}
              <View className="flex-1">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="font-semibold text-gray-900" style={{ fontSize: 16 }}>
                    {conversation.name}
                  </Text>
                  <Text className="text-xs text-gray-500">{conversation.timestamp}</Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text
                    className={`flex-1 mr-2 ${conversation.unreadCount > 0 ? "font-semibold text-gray-900" : "text-gray-600"}`}
                    style={{ fontSize: 14 }}
                    numberOfLines={1}
                  >
                    {conversation.lastMessage}
                  </Text>
                  {conversation.unreadCount > 0 && (
                    <View className="w-5 h-5 bg-blue-600 rounded-full items-center justify-center">
                      <Text className="text-white font-bold" style={{ fontSize: 11 }}>
                        {conversation.unreadCount}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    )
  }

  // Vue de conversation individuelle
  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      {/* Header de conversation */}
      <View className="bg-white border-b border-gray-200 shadow-sm">
        <View className="flex-row items-center justify-between px-4 py-3" style={{ height: 56 }}>
          <View className="flex-row items-center flex-1">
            <TouchableOpacity onPress={() => setSelectedConversation(null)} className="mr-3">
              <MaterialIcons name="arrow-back" size={24} color="#050505" />
            </TouchableOpacity>
            <View className="relative mr-3">
              <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center">
                <Text className="text-blue-600 font-bold">{selectedConversation.avatar}</Text>
              </View>
              {selectedConversation.isOnline && (
                <View className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border border-white" />
              )}
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-gray-900" style={{ fontSize: 16 }}>
                {selectedConversation.name}
              </Text>
              <Text className="text-xs text-gray-500">{selectedConversation.isOnline ? "En ligne" : "Hors ligne"}</Text>
            </View>
          </View>
          <View className="flex-row items-center">
            <TouchableOpacity className="w-10 h-10 rounded-full items-center justify-center mr-2">
              <MaterialIcons name="call" size={22} color="#050505" />
            </TouchableOpacity>
            <TouchableOpacity className="w-10 h-10 rounded-full items-center justify-center mr-2">
              <MaterialIcons name="videocam" size={24} color="#050505" />
            </TouchableOpacity>
            <TouchableOpacity className="w-10 h-10 rounded-full items-center justify-center">
              <MaterialIcons name="info-outline" size={22} color="#050505" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 px-4 py-2"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {messages.map((message, index) => {
          const showTime = index === 0 || message.timestamp.getTime() - messages[index - 1].timestamp.getTime() > 300000 // 5 minutes

          return (
            <View key={message.id}>
              {showTime && (
                <View className="items-center my-2">
                  <Text className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {formatTime(message.timestamp)}
                  </Text>
                </View>
              )}
              <View className={`flex-row mb-2 ${message.isMe ? "justify-end" : "justify-start"}`}>
                {!message.isMe && (
                  <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-2 mt-auto">
                    <Text className="text-blue-600 font-bold text-xs">{selectedConversation.avatar}</Text>
                  </View>
                )}
                <View
                  className={`max-w-xs px-4 py-2 rounded-2xl ${
                    message.isMe ? "bg-blue-600 rounded-br-md" : "bg-gray-100 rounded-bl-md border border-gray-200"
                  }`}
                  style={{ maxWidth: screenWidth * 0.75 }}
                >
                  <Text
                    className={message.isMe ? "text-white" : "text-gray-900"}
                    style={{ fontSize: 15, lineHeight: 20 }}
                  >
                    {message.text}
                  </Text>
                </View>
                {message.isMe && (
                  <View className="ml-2 mt-auto">
                    <MaterialIcons
                      name={message.isRead ? "done-all" : "done"}
                      size={14}
                      color={message.isRead ? "#1877F2" : "#8A8D91"}
                    />
                  </View>
                )}
              </View>
            </View>
          )
        })}
      </ScrollView>

      {/* Zone de saisie */}
      <View className="bg-white border-t border-gray-200 px-4 py-3">
        <View className="flex-row items-end">
          <TouchableOpacity className="w-10 h-10 rounded-full items-center justify-center mr-2">
            <MaterialIcons name="add" size={24} color="#1877F2" />
          </TouchableOpacity>
          <TouchableOpacity className="w-10 h-10 rounded-full items-center justify-center mr-2">
            <MaterialIcons name="camera-alt" size={20} color="#1877F2" />
          </TouchableOpacity>
          <TouchableOpacity className="w-10 h-10 rounded-full items-center justify-center mr-2">
            <MaterialIcons name="image" size={20} color="#1877F2" />
          </TouchableOpacity>
          <View className="flex-1 flex-row items-end bg-gray-100 rounded-full px-4 py-2 mr-2">
            <TextInput
              className="flex-1 text-gray-900"
              placeholder="Tapez un message..."
              placeholderTextColor="#8A8D91"
              value={messageText}
              onChangeText={setMessageText}
              multiline
              style={{ fontSize: 15, maxHeight: 100 }}
            />
            <TouchableOpacity className="ml-2">
              <MaterialIcons name="emoji-emotions" size={20} color="#1877F2" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={sendMessage}
            className={`w-10 h-10 rounded-full items-center justify-center ${
              messageText.trim() ? "bg-blue-600" : "bg-gray-300"
            }`}
            disabled={!messageText.trim()}
          >
            <MaterialIcons name="send" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

export default MessengerScreen
