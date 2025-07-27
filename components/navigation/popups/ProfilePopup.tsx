import type React from "react"
import { View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback, Dimensions, StyleSheet } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"

const { width: screenWidth, height: screenHeight } = Dimensions.get("window")

interface ProfilePopupProps {
  visible: boolean
  onClose: () => void
}

const ProfilePopup: React.FC<ProfilePopupProps> = ({ visible, onClose }) => {
  const profileOptions = [
    { icon: "person", title: "Voir le profil", action: "profile" },
    { icon: "settings", title: "Paramètres", action: "settings" },
    { icon: "help", title: "Aide", action: "help" },
    { icon: "logout", title: "Se déconnecter", action: "logout" },
  ]

  const handleOptionPress = (action: string) => {
    console.log("Action:", action)
    onClose()
  }

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.container}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.headerTitle}>Menu</Text>
                <TouchableOpacity onPress={onClose}>
                  <MaterialIcons name="close" size={24} color="#65676B" />
                </TouchableOpacity>
              </View>

              {/* Profile Info */}
              <View style={styles.profileInfo}>
                <View style={styles.profileAvatar}>
                  <MaterialIcons name="person" size={32} color="#1877F2" />
                </View>
                <View>
                  <Text style={styles.profileName}>RANALISOLOFO</Text>
                  <Text style={styles.profileSubtext}>Voir votre profil</Text>
                </View>
              </View>

              {/* Options */}
              <View style={styles.optionsContainer}>
                {profileOptions.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleOptionPress(option.action)}
                    style={styles.optionItem}
                    activeOpacity={0.7}
                  >
                    <View style={styles.optionIcon}>
                      <MaterialIcons name={option.icon as any} size={20} color="#65676B" />
                    </View>
                    <Text style={styles.optionTitle}>{option.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E4E6EA",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1C1E21",
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F2F5",
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E7F3FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1C1E21",
    marginBottom: 4,
  },
  profileSubtext: {
    fontSize: 14,
    color: "#65676B",
  },
  optionsContainer: {
    paddingBottom: 20,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F2F5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  optionTitle: {
    fontSize: 16,
    color: "#1C1E21",
    fontWeight: "500",
  },
})

export default ProfilePopup
