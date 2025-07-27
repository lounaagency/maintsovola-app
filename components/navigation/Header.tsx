import type React from "react"
import { View, Text, TouchableOpacity, Image } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"

interface HeaderProps {
  onSearchPress?: () => void
  onMenuPress?: () => void
}

const Header: React.FC<HeaderProps> = ({ onSearchPress, onMenuPress }) => {
  return (
    <View className="bg-white border-b border-gray-200 shadow-sm">
      <View className="flex-row items-center justify-between px-4 py-3">
        {/* Logo */}
        <View className="flex-row items-center">
          <Image
            source={require("../../assets/maintsovola_logo_pm.png")}
            style={{ width: 40, height: 40, borderRadius: 20 }}
          />
          <Text className="text-xl font-bold text-green-500 ml-2">Maintso Vola</Text>
        </View>

        {/* Barre de recherche */}
        <View className="flex-1 mx-4">
          <TouchableOpacity
            onPress={onSearchPress}
            className="flex-row items-center bg-gray-100 rounded-full px-4 py-2"
            activeOpacity={0.7}
          >
            <MaterialIcons name="search" size={20} color="#65676B" />
            <Text className="text-gray-500 ml-2 flex-1">Rechercher...</Text>
          </TouchableOpacity>
        </View>

        {/* Menu hamburger */}
        <TouchableOpacity
          onPress={onMenuPress}
          className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
          activeOpacity={0.7}
        >
          <MaterialIcons name="menu" size={24} color="#65676B" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default Header
