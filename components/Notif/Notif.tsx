
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
} from 'react-native';

interface User {
  id_utilisateur: string
  nom: string
  email: string
  photo_profil: string
  photo_couverture: string
  created_at: Date
  prenoms: string
  id_role: number
  bio: string | null
  adresse: string
}

interface SiteUtilisateur {
  id_site_utilisateur: string
  email: string
  nom: string
  prenom: string
  id_role: number
  statut: string
  derniere_connection: Date
  create_at: Date
  update_at: Date
}

interface Notification {
  id: string
  type: string
  user: string
  avatar: string
  action: string
  time: string
  isRead: boolean
  content?: string
  id_expediteur?: string
}

import { supabase } from '~/lib/data';

export default function NotifScreen() {
  const [currentUserId, setCurrentUserId] = useState<string>("")
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [currentSiteUser, setCurrentSiteUser] = useState<SiteUtilisateur | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [siteUtilisateurs, setSiteUtilisateurs] = useState<SiteUtilisateur[]>([])
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<Notification[]>([])

  const markAsRead = async (id: string | number) => {
    // Mettre à jour l'état local immédiatement
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id.toString() ? { ...notif, isRead: true } : notif
      )
    );

    // Mettre à jour la base de données
    try {
      await supabase
        .from('notification')
        .update({ lu: true })
        .eq('id_notification', id.toString());
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la notification:', error);
    }
  };
  
  const fetchSiteUtilisateurs = async () => {
    try {
      const { data, error } = await supabase.from("utilisateur").select("*")

      if (error) {
        console.error("Erreur lors de la récupération des utilisateurs du site:", error)
        return
      }

      const formattedData: SiteUtilisateur[] = (data || []).map((item: any) => ({
        id_site_utilisateur: item.id_site_utilisateur,
        email: item.email,
        nom: item.nom,
        prenom: item.prenom,
        id_role: item.id_role,
        statut: item.statut,
        derniere_connection: new Date(item.derniere_connection),
        create_at: new Date(item.create_at),
        update_at: new Date(item.update_at),
      }))

      setSiteUtilisateurs(formattedData)
      console.log("Utilisateurs du site récupérés:", formattedData.length)
      
      return formattedData
    } catch (error) {
      console.error("Erreur fetchSiteUtilisateurs:", error)
      return []
    }
  }

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.from("utilisateur").select("*")

      if (error) {
        console.error("Erreur lors de la récupération des utilisateurs:", error)
        return []
      }

      const formattedData: User[] = (data || []).map((item: any) => ({
        id_utilisateur: item.id_utilisateur,
        nom: item.nom,
        email: item.email,
        photo_profil: item.photo_profil,
        photo_couverture: item.photo_couverture,
        created_at: new Date(item.created_at),
        prenoms: item.prenoms,
        id_role: item.id_role,
        bio: item.bio,
        adresse: item.adresse,
      }))

      setUsers(formattedData)
      console.log("Utilisateurs récupérés:", formattedData.length)
      
      return formattedData
    } catch (error) {
      console.error("Erreur fetchUsers:", error)
      return []
    }
  }

  const getNotifications = async (userId: string) => {
    if (!userId) {
      console.log("Pas d'ID utilisateur pour récupérer les notifications")
      return
    }
    console.log("voici l'id actuel",userId);
    try {
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
        console.error('Erreur Supabase notifications:', error);
        return
      }

      // Récupérer les informations des expéditeurs
      const expediteurIds = [...new Set((data || []).map(n => n.id_expediteur).filter(Boolean))]
      
      let expediteursInfo: { [key: string]: { nom: string, prenom: string, photo_profil?: string } } = {}
      
      if (expediteurIds.length > 0) {
        // D'abord chercher dans site_utilisateur
        const { data: siteUsersData } = await supabase
          .from('utilisateur')
          .select('id_utilisateur, nom, prenoms,photo_profil')
          .in('id_utilisateur', expediteurIds)

        if (siteUsersData) {
          siteUsersData.forEach(user => {
            expediteursInfo[user.id_utilisateur] = {
              nom: user.nom || 'Utilisateur',
              prenom: user.prenoms || '',
              photo_profil: user.photo_profil || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(`${user.prenoms} ${user.nom}`)
            }
          })
        }

        const { data: distinctRoles, error: distinctError } = await supabase
          .from('utilisateur_par_role')
          .select('nom_role');
     
        if (distinctError) {
          console.error('Erreur:', distinctError);
        } else {
          // Filtrer les doublons
          const unique = distinctRoles?.filter((role, index, self) => 
            index === self.findIndex(r => r.nom_role === role.nom_role)
          );
          console.log("Rôles distincts:", unique);
        }
      }

      const formatted: Notification[] = (data || []).map((notif: any) => {
        const expediteur = expediteursInfo[notif.id_expediteur] || { nom: 'Utilisateur', prenom: '' }
        const fullName = `${expediteur.prenom} ${expediteur.nom}`.trim() || 'Utilisateur inconnu'
        
        return {
          id: notif.id_notification,
          type: 'comment',
          user: fullName,
          avatar: expediteur.photo_profil || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(fullName),
          action: 'vous a envoyé une notification',
          time: new Date(notif.date_creation).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          isRead: notif.lu,
          content: notif.message,
          id_expediteur: notif.id_expediteur
        }
      });

      console.log('Notifications formatées:', formatted.length)
     
      setNotifications(formatted);
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error)
    }
  }

  // Configuration de l'écoute en temps réel
  const setupRealtimeSubscription = (userId: string) => {
    if (!userId) return;

    console.log('Configuration de l\'écoute temps réel pour l\'utilisateur:', userId);

    // Écouter les changements dans la table notification
    const notificationSubscription = supabase
      .channel('notification_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Écouter tous les événements (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'notification',
          filter: `id_destinataire=eq.${userId}`, // Filtrer par destinataire
        },
        (payload) => {
          console.log('Changement détecté dans les notifications:', payload);
          
          if (payload.eventType === 'INSERT') {
            // Nouvelle notification reçue
            console.log('Nouvelle notification reçue');
            getNotifications(userId); // Recharger toutes les notifications
          } else if (payload.eventType === 'UPDATE') {
            // Notification mise à jour (ex: marquée comme lue)
            console.log('Notification mise à jour');
            getNotifications(userId);
          } else if (payload.eventType === 'DELETE') {
            // Notification supprimée
            console.log('Notification supprimée');
            getNotifications(userId);
          }
        }
      )
      .subscribe((status) => {
        console.log('Statut de l\'abonnement notifications:', status);
      });

    // Écouter les changements dans la table utilisateur (pour les avatars/noms)
    const userSubscription = supabase
      .channel('user_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'utilisateur',
        },
        (payload) => {
          console.log('Changement détecté dans les utilisateurs:', payload);
          // Recharger les notifications pour mettre à jour les infos utilisateurs
          getNotifications(userId);
        }
      )
      .subscribe((status) => {
        console.log('Statut de l\'abonnement utilisateurs:', status);
      });

    // Retourner une fonction de nettoyage
    return () => {
      console.log('Nettoyage des abonnements temps réel');
      supabase.removeChannel(notificationSubscription);
      supabase.removeChannel(userSubscription);
    };
  };

  const initializeData = async () => {
    setLoading(true)
    try {
      // 1. Récupérer l'utilisateur authentifié
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        console.log("Aucun utilisateur authentifié")
        setLoading(false)
        return
      }

      console.log("Utilisateur authentifié:", authUser.email)

      // 2. Chercher l'utilisateur dans site_utilisateur
      const { data: siteUser, error: siteError } = await supabase
        .from("utilisateur")
        .select("*")
        .eq("email", authUser.email)
        .single()

      if (siteError || !siteUser) {
        console.error("Erreur lors de la récupération de site_utilisateur:", siteError)
        Alert.alert("Erreur", "Utilisateur non trouvé dans site_utilisateur")
        setLoading(false)
        return
      }

      console.log("Site utilisateur trouvé:", siteUser.id_utilisateur)

      // 3. Définir l'ID utilisateur actuel et les données du site utilisateur
      const userId = siteUser.id_utilisateur
      setCurrentUserId(userId)
      setCurrentSiteUser({
        id_site_utilisateur: siteUser.id_site_utilisateur,
        email: siteUser.email,
        nom: siteUser.nom,
        prenom: siteUser.prenom,
        id_role: siteUser.id_role,
        statut: siteUser.statut,
        derniere_connection: new Date(siteUser.derniere_connection),
        create_at: new Date(siteUser.create_at),
        update_at: new Date(siteUser.update_at),
      })

      // 4. Mettre à jour la dernière connexion
      await supabase
        .from("site_utilisateur")
        .update({
          derniere_connection: new Date().toISOString(),
          update_at: new Date().toISOString(),
        })
        .eq("id_site_utilisateur", userId)

      // 5. Récupérer toutes les données en parallèle
      const [usersData, siteUsersData] = await Promise.all([
        fetchUsers(),
        fetchSiteUtilisateurs(),
      ])

      // 6. Essayer de trouver l'utilisateur correspondant dans la table utilisateur
      if (usersData && usersData.length > 0) {
        const userById = usersData.find(u => u.id_utilisateur === userId)
        if (userById) {
          setCurrentUser(userById)
          console.log("Utilisateur trouvé par email:", userById.nom, userById.prenoms)
        }
      }

      // 7. Récupérer les notifications
      await getNotifications(userId)

      // 8. Configurer l'écoute temps réel
      const cleanup = setupRealtimeSubscription(userId);
      
      // Stocker la fonction de nettoyage pour l'utiliser dans useEffect
      return cleanup;

    } catch (error) {
      console.error("Erreur lors de l'initialisation:", error)
      Alert.alert("Erreur", "Impossible de charger les données")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const init = async () => {
      cleanup = await initializeData();
    };

    init();

    // Fonction de nettoyage
    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [])

  const markAllAsRead = async () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, isRead: true }))
    );

    // Mettre à jour la base de données
    if (currentUserId) {
      try {
        await supabase
          .from('notification')
          .update({ lu: true })
          .eq('id_destinataire', currentUserId)
          .eq('lu', false)
      } catch (error) {
        console.error('Erreur lors de la mise à jour des notifications:', error)
      }
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return '👍';
      case 'comment':
        return '💬';
      case 'friend_request':
        return '👥';
      case 'tag':
        return '🏷️';
      case 'birthday':
        return '🎂';
      default:
        return '📢';
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-green-50">
        <View className="flex-1 justify-center items-center px-10">
          <Text className="text-xl font-semibold text-green-800 mb-2">Chargement...</Text>
          {currentSiteUser && (
            <Text className="text-base text-green-600">
              Connexion de {currentSiteUser.prenom} {currentSiteUser.nom}
            </Text>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-green-50">
      {/* Header */}
      <View className="flex-row justify-between items-center px-5 py-4 bg-white border-b-2 border-green-300 shadow-sm">
        <View>
          <Text className="text-2xl font-bold text-green-800">Notifications</Text>
          {currentSiteUser && (
            <Text className="text-xs text-green-500 mt-0.5">
              {currentSiteUser.prenom} {currentSiteUser.nom}
            </Text>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity 
            onPress={markAllAsRead} 
            className="px-3 py-1.5 bg-green-700 rounded-lg shadow-sm"
          >
            <Text className="text-white text-xs font-semibold">Tout marquer comme lu</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Unread count */}
      {unreadCount > 0 && (
        <View className="bg-green-300 px-5 py-3 border-b border-green-500">
          <Text className="text-green-800 text-sm font-semibold">
            {unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue{unreadCount > 1 ? 's' : ''}
          </Text>
        </View>
      )}

      {/* Notifications List */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {notifications.map((notification) => (
          <TouchableOpacity
            key={notification.id}
            className={`flex-row p-4 bg-white border-b border-green-100 relative mx-2 my-0.5 rounded-lg shadow-sm ${
              !notification.isRead ? 'bg-green-50 border-l-4 border-l-green-500' : ''
            }`}
            onPress={() => markAsRead(notification.id)}
          >
            {!notification.isRead && (
              <View className="w-2.5 h-2.5 rounded-full bg-green-700 absolute left-2 top-5 shadow-sm" />
            )}
            
            <Image
              source={{ uri: notification.avatar }}
              className="w-12 h-12 rounded-full mr-3 border-2 border-green-300"
            />
            
            <View className="flex-1 flex-row justify-between">
              <View className="flex-1">
                <Text className="text-base text-gray-900 leading-5">
                  <Text className="font-semibold text-green-800">{notification.user}</Text>
                  {' ' + notification.action}
                </Text>
                
                {notification.content && (
                  <Text className="text-sm text-green-500 italic mt-1 leading-4 bg-green-50 p-2 rounded-md border-l-3 border-l-green-300">
                    "{notification.content}"
                  </Text>
                )}
                
                <Text className="text-xs text-green-600 mt-1.5 font-medium">{notification.time}</Text>
              </View>
              
              <View className="ml-2 justify-center bg-green-100 rounded-full w-10 h-10 items-center">
                <Text className="text-xl">
                  {getNotificationIcon(notification.type)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Empty state when no notifications */}
      {notifications.length === 0 && !loading && (
        <View className="flex-1 justify-center items-center px-10 bg-green-50">
          <Text className="text-6xl mb-5 opacity-60">🔔</Text>
          <Text className="text-xl font-semibold text-green-800 mb-2">Aucune notification</Text>
          <Text className="text-base text-green-500 text-center">
            Vos notifications apparaîtront ici
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};