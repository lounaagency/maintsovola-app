import type React from "react"
import { useState } from "react"
import { View, Text, TouchableOpacity, Modal, ScrollView, TouchableWithoutFeedback, Image } from "react-native"
import { useRouter } from "expo-router"
import { MaterialIcons } from "@expo/vector-icons"

interface NavItem {
  name: string
  type: string
  id: string
}

interface Notification {
  id: string
  title: string
  description: string
  time: string
  isNew: boolean
}

interface NavbarProps {
  activeNavIcon?: string
  onNavChange?: (navId: string) => void
}
interface Message {
  id: string;
  sender: string;
  content: string;
  time: string;
  isNew: boolean;
}

import type React from "react"
import { useState } from "react"
import { View, Text, TouchableOpacity, Modal, ScrollView, Pressable, Image } from "react-native"
import { useRouter } from "expo-router"
import { MaterialIcons } from "@expo/vector-icons"
import { DropdownMenuDemo } from "./DropdownMenu"

interface NavItem {
  name: string
  type: string
  id: string
}

interface Notification {
  id: string
  title: string
  description: string
  time: string
  isNew: boolean
}

interface NavbarProps {
  activeNavIcon?: string
  onNavChange?: (navId: string) => void
}
interface Message {
  id: string;
  sender: string;
  content: string;
  time: string;
  isNew: boolean;
}


const Navbar: React.FC<NavbarProps> = ({ activeNavIcon = "home", onNavChange }) => {
  const [currentActiveIcon, setCurrentActiveIcon] = useState<string>(activeNavIcon)
  const [showProfile, setShowProfile] = useState<boolean>(false)
  // const [showNotifications, setShowNotifications] = useState<boolean>(false)
  const router = useRouter()
const Navbar: React.FC<NavbarProps> = ({ activeNavIcon = "home", onNavChange }) => {
  const [currentActiveIcon, setCurrentActiveIcon] = useState<string>(activeNavIcon)
  const [showProfile, setShowProfile] = useState<boolean>(false)
  // const [showNotifications, setShowNotifications] = useState<boolean>(false)
  const router = useRouter()

  // Données simulées pour les notifications
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "Nouveau terrain",
      id: "1",
      title: "Nouveau terrain",
      description: 'Un nouveau terrain "misa" a été ajouté en attente de validation',
      time: "il y a 7 heures",
      time: "il y a 7 heures",
      isNew: true,
    },
    {
      id: "2",
      title: "Nouveau terrain",
      id: "2",
      title: "Nouveau terrain",
      description: 'Un nouveau terrain "Fonenana Clément manova 1" a été ajouté en attente de validation',
      time: "il y a 1 mois",
      time: "il y a 1 mois",
      isNew: true,
    },
    {
      id: "3",
      title: "Validation terminée",
      id: "3",
      title: "Validation terminée",
      description: 'Votre terrain "Parcelle 123" a été validé avec succès',
      time: "il y a 2 jours",
      time: "il y a 2 jours",
      isNew: false,
    },
  ])

  // Icônes navbar - 5 icônes principales (sans notifications)
  const navItems: NavItem[] = [
    // { name: "M", type: "text", id: "menu" },
    { name: "home", type: "icon", id: "home" },
    { name: "location-on", type: "icon", id: "location" },
    { name: "description", type: "icon", id: "projet" },
    { name: "chat", type: "icon", id: "messages" },
    // { name: "notifications", type: "icon", id: "notifications" },
    { name: "RANALISOLOFO...", type: "profile", id: "profile" },
  ]

    const [messages] = useState<Message[]>([
      {
        id: '1',
        sender: 'Admin',
        content: 'Votre terrain a été validé',
        time: 'il y a 2 heures',
        isNew: true
      },
      {
        id: '2',
        sender: 'Support',
        content: 'Bienvenue sur Maintso Vola',
        time: 'il y a 1 jour',
        isNew: true
      },
      {
        id: '3',
        sender: 'Système',
        content: 'Maintenance programmée ce soir',
        time: 'il y a 2 jours',
        isNew: false
      }
    ]);
  
    },
  ])

  // Icônes navbar - 5 icônes principales (sans notifications)
  const navItems: NavItem[] = [
    // { name: "M", type: "text", id: "menu" },
    { name: "home", type: "icon", id: "home" },
    { name: "location-on", type: "icon", id: "location" },
    { name: "description", type: "icon", id: "projet" },
    { name: "chat", type: "icon", id: "messages" },
    // { name: "notifications", type: "icon", id: "notifications" },
    { name: "RANALISOLOFO...", type: "profile", id: "profile" },
  ]

    const [messages] = useState<Message[]>([
      {
        id: '1',
        sender: 'Admin',
        content: 'Votre terrain a été validé',
        time: 'il y a 2 heures',
        isNew: true
      },
      {
        id: '2',
        sender: 'Support',
        content: 'Bienvenue sur Maintso Vola',
        time: 'il y a 1 jour',
        isNew: true
      },
      {
        id: '3',
        sender: 'Système',
        content: 'Maintenance programmée ce soir',
        time: 'il y a 2 jours',
        isNew: false
      }
    ]);
  

  // Compteurs dynamiques
  const notificationCount = notifications.filter((n) => n.isNew).length
  const notificationCount = notifications.filter((n) => n.isNew).length
  const messageCount = messages.filter(m => m.isNew).length;
  
  
  const handleNavIconPress = (iconId: string): void => {
    setCurrentActiveIcon(iconId)
    onNavChange?.(iconId)

    switch (iconId) {
      case "home":
        router.push("/feed")
        break
      case "location":
        router.push("/terrain")
        break
      case "projet":
        router.push("/projet")
        break
      case "messages":
        router.push("/messages")
        break
      case "profile":

        setShowProfile(true)
        break
      default:
        console.log("Navigation vers:", iconId)
        console.log("Navigation vers:", iconId)
    }
  }

  }

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) =>
        notification.id === notificationId ? { ...notification, isNew: false } : notification,
      ),
    )
  }

    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) =>
        notification.id === notificationId ? { ...notification, isNew: false } : notification,
      ),
    )
  }

  const markAllNotificationsAsRead = () => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) => ({
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) => ({
        ...notification,
        isNew: false,
      })),
    )
  }

  const renderNavIcon = (item: NavItem) => {
    const isActive = currentActiveIcon === item.id

    return (
      <View key={item.id} className="flex-1 items-center justify-center relative">
        {/* Indicateur actif - barre bleue en haut exactement comme Facebook */}
        {isActive && <View className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-green-600" />}

        
        {( item.name !== "notifications") &&  
          <TouchableOpacity
            className="items-center justify-center py-3 px-2"
            onPress={() => handleNavIconPress(item.id)}

            activeOpacity={0.8}
          >
            <View className="relative">
              {(item.type === "profile" ) ? (
                <Image 
                    source={require("../../assets/profile.png")}
                    style={{ width: 40, height: 40, borderRadius: 20 }}
                  />
              ) : ( 
                  <MaterialIcons 
                    name={item.name as any} 
                    size={24} 
                    className={`${isActive ? "text-green-600" : "text-gray-500"}`}
                  />
              )} 
                {item.id === 'notifications' && renderBadge(notificationCount)}
                {item.id === 'messages' && renderBadge(messageCount)}  
            </View>
          </TouchableOpacity>
        }
      </View>
    )
  }
        isNew: false,
      })),
    )
  }

  const renderNavIcon = (item: NavItem) => {
    const isActive = currentActiveIcon === item.id

    return (
      <View key={item.id} className="flex-1 items-center justify-center relative">
        {/* Indicateur actif - barre bleue en haut exactement comme Facebook */}
        {isActive && <View className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-green-600" />}

        
        {( item.name !== "notifications") &&  
          <TouchableOpacity
            className="items-center justify-center py-3 px-2"
            onPress={() => handleNavIconPress(item.id)}
            
            activeOpacity={0.8}
            
          >
            <View className="relative">
              {(item.type === "profile" ) ? (
                <Image 
                    source={require("../../assets/profile.png")}
                    style={{ width: 40, height: 40, borderRadius: 20 }}
                  />
              ) : ( 
                  <MaterialIcons 
                    name={item.name as any} 
                    size={24} 
                    className={`${isActive ? "text-green-600" : "text-gray-500"}`}
                  />
              )} 
                {item.id === 'notifications' && renderBadge(notificationCount)}
                {item.id === 'messages' && renderBadge(messageCount)}  
            </View>
          </TouchableOpacity>
        }
      </View>
    )
  }

  const renderBadge = (count: number) => {
    if (count === 0) return null;
    
    return (
      <View className="absolute -top-2 -right-2 bg-red-500 rounded-full min-w-5 h-5 justify-center items-center border-2 border-white">
        <Text className="text-white text-xs font-bold">
          {count > 9 ? '9+' : count.toString()}
        </Text>
      </View>
    );
  };

  // const NotificationPopup = () => (
  //   <Modal
  //     visible={showNotifications}
  //     transparent={true}
  //     animationType="fade"
  //     onRequestClose={() => setShowNotifications(false)}
  //   >
  //     <TouchableWithoutFeedback onPress={() => setShowNotifications(false)}>
  //       <View className="flex-1 bg-black/50 justify-end">
  //         <TouchableWithoutFeedback>
  //           <View className="bg-white rounded-t-3xl shadow-2xl" style={{ maxHeight: "80%" }}>
  //             <View className="flex-row justify-between items-center p-5 border-b border-gray-100">
  //               <Text className="text-xl font-bold text-gray-900">Notifications</Text>
  //               <TouchableOpacity
  //                 onPress={() => setShowNotifications(false)}
  //                 className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
  //               >
  //                 <MaterialIcons name="close" size={20} color="#666666" />
  //               </TouchableOpacity>
  //             </View>

  //             {notificationCount > 0 && (
  //               <View className="px-5 py-3 border-b border-gray-50">
  //                 <TouchableOpacity
  //                   className="flex-row items-center justify-center py-3 px-4 bg-green-50 border border-green-200 rounded-xl"
  //                   onPress={markAllNotificationsAsRead}
  //                 >
  //                   <MaterialIcons name="done-all" size={18} color="#22c55e" />
  //                   <Text className="text-green-600 ml-2 font-semibold">Marquer tout comme lu</Text>
  //                 </TouchableOpacity>
  //               </View>
  //             )}

  //             <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
  //               {notifications.map((notification) => (
  //                 <TouchableOpacity
  //                   key={notification.id}
  //                   className={`flex-row p-4 border-b border-gray-50 ${notification.isNew ? "bg-green-25" : ""}`}
  //                   onPress={() => markNotificationAsRead(notification.id)}
  //                   activeOpacity={0.7}
  //                 >
  //                   <View className="w-12 h-12 rounded-full bg-green-100 items-center justify-center mr-3">
  //                     <MaterialIcons name="terrain" size={20} color="#22c55e" />
  //                   </View>

  //                   <View className="flex-1">
  //                     <Text
  //                       className={`text-base font-semibold mb-1 ${notification.isNew ? "text-gray-900" : "text-gray-600"}`}
  //                     >
  //                       {notification.title}
  //                     </Text>
  //                     <Text
  //                       className={`text-sm leading-5 mb-2 ${notification.isNew ? "text-gray-700" : "text-gray-500"}`}
  //                     >
  //                       {notification.description}
  //                     </Text>
  //                     <Text className="text-xs text-gray-400">{notification.time}</Text>
  //                   </View>

  //                   {notification.isNew && <View className="w-3 h-3 rounded-full bg-green-500 ml-2 mt-2" />}
  //                 </TouchableOpacity>
  //               ))}
  //             </ScrollView>
  //           </View>
  //         </TouchableWithoutFeedback>
  //       </View>
  //     </TouchableWithoutFeedback>
  //   </Modal>
  // )

  const ProfilePopup = () => (
    <Modal visible={showProfile} transparent={true} animationType="fade" onRequestClose={() => setShowProfile(false)}>
      <TouchableWithoutFeedback onPress={() => setShowProfile(false)}>
        <View className="flex-1">
          {/* Dropdown positionné au-dessus de la navbar */}
          <View
            className="absolute top-[118px] right-4 bg-white rounded-2xl shadow-2xl border border-gray-100"
            style={{ width: 300 }}
          >
            {/* Flèche pointant vers le bas */}
            <View className="absolute  -top-2 right-8 w-4 h-4 bg-white border-r border-b border-gray-100 transform rotate-45" />

            {/* Header avec profil */}
            <View className="flex-row items-center p-4 border-b border-gray-100">
              <View className="w-12 h-12 rounded-full bg-green-100 items-center justify-center mr-3">
                {/* <MaterialIcons name="person" size={24} color="#22c55e" /> */}
                <Image 
                  source={require("../../assets/profile.png")}
                  style={{ width: 40, height: 40, borderRadius: 20 }}
                />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-gray-900">RANALISOLOFO</Text>
                <Text className="text-sm text-gray-500">Voir votre profil</Text>
              </View>
            </View>

            {/* Options du menu */}
            <View className="py-2">
              {/* Notifications avec badge */}
              <TouchableOpacity
                className="flex-row items-center px-4 py-3 active:bg-gray-50"
                onPress={() => {
                  setShowProfile(false)
                  // setShowNotifications(true)
                  router.push("/notifications")
                }}
                
                activeOpacity={0.8}
              >
                <View className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center mr-3 relative">
                  <MaterialIcons name="notifications" size={18} color="#374151" />
                  {notificationCount > 0 && (
                    <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-4 h-4 justify-center items-center">
                      <Text className="text-white font-bold" style={{ fontSize: 9 }}>
                        {notificationCount > 9 ? "9+" : notificationCount.toString()}
                      </Text>
                    </View>
                  )}
                </View>
                <View className="flex-1 flex-row items-center justify-between">
                  <Text className="text-gray-800 text-base">Notifications</Text>
                  {notificationCount > 0 && (
                    <View className="bg-red-500 rounded-full px-2 py-1">
                      <Text className="text-white font-bold text-xs">
                        {notificationCount > 9 ? "9+" : notificationCount.toString()}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center px-4 py-3 active:bg-gray-50"
                onPress={() => {
                  setShowProfile(false)
                  router.push("/profil")
                }}
                activeOpacity={0.8}
              >
                <View className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center mr-3">
                  <MaterialIcons name="person" size={18} color="#374151" />
                </View>
                <Text className="text-gray-800 text-base">Profil</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center px-4 py-3 active:bg-gray-50"
                onPress={() => {
                  setShowProfile(false)
                  console.log("Navigation vers paramètres")
                }}
                activeOpacity={0.8}
              >
                <View className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center mr-3">
                  <MaterialIcons name="settings" size={18} color="#374151" />
                </View>
                <Text className="text-gray-800 text-base">Paramètres</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center px-4 py-3 active:bg-gray-50"
                onPress={() => {
                  setShowProfile(false)
                  console.log("Navigation vers aide")
                }}
                activeOpacity={0.8}
              >
                <View className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center mr-3">
                  <MaterialIcons name="help" size={18} color="#374151" />
                </View>
                <Text className="text-gray-800 text-base">Aide</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center px-4 py-3 active:bg-gray-50"
                onPress={() => {
                  setShowProfile(false)
                  console.log("Navigation vers confidentialité")
                }}
                activeOpacity={0.8}
              >
                <View className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center mr-3">
                  <MaterialIcons name="privacy-tip" size={18} color="#374151" />
                </View>
                <Text className="text-gray-800 text-base">Confidentialité</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center px-4 py-3 active:bg-gray-50"
                onPress={() => {
                  setShowProfile(false)
                  console.log("Navigation vers mode sombre")
                }}
                activeOpacity={0.8}
              >
                <View className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center mr-3">
                  <MaterialIcons name="dark-mode" size={18} color="#374151" />
                </View>
                <Text className="text-gray-800 text-base">Mode sombre</Text>
              </TouchableOpacity>

              {/* Séparateur */}
              <View className="h-px bg-gray-100 mx-4 my-2" />

              <TouchableOpacity
                className="flex-row items-center px-4 py-3 active:bg-red-50"
                onPress={() => {
                  setShowProfile(false)
                  console.log("Déconnexion")
                }}
                activeOpacity={0.8}
              >
                <View className="w-8 h-8 rounded-full bg-red-100 items-center justify-center mr-3">
                  <MaterialIcons name="logout" size={18} color="#EF4444" />
                </View>
                <Text className="text-red-600 text-base">Se déconnecter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  )
  const closeProfileMenu = () => setShowProfile(false);

  const ProfilePopup = () => (
    <Modal 
      visible={showProfile} 
      transparent 
      animationType="fade" 
      onRequestClose={closeProfileMenu}
    >
      <Pressable 
        className="flex-1 bg-black/50 justify-start items-end pt-20 pr-4"
        onPress={closeProfileMenu}
      >
        <Pressable 
          className="bg-white rounded-lg shadow-lg w-72 max-h-96"
          onPress={(e) => e.stopPropagation()}
        >
          <ScrollView className="max-h-96">
            {/* Header avec profil */}
            <View className="px-4 py-2 border-b border-gray-200">
              <View className="flex-row items-center">
                <Image 
                  source={require("../../assets/profile.png")}
                  style={{ width: 40, height: 40, borderRadius: 20 }}
                  className="mr-3"
                />
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900">RANALISOLOFO</Text>
                  <Text className="text-sm text-gray-500">Voir votre profil</Text>
                </View>
              </View>
            </View>

            {/* Menu Items */}
            <View className="py-1">
              {/* Notifications avec badge */}
              <TouchableOpacity
                className="flex-row items-center justify-between px-4 py-3 active:bg-gray-100"
                onPress={() => {
                  closeProfileMenu()
                  router.push("/notifications")
                }}
                activeOpacity={0.8}
              >
                <View className="flex-row items-center">
                  <View className="w-6 h-6 items-center justify-center mr-3 relative">
                    <MaterialIcons name="notifications" size={20} color="#374151" />
                    {notificationCount > 0 && (
                      <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-3 h-3 justify-center items-center">
                        <Text className="text-white font-bold" style={{ fontSize: 8 }}>
                          {notificationCount > 9 ? "9+" : notificationCount.toString()}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-base text-gray-900">Notifications</Text>
                </View>
                {notificationCount > 0 && (
                  <View className="bg-red-500 rounded-full px-2 py-1">
                    <Text className="text-white font-bold text-xs">
                      {notificationCount > 9 ? "9+" : notificationCount.toString()}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center px-4 py-3 active:bg-gray-100"
                onPress={() => {
                  closeProfileMenu()
                  router.push("/profil")
                }}
                activeOpacity={0.8}
              >
                <MaterialIcons name="person" size={20} color="#374151" className="mr-3" />
                <Text className="text-base text-gray-900">Profil</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center px-4 py-3 active:bg-gray-100"
                onPress={() => {
                  closeProfileMenu()
                  console.log("Navigation vers paramètres")
                }}
                activeOpacity={0.8}
              >
                <MaterialIcons name="settings" size={20} color="#374151" className="mr-3" />
                <Text className="text-base text-gray-900">Paramètres</Text>
              </TouchableOpacity>

              {/* <TouchableOpacity
                className="flex-row items-center px-4 py-3 active:bg-gray-100"
                onPress={() => {
                  closeProfileMenu()
                  console.log("Navigation vers aide")
                }}
                activeOpacity={0.8}
              >
                <MaterialIcons name="help" size={20} color="#374151" className="mr-3" />
                <Text className="text-base text-gray-900">Aide</Text> */}
              {/* </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center px-4 py-3 active:bg-gray-100"
                onPress={() => {
                  closeProfileMenu()
                  console.log("Navigation vers confidentialité")
                }}
                activeOpacity={0.8}
              >
                <MaterialIcons name="privacy-tip" size={20} color="#374151" className="mr-3" />
                <Text className="text-base text-gray-900">Confidentialité</Text>
              </TouchableOpacity> */}

              {/* <TouchableOpacity
                className="flex-row items-center px-4 py-3 active:bg-gray-100"
                onPress={() => {
                  closeProfileMenu()
                  console.log("Navigation vers mode sombre")
                }}
                activeOpacity={0.8}
              >
                <MaterialIcons name="dark-mode" size={20} color="#374151" className="mr-3" />
                <Text className="text-base text-gray-900">Mode sombre</Text>
              </TouchableOpacity> */}

              {/* Séparateur */}
              <View className="h-px bg-gray-200 my-1" />

              <TouchableOpacity
                className="flex-row items-center px-4 py-3 active:bg-red-50"
                onPress={() => {
                  closeProfileMenu()
                  console.log("Déconnexion")
                }}
                activeOpacity={0.8}
              >
                <MaterialIcons name="logout" size={20} color="#EF4444" className="mr-3" />
                <Text className="text-base text-red-600">Se déconnecter</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  )

  return (
    <>
      <View className="bg-white border-t border-gray-200 p-1 shadow-sm mb-1">
        <View className="flex-row items-center" style={{ height: 48 }}>
          {navItems.map(renderNavIcon)}
        </View>
      <View className="bg-white border-t border-gray-200 p-1 shadow-sm mb-1">
        <View className="flex-row items-center" style={{ height: 48 }}>
          {navItems.map(renderNavIcon)}
        </View>
      </View>

      <ProfilePopup />
      {/* <NotificationPopup /> */}
      <ProfilePopup />
      {/* <DropdownMenuDemo /> */}
      {/* <NotificationPopup /> */}
    </>
  )
}
  )
}

export default Navbar
