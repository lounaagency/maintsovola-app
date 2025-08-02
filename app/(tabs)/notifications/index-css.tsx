import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Modal,
  Alert,
  ActivityIndicator, //  Import du composant de chargement
} from 'react-native';
import {useAuth} from '~/contexts/AuthContext';
import { supabase } from '~/lib/data';
import { 
  getUsers
 } from '~/services/conversation-message-service';
 import  {Utilisateur}  from '~/type/messageInterface';

interface NotificationItem {
  id: number;
  type: string;
  user: string;
  avatar: string;
  action: string;
  time: string;
  isRead: boolean;
  content?: string;
  senderId?: string;
}

export default function NotifScreen() {
  const { user } = useAuth();
  const userId: string = user?.id || '';
  console.log("les users data:",userId)
  
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [selectedNotificationId, setSelectedNotificationId] = useState<number | null>(null);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [userData, setUserData] = useState<Utilisateur | null>(null);
  const [isLoading, setIsLoading] = useState(true); //  État de chargement

  //  Fonction pour marquer une notification comme lue dans la base de données
  const markAsReadInDB = async (notificationId: number) => {
    try {
      const { error } = await supabase
        .from('notification')
        .update({ lu: true })
        .eq('id_notification', notificationId)
        .eq('id_destinataire', userId); // Sécurité : s'assurer que c'est bien l'utilisateur connecté

      if (error) {
        console.error('Erreur lors de la mise à jour:', error);
        return false;
      }

      console.log(`Notification ${notificationId} marquée comme lue`);
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      return false;
    }
  };

  //  Fonction pour marquer toutes les notifications comme lues dans la DB
  const markAllAsReadInDB = async () => {
    try {
      const { error } = await supabase
        .from('notification')
        .update({ lu: true })
        .eq('id_destinataire', userId)
        .eq('lu', false); // Seulement les non lues

      if (error) {
        console.error('Erreur lors de la mise à jour globale:', error);
        return false;
      }

      console.log('Toutes les notifications marquées comme lues');
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour globale:', error);
      return false;
    }
  };

  // Fonction modifiée pour marquer comme lu (locale + DB)
  const markAsRead = async (id: number) => {
    // Marquer dans la DB d'abord
    const success = await markAsReadInDB(id);
    
    if (success) {
      // Puis mettre à jour l'état local (optionnel car le realtime va s'en charger)
      setNotifications((prev: NotificationItem[]) =>
        prev.map((notif: NotificationItem) =>
          notif.id === id ? { ...notif, isRead: true } : notif
        )
      );
    }
  };

  //  Fonction modifiée pour marquer tout comme lu
  const markAllAsRead = async () => {
    const success = await markAllAsReadInDB();
    
    if (success) {
      // Mettre à jour l'état local (optionnel car le realtime va s'en charger)
      setNotifications((prev: NotificationItem[]) =>
        prev.map((notif: NotificationItem) => ({ ...notif, isRead: true }))
      );
    }
  };

  const deleteNotification = async (notificationId: number) => {
    try {
      const { error } = await supabase
        .from('notification')
        .delete()
        .eq('id_notification', notificationId);

      if (error) {
        console.error('Erreur lors de la suppression:', error);
        Alert.alert('Erreur', 'Impossible de supprimer la notification');
        return;
      }

      // Pas besoin de mettre à jour l'état local, le realtime s'en charge
      Alert.alert('Succès', 'Notification supprimée avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      Alert.alert('Erreur', 'Une erreur est survenue');
    }
  };

  const confirmDelete = (notificationId: number) => {
    Alert.alert(
      'Confirmer la suppression',
      'Êtes-vous sûr de vouloir supprimer cette notification ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => deleteNotification(notificationId),
        },
      ]
    );
  };

  const openMenu = (notificationId: number) => {
    setSelectedNotificationId(notificationId);
    setShowMenuModal(true);
  };

  const closeMenu = () => {
    setShowMenuModal(false);
    setSelectedNotificationId(null);
  };

  const loadCurrentUserData = useCallback(async () => {
    try {
      console.log('Chargement des données utilisateur connecté...');
      const userData = await getUsers({id: userId});
      console.log('Données utilisateur connecté reçues:', userData);
      setUserData(userData);
    } catch (error) {
      console.error('Erreur lors du chargement des données utilisateur:', error);
    }
  }, [userId]);

  const getSenderData = async (senderId: string) => {
    try {
      if (!senderId || senderId === 'null' || senderId === 'undefined') {
        console.log('ID expéditeur invalide:', senderId);
        return null;
      }
      
      const senderData = await getUsers({id: senderId});
      return senderData;
    } catch (error) {
      console.error('Erreur lors du chargement des données de l\'expéditeur:', error);
      return null;
    }
  };

  // ✅ Fonction pour formatter les notifications depuis la DB
  const formatNotifications = async (data: any[]) => {
    const formattedNotifications: NotificationItem[] = await Promise.all(
      (data || []).map(async (notif: any): Promise<NotificationItem> => {
        let senderData = null;
        if (notif.id_expediteur && notif.id_expediteur !== 'null' && notif.id_expediteur !== 'undefined') {
          senderData = await getSenderData(notif.id_expediteur);
        }
        
        return {
          id: notif.id_notification,
          type: 'comment',
          user: senderData ? `${senderData.prenoms} ${senderData.nom}` : 'Système',
          avatar: senderData?.photo_profil || 'https://ui-avatars.com/api/?name=Systeme&background=007bff&color=fff',
          action: senderData ? 'vous a envoyé une notification' : 'Notification système',
          time: new Date(notif.date_creation).toLocaleTimeString(),
          isRead: notif.lu, // ✅ Utilise directement la valeur de la DB
          content: notif.message,
          senderId: notif.id_expediteur,
        };
      })
    );
    return formattedNotifications;
  };

  // ✅ Fonction pour charger les notifications
  const loadNotifications = async () => {
    try {
      setIsLoading(true); // ✅ Démarrer le chargement
      
      const { data, error } = await supabase
        .from('notification')
        .select(`
          id_notification,
          id_expediteur,
          id_destinataire,
          message,
          date_creation,
          lu
        `)
        .eq('id_destinataire', userId)
        .order('date_creation', { ascending: false });

      if (error) {
        console.error('Erreur Supabase :', error);
        return;
      }

      const formattedNotifications = await formatNotifications(data);
      setNotifications(formattedNotifications);
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    } finally {
      setIsLoading(false); // ✅ Terminer le chargement
    }
  };

  useEffect(() => {
    if (!userId) return;

    // Charger les notifications initiales
    loadNotifications();
    loadCurrentUserData();

    // ✅ Configurer l'écoute en temps réel
    const notificationSubscription = supabase
      .channel('notifications_realtime')
      .on('postgres_changes', 
        { 
          event: '*', // Écouter tous les événements (INSERT, UPDATE, DELETE)
          schema: 'public', 
          table: 'notification',
          filter: `id_destinataire=eq.${userId}` // Seulement les notifications de cet utilisateur
        }, 
        async (payload) => {
          console.log('Changement de notification détecté:', payload);
          
          // Recharger toutes les notifications pour simplifier
          await loadNotifications();
          
          // Alternative : gérer les changements individuellement
          /*
          switch (payload.eventType) {
            case 'INSERT':
              // Nouvelle notification
              const newNotif = await formatNotifications([payload.new]);
              setNotifications(prev => [newNotif[0], ...prev]);
              break;
            case 'UPDATE':
              // Notification mise à jour
              const updatedNotif = await formatNotifications([payload.new]);
              setNotifications(prev => 
                prev.map(notif => 
                  notif.id === payload.new.id_notification ? updatedNotif[0] : notif
                )
              );
              break;
            case 'DELETE':
              // Notification supprimée
              setNotifications(prev => 
                prev.filter(notif => notif.id !== payload.old.id_notification)
              );
              break;
          }
          */
        }
      )
      .subscribe();

    // ✅ Nettoyage de la subscription
    return () => {
      notificationSubscription.unsubscribe();
    };
  }, [userId, loadCurrentUserData]);

  const unreadCount = notifications.filter((n: NotificationItem) => !n.isRead).length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead} style={styles.markAllButton}>
            <Text style={styles.markAllText}>Tout marquer comme lu</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Unread count */}
      {unreadCount > 0 && (
        <View style={styles.unreadBanner}>
          <Text style={styles.unreadText}>
            {unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue{unreadCount > 1 ? 's' : ''}
          </Text>
        </View>
      )}

      {/* Notifications List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* ✅ Affichage du chargement */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#135b48" />
            <Text style={styles.loadingText}>Chargement des notifications...</Text>
          </View>
        ) : (
          <>
            {notifications.map((notification: NotificationItem) => (
              <TouchableOpacity
                key={notification.id}
                style={[
                  styles.notificationItem,
                  !notification.isRead && styles.unreadNotification
                ]}
                onPress={() => markAsRead(notification.id)}
              >
                {!notification.isRead && <View style={styles.unreadDot} />}
                
                <Image
                  source={{ uri: notification.avatar }}
                  style={styles.avatar}
                />
                
                <View style={styles.notificationContent}>
                  <View style={styles.textContainer}>
                    <Text style={styles.notificationText}>
                      <Text style={styles.userName}>{notification.user}</Text>
                      {' ' + notification.action}
                    </Text>
                    
                    {notification.content && (
                      <Text style={styles.contentText}>{notification.content}</Text>
                    )}
                    
                    <Text style={styles.timeText}>{notification.time}</Text>
                  </View>
                  
                  <TouchableOpacity
                    style={styles.menuButton}
                    onPress={() => openMenu(notification.id)}
                  >
                    <Text style={styles.menuDots}>⋮</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
            
            {/* Empty state when no notifications */}
            {notifications.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🔔</Text>
                <Text style={styles.emptyText}>Aucune notification</Text>
                <Text style={styles.emptySubtext}>
                  Vos notifications apparaîtront ici
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Modal pour le menu d'actions */}
      <Modal
        visible={showMenuModal}
        transparent={true}
        animationType="fade"
        onRequestClose={closeMenu}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeMenu}
        >
          <View style={styles.menuModal}>
            <TouchableOpacity
              style={styles.menuOption}
              onPress={() => {
                closeMenu();
                if (selectedNotificationId) {
                  confirmDelete(selectedNotificationId);
                }
              }}
            >
              <Text style={styles.deleteText}>🗑️ Supprimer</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.menuOption}
              onPress={closeMenu}
            >
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1c1e21',
  },
  userInfo: {
    fontSize: 14,
    color: '#65676b',
    fontWeight: '500',
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#135b48',
    borderRadius: 6,
  },
  markAllText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  unreadBanner: {
    backgroundColor: '#9cf0b8',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  unreadText: {
    color: '#013b18',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    position: 'relative',
  },
  unreadNotification: {
    backgroundColor: '#9cf0b8',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#135b48',
    position: 'absolute',
    left: 8,
    top: 20,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  textContainer: {
    flex: 1,
  },
  notificationText: {
    fontSize: 15,
    color: '#1c1e21',
    lineHeight: 20,
  },
  userName: {
    fontWeight: '600',
    color: '#1c1e21',
  },
  contentText: {
    fontSize: 14,
    color: '#65676b',
    fontStyle: 'italic',
    marginTop: 4,
    lineHeight: 18,
  },
  timeText: {
    fontSize: 13,
    color: '#65676b',
    marginTop: 6,
  },
  menuButton: {
    padding: 8,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuDots: {
    fontSize: 20,
    color: '#65676b',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuOption: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  deleteText: {
    fontSize: 16,
    color: '#dc3545',
    fontWeight: '500',
  },
  cancelText: {
    fontSize: 16,
    color: '#6c757d',
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1c1e21',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#65676b',
    textAlign: 'center',
  },
  // ✅ Styles pour le chargement
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#65676b',
    fontWeight: '500',
  },
});