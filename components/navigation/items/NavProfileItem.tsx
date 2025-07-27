import type React from "react"
import { TouchableOpacity, View } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"

interface NavProfileItemProps {
  id: string
  isActive: boolean
  onPress: (id: string) => void
}

const NavProfileItem: React.FC<NavProfileItemProps> = ({ id, isActive, onPress }) => {
  return (
    <TouchableOpacity
      onPress={() => onPress(id)}
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 8,
        paddingHorizontal: 4,
        position: "relative",
      }}
      activeOpacity={0.7}
    >
      {/* Indicateur actif */}
      {isActive && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: "20%",
            right: "20%",
            height: 3,
            backgroundColor: "#1877F2",
            borderRadius: 2,
          }}
        />
      )}

      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 4,
        }}
      >
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: "#F0F2F5",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 2,
            borderWidth: isActive ? 2 : 0,
            borderColor: "#1877F2",
          }}
        >
          <MaterialIcons name="person" size={20} color={isActive ? "#1877F2" : "#65676B"} />
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default NavProfileItem
