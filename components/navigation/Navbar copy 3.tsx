"use client"

import type React from "react"
import { useState } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
  TouchableWithoutFeedback,
  Image,
} from "react-native"
import { useRouter } from "expo-router"
import { MaterialIcons } from "@expo/vector-icons"

interface NavItem {
  name: string
  type: "text" | "icon" | "profile"
  id: string
}

interface Notification {
  id: string
  title: string
  description: string
  time: string
  isNew: boolean
}

interface Message {
  id: string
  sender: string
  content: string
  time: string
  isNew: boolean
}

interface NavbarProps {
  activeNavIcon?: string
  onNavChange?: (navId: string) => void
}

const { width: screenWidth } = Dimensions.get("window")

const Navbar: React.FC<NavbarProps> = ({ activeNavIcon = "home", onNavChange }) => {
  const [currentActiveIcon, setCurrentActiveIcon] = useState<string>(activeNavIcon)
  const [showNotifications, setShowNotifications] = useState<boolean>(false)
  const [showProfile, setShowProfile] = useState<boolean>(false)
  const router = useRouter()

  // Données simulées pour les notifications
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "Nouveau terrain",
      description: 'Un nouveau terrain "misa" a été ajouté en attente de validation',
      time: "il y a 7 heures",
      isNew: true,
    },
    {
      id: "2",
      title: "Nouveau terrain",
      description: 'Un nouveau terrain "Fonenana Clément manova 1" a été ajouté en attente de validation',
      time: "il y a 1 mois",
      isNew: true,
    },
    {
      id: "3",
      title: "Nouveau terrain",
      description: 'Un nouveau terrain "test" a été ajouté en attente de validation',
      time: "il y a 1 mois",
      isNew: true,
    },
    {
      id: "4",
      title: "Validation terminée",
      description: 'Votre terrain "Parcelle 123" a été validé avec succès',
      time: "il y a 2 jours",
      isNew: false,
    },
    {
      id: "5",
      title: "Mise à jour système",
      description: "Une nouvelle version de l'application est disponible",
      time: "il y a 3 jours",
      isNew: false,
    },
  ])

  // Données simulées pour les messages
  const [messages] = useState<Message[]>([
    {
      id: "1",
      sender: "Admin",
      content: "Votre terrain a été validé",
      time: "il y a 2 heures",
      isNew: true,
    },
    {
      id: "2",
      sender: "Support",
      content: "Bienvenue sur Maintso Vola",
      time: "il y a 1 jour",
      isNew: true,
    },
    {
      id: "3",
      sender: "Système",
      content: "Maintenance programmée ce soir",
      time: "il y a 2 jours",
      isNew: false,
    },
  ])

  const navItems: NavItem[] = [
    // { name: "M", type: "text", id: "menu" },
    { name: "home", type: "icon", id: "home" },
    { name: "location-on", type: "icon", id: "location" },
    { name: "description", type: "icon", id: "projet" },
    { name: "chat", type: "icon", id: "messages" },
    { name: "notifications", type: "icon", id: "notifications" },
    { name: "RANALISOLOFO...", type: "profile", id: "profile" },
  ]

  // Compteurs dynamiques
  const notificationCount = notifications.filter((n) => n.isNew).length
  const messageCount = messages.filter((m) => m.isNew).length

  const handleNavIconPress = (iconId: string): void => {
    setCurrentActiveIcon(iconId)
    onNavChange?.(iconId)

    switch (iconId) {
      case "menu":
        router.push("/feed")
        break
      case "home":
        router.push("/feed")
        break
      case "profile":
        setShowProfile(true)
        break
      case "messages":
        router.push("/messages")
        console.log("Ouvrir les messages")
        break
      case "notifications":
        setShowNotifications(true)
        break
      case "location":
        router.push("/terrain")
        console.log("Navigation vers location")
        break
      case "projet":
        router.push("/projet")
        console.log("Navigation vers projet")
        break
      default:
        console.log("Navigation vers:", iconId)
    }
  }

  // Fonction pour marquer une notification comme lue
  const markNotificationAsRead = (notificationId: string) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) =>
        notification.id === notificationId ? { ...notification, isNew: false } : notification,
      ),
    )
  }

  // Fonction pour marquer toutes les notifications comme lues
  const markAllNotificationsAsRead = () => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) => ({
        ...notification,
        isNew: false,
      })),
    )
  }

  const renderBadge = (count: number) => {
    if (count === 0) return null
    return (
      <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-5 h-5 justify-center items-center border-2 border-white shadow-sm">
        <Text className="text-white text-xs font-bold">{count > 99 ? "99+" : count.toString()}</Text>
      </View>
    )
  }

  const renderNavIcon = (item: NavItem) => {
    const isActive = currentActiveIcon === item.id || (item.type === "profile" && currentActiveIcon === "profile")

    return (
      <View key={item.id} className="flex-1 items-center justify-center py-2 relative  border-gray-200">
        {/* Indicateur actif */}
        {isActive && (
          <View className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-green-500 rounded-b-full" />
        )}

        <TouchableOpacity
          className={`items-center justify-center p-2 rounded-lg  ${isActive ? "bg-green-50" : ""}`}
          onPress={() => handleNavIconPress(item.id)}
          activeOpacity={0.7}
        >
          {item.type === "text" && (
            <View className="w-10 h-10 rounded-full justify-center items-center bg-gray-100 shadow-sm">
              <Image
                source={require("../../assets/maintsovola_logo_pm.png")}
                style={{ width: 32, height: 32, borderRadius: 16 }}
              />
            </View>
          )}

          {item.type === "icon" && (
            <View className="relative ">
              <MaterialIcons name={item.name as any} size={26} color={isActive ? "#22c55e" : "#65676B"} />
              {item.id === "notifications" && renderBadge(notificationCount)}
              {item.id === "messages" && renderBadge(messageCount)}
            </View>
          )}

          {item.type === "profile" && (
            <View
              className={`w-10 h-10 rounded-full justify-center items-center ${isActive ? "bg-green-100 border-2 border-green-500" : "bg-gray-100"}`}
            >
              <MaterialIcons name="person" size={22} color={isActive ? "#22c55e" : "#65676B"} />
            </View>
          )}
        </TouchableOpacity>
      </View>
    )
  }

  const NotificationPopup = () => (
    <Modal
      visible={showNotifications}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowNotifications(false)}
    >
      <TouchableWithoutFeedback onPress={() => setShowNotifications(false)}>
        <View className="flex-1 bg-black/50 justify-end">
          <TouchableWithoutFeedback>
            <View className="bg-white rounded-t-3xl shadow-2xl" style={{ maxHeight: "80%" }}>
              {/* Header amélioré */}
              <View className="flex-row justify-between items-center p-5 border-b border-gray-100">
                <Text className="text-xl font-bold text-gray-900">Notifications</Text>
                <TouchableOpacity
                  onPress={() => setShowNotifications(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
                >
                  <MaterialIcons name="close" size={20} color="#666666" />
                </TouchableOpacity>
              </View>

              {/* Bouton "Marquer tout comme lu" amélioré */}
              {notificationCount > 0 && (
                <View className="px-5 py-3 border-b border-gray-50">
                  <TouchableOpacity
                    className="flex-row items-center justify-center py-3 px-4 bg-green-50 border border-green-200 rounded-xl"
                    onPress={markAllNotificationsAsRead}
                  >
                    <MaterialIcons name="done-all" size={18} color="#22c55e" />
                    <Text className="text-green-500 ml-2 font-semibold">Marquer tout comme lu</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Liste des notifications améliorée */}
              <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {notifications.length === 0 ? (
                  <View className="items-center justify-center py-16">
                    <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-4">
                      <MaterialIcons name="notifications-none" size={32} color="#9CA3AF" />
                    </View>
                    <Text className="text-gray-500 text-lg font-medium">Aucune notification</Text>
                    <Text className="text-gray-400 text-sm mt-1">Vous êtes à jour !</Text>
                  </View>
                ) : (
                  notifications.map((notification) => (
                    <TouchableOpacity
                      key={notification.id}
                      className={`flex-row p-4 border-b border-gray-50 ${notification.isNew ? "bg-green-25" : ""}`}
                      onPress={() => markNotificationAsRead(notification.id)}
                      activeOpacity={0.7}
                    >
                      <View className="w-12 h-12 rounded-full bg-green-100 items-center justify-center mr-3">
                        <MaterialIcons name="terrain" size={20} color="#22c55e" />
                      </View>

                      <View className="flex-1">
                        <Text
                          className={`text-base font-semibold mb-1 ${notification.isNew ? "text-gray-900" : "text-gray-600"}`}
                        >
                          {notification.title}
                        </Text>
                        <Text
                          className={`text-sm leading-5 mb-2 ${notification.isNew ? "text-gray-700" : "text-gray-500"}`}
                        >
                          {notification.description}
                        </Text>
                        <Text className="text-xs text-gray-400">{notification.time}</Text>
                      </View>

                      {notification.isNew && <View className="w-3 h-3 rounded-full bg-green-500 ml-2 mt-2" />}
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  )

  const ProfilePopup = () => (
    <Modal visible={showProfile} transparent={true} animationType="fade" onRequestClose={() => setShowProfile(false)}>
      <TouchableWithoutFeedback onPress={() => setShowProfile(false)}>
        <View className="flex-1 bg-black/50 justify-end">
          <TouchableWithoutFeedback>
            <View className="bg-white rounded-t-3xl shadow-2xl">
              {/* Header du profil */}
              <View className="flex-row justify-between items-center p-5 border-b border-gray-100">
                <Text className="text-xl font-bold text-gray-900">Menu</Text>
                <TouchableOpacity
                  onPress={() => setShowProfile(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
                >
                  <MaterialIcons name="close" size={20} color="#666666" />
                </TouchableOpacity>
              </View>

              {/* Info profil */}
              <View className="flex-row items-center p-5 border-b border-gray-50">
                <View className="w-16 h-16 rounded-full bg-green-100 items-center justify-center mr-4">
                  <MaterialIcons name="person" size={28} color="#22c55e" />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-900 mb-1">RANALISOLOFO</Text>
                  <Text className="text-sm text-gray-500">Voir votre profil</Text>
                </View>
              </View>

              {/* Options du menu */}
              <View className="pb-6">
                <TouchableOpacity
                  className="flex-row items-center p-4 mx-4 rounded-xl active:bg-gray-50"
                  onPress={() => {
                    setShowProfile(false)
                    router.push("/profil")
                  }}
                  activeOpacity={0.7}
                >
                  <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-4">
                    <MaterialIcons name="person" size={20} color="#22c55e" />
                  </View>
                  <Text className="text-gray-800 text-base font-medium">Mon Profil</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-row items-center p-4 mx-4 rounded-xl active:bg-gray-50"
                  onPress={() => {
                    setShowProfile(false)
                    console.log("Navigation vers réglages")
                  }}
                  activeOpacity={0.7}
                >
                  <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-4">
                    <MaterialIcons name="settings" size={20} color="#22c55e" />
                  </View>
                  <Text className="text-gray-800 text-base font-medium">Réglages</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-row items-center p-4 mx-4 rounded-xl active:bg-red-50"
                  onPress={() => {
                    setShowProfile(false)
                    console.log("Déconnexion")
                  }}
                  activeOpacity={0.7}
                >
                  <View className="w-10 h-10 rounded-full bg-red-100 items-center justify-center mr-4">
                    <MaterialIcons name="logout" size={20} color="#EF4444" />
                  </View>
                  <Text className="text-red-600 text-base font-medium">Déconnexion</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  )

  return (
    <>
      <View className="flex-row bg-gray-200 items-center bg-white border-t border-gray-200 shadow-lg px-2 py-1">
        {navItems.map(renderNavIcon)}
      </View>

      <ProfilePopup />
      <NotificationPopup />
    </>
  )
}

export default Navbar
