import type React from "react"
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
  Dimensions,
  StyleSheet,
} from "react-native"
import { MaterialIcons } from "@expo/vector-icons"
import type { Notification } from "../types"

const { width: screenWidth, height: screenHeight } = Dimensions.get("window")

interface NotificationPopupProps {
  visible: boolean
  onClose: () => void
  notifications: Notification[]
  notificationCount: number
  markNotificationAsRead: (id: string) => void
  markAllNotificationsAsRead: () => void
  handleNotificationClick: (notification: Notification) => void
}

const NotificationPopup: React.FC<NotificationPopupProps> = ({
  visible,
  onClose,
  notifications,
  notificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  handleNotificationClick,
}) => {
  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.container}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.headerTitle}>Notifications</Text>
                <TouchableOpacity onPress={onClose}>
                  <MaterialIcons name="close" size={24} color="#65676B" />
                </TouchableOpacity>
              </View>

              {/* Actions */}
              {notificationCount > 0 && (
                <View style={styles.actionsContainer}>
                  <TouchableOpacity onPress={markAllNotificationsAsRead} style={styles.markAllButton}>
                    <Text style={styles.markAllButtonText}>Marquer tout comme lu</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Notifications List */}
              <ScrollView style={styles.scrollView}>
                {notifications.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <MaterialIcons name="notifications-none" size={48} color="#BCC0C4" />
                    <Text style={styles.emptyText}>Aucune notification</Text>
                  </View>
                ) : (
                  notifications.map((notification) => (
                    <TouchableOpacity
                      key={notification.id}
                      onPress={() => handleNotificationClick(notification)}
                      style={[styles.notificationItem, notification.isNew && styles.notificationItemNew]}
                      activeOpacity={0.7}
                    >
                      <View style={styles.notificationIcon}>
                        <MaterialIcons name="terrain" size={24} color="#1877F2" />
                      </View>

                      <View style={styles.notificationContent}>
                        <Text style={[styles.notificationTitle, notification.isNew && styles.notificationTitleNew]}>
                          {notification.title}
                        </Text>
                        <Text style={styles.notificationDescription}>{notification.description}</Text>
                        <Text style={styles.notificationTime}>{notification.time}</Text>
                      </View>

                      {notification.isNew && <View style={styles.newIndicator} />}
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
    maxHeight: screenHeight * 0.8,
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
  actionsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E4E6EA",
  },
  markAllButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#E7F3FF",
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  markAllButtonText: {
    color: "#1877F2",
    fontWeight: "600",
    fontSize: 14,
  },
  scrollView: {
    maxHeight: screenHeight * 0.6,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#65676B",
    marginTop: 12,
  },
  notificationItem: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F2F5",
  },
  notificationItemNew: {
    backgroundColor: "#F0F8FF",
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E7F3FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: "400",
    color: "#1C1E21",
    marginBottom: 4,
  },
  notificationTitleNew: {
    fontWeight: "600",
  },
  notificationDescription: {
    fontSize: 14,
    color: "#65676B",
    lineHeight: 18,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: "#8A8D91",
  },
  newIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#1877F2",
    marginLeft: 8,
    alignSelf: "center",
  },
})

export default NotificationPopup
