import type React from "react"
import { TouchableOpacity, View, Text } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"

interface NavIconItemProps {
  name: string
  id: string
  isActive: boolean
  onPress: (id: string) => void
  notificationCount?: number
  messageCount?: number
}

const NavIconItem: React.FC<NavIconItemProps> = ({
  name,
  id,
  isActive,
  onPress,
  notificationCount = 0,
  messageCount = 0,
}) => {
  const getBadgeCount = () => {
    if (id === "notifications") return notificationCount
    if (id === "messages") return messageCount
    return 0
  }

  const badgeCount = getBadgeCount()

  const renderBadge = () => {
    if (badgeCount === 0) return null
    return (
      <View
        style={{
          position: "absolute",
          top: -6,
          right: -6,
          backgroundColor: "#FF3040",
          borderRadius: 10,
          minWidth: 20,
          height: 20,
          justifyContent: "center",
          alignItems: "center",
          borderWidth: 2,
          borderColor: "white",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.2,
          shadowRadius: 2,
          elevation: 3,
        }}
      >
        <Text
          style={{
            color: "white",
            fontSize: 11,
            fontWeight: "700",
            textAlign: "center",
          }}
        >
          {badgeCount > 99 ? "99+" : badgeCount.toString()}
        </Text>
      </View>
    )
  }

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
          position: "relative",
          paddingTop: 4,
        }}
      >
        <View style={{ position: "relative" }}>
          <MaterialIcons name={name as any} size={26} color={isActive ? "#1877F2" : "#65676B"} />
          {renderBadge()}
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default NavIconItem
