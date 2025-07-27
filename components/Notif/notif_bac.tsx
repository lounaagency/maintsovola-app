import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
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

  const markAsRead = (id: string | number) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id.toString() ? { ...notif, isRead: true } : notif
      )
    );
  };

  const fetchSiteUtilisateurs = async () => {
    try {
      const { data, error } = await supabase.from("site_utilisateur").select("*")

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
          .from('site_utilisateur')
          .select('id_site_utilisateur, nom, prenom')
          .in('id_site_utilisateur', expediteurIds)

        if (siteUsersData) {
          siteUsersData.forEach(user => {
            expediteursInfo[user.id_site_utilisateur] = {
              nom: user.nom || 'Utilisateur',
              prenom: user.prenom || '',
              photo_profil: undefined
            }
          })
        }

        // Puis chercher dans utilisateur pour avoir les photos (si vous avez une relation)
        // Vous devrez adapter cette partie selon votre structure de données
      }
    console.log('notification');
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

      console.log("Site utilisateur trouvé:", siteUser.id_site_utilisateur)

      // 3. Définir l'ID utilisateur actuel et les données du site utilisateur
      const userId = siteUser.id_site_utilisateur
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
      // (si vous avez une relation entre les deux tables)
      if (usersData && usersData.length > 0) {
        // Option 1: Si vous avez une relation par email
        // const userByEmail = usersData.find(u => u.email === authUser.email)
        // if (userByEmail) {
        //   setCurrentUser(userByEmail)
        //   console.log("Utilisateur trouvé par email:", userByEmail.nom, userByEmail.prenoms)
        // }
        
       // Option 2: Si vous avez une relation par ID (vous devrez adapter selon votre structure)
        const userById = usersData.find(u => u.id_utilisateur === userId)
        if (userById) {
          setCurrentUser(userById)
          console.log("Utilisateur trouvé par email:", userById.nom, userById.prenoms)
        }
      }

      // 7. Récupérer les notifications
      await getNotifications(userId)

    } catch (error) {
      console.error("Erreur lors de l'initialisation:", error)
      Alert.alert("Erreur", "Impossible de charger les données")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    initializeData();
  }, [])

  const markAllAsRead = async () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, isRead: true }))
    );

    // Optionnel: Mettre à jour la base de données
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
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Chargement...</Text>
          {currentSiteUser && (
            <Text style={styles.emptySubtext}>
              Connexion de {currentSiteUser.prenom} {currentSiteUser.nom}
            </Text>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Notifications</Text>
          {currentSiteUser && (
            <Text style={styles.subtitle}>
              {currentSiteUser.prenom} {currentSiteUser.nom}
            </Text>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead} style={styles.markAllButton}>
            <Text style={styles.markAllText}>Tout marquer comme lu</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* User Info Debug (à supprimer en production) */}
      {__DEV__ && currentSiteUser && (
        <View style={styles.debugInfo}>
          <Text>Debug - Site User ID: {currentUserId}</Text>
          <Text>Email: {currentSiteUser.email}</Text>
          <Text>Current User: {currentUser ? `${currentUser.prenoms} ${currentUser.nom}` : 'Non trouvé'}</Text>
        </View>
      )}

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
        {notifications.map((notification) => (
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
                  <Text style={styles.contentText}>"{notification.content}"</Text>
                )}
                
                <Text style={styles.timeText}>{notification.time}</Text>
              </View>
              
              <View style={styles.iconContainer}>
                <Text style={styles.notificationIcon}>
                  {getNotificationIcon(notification.type)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Empty state when no notifications */}
      {notifications.length === 0 && !loading && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🔔</Text>
          <Text style={styles.emptyText}>Aucune notification</Text>
          <Text style={styles.emptySubtext}>
            Vos notifications apparaîtront ici
          </Text>
        </View>
      )}
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
  subtitle: {
    fontSize: 12,
    color: '#65676b',
    marginTop: 2,
  },
  debugInfo: {
    backgroundColor: '#fff3cd',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#1877f2',
    borderRadius: 6,
  },
  markAllText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  unreadBanner: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  unreadText: {
    color: '#1565c0',
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
    backgroundColor: '#f0f8ff',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1877f2',
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
  iconContainer: {
    marginLeft: 8,
    justifyContent: 'center',
  },
  notificationIcon: {
    fontSize: 24,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
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
});





// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   Image,
//   SafeAreaView,
//   Alert,
// } from 'react-native';

// interface User {
//   id_utilisateur: string
//   nom: string
//   email: string
//   photo_profil: string
//   photo_couverture: string
//   created_at: Date
//   prenoms: string
//   id_role: number
//   bio: string | null
//   adresse: string
// }

// interface SiteUtilisateur {
//   id_site_utilisateur: string
//   email: string
//   nom: string
//   prenom: string
//   id_role: number
//   statut: string
//   derniere_connection: Date
//   create_at: Date
//   update_at: Date
// }

// interface Notification {
//   id: string
//   type: string
//   user: string
//   avatar: string
//   action: string
//   time: string
//   isRead: boolean
//   content?: string
//   id_expediteur?: string
// }

// import { supabase } from '~/lib/data';

// export default function NotifScreen() {
//   const [currentUserId, setCurrentUserId] = useState<string>("")
//   const [currentUser, setCurrentUser] = useState<User | null>(null)
//   const [currentSiteUser, setCurrentSiteUser] = useState<SiteUtilisateur | null>(null)
//   const [users, setUsers] = useState<User[]>([])
//   const [siteUtilisateurs, setSiteUtilisateurs] = useState<SiteUtilisateur[]>([])
//   const [loading, setLoading] = useState(true)
//   const [notifications, setNotifications] = useState<Notification[]>([])

//   const markAsRead = (id: string | number) => {
//     setNotifications(prev =>
//       prev.map(notif =>
//         notif.id === id.toString() ? { ...notif, isRead: true } : notif
//       )
//     );
//   };
  
//   const fetchSiteUtilisateurs = async () => {
//     try {
//       const { data, error } = await supabase.from("utilisateur").select("*")

//       if (error) {
//         console.error("Erreur lors de la récupération des utilisateurs du site:", error)
//         return
//       }

//       const formattedData: SiteUtilisateur[] = (data || []).map((item: any) => ({
//         id_site_utilisateur: item.id_site_utilisateur,
//         email: item.email,
//         nom: item.nom,
//         prenom: item.prenom,
//         id_role: item.id_role,
//         statut: item.statut,
//         derniere_connection: new Date(item.derniere_connection),
//         create_at: new Date(item.create_at),
//         update_at: new Date(item.update_at),
//       }))

//       setSiteUtilisateurs(formattedData)
//       console.log("Utilisateurs du site récupérés:", formattedData.length)
      
//       return formattedData
//     } catch (error) {
//       console.error("Erreur fetchSiteUtilisateurs:", error)
//       return []
//     }
//   }

//   const fetchUsers = async () => {
//     try {
//       const { data, error } = await supabase.from("utilisateur").select("*")

//       if (error) {
//         console.error("Erreur lors de la récupération des utilisateurs:", error)
//         return []
//       }

//       const formattedData: User[] = (data || []).map((item: any) => ({
//         id_utilisateur: item.id_utilisateur,
//         nom: item.nom,
//         email: item.email,
//         photo_profil: item.photo_profil,
//         photo_couverture: item.photo_couverture,
//         created_at: new Date(item.created_at),
//         prenoms: item.prenoms,
//         id_role: item.id_role,
//         bio: item.bio,
//         adresse: item.adresse,
//       }))

//       setUsers(formattedData)
//       console.log("Utilisateurs récupérés:", formattedData.length)
      
//       return formattedData
//     } catch (error) {
//       console.error("Erreur fetchUsers:", error)
//       return []
//     }
//   }

//   const getNotifications = async (userId: string) => {
//     if (!userId) {
//       console.log("Pas d'ID utilisateur pour récupérer les notifications")
//       return
//     }
//     console.log("voici l'id actuel",userId);
//     try {
//       const { data, error } = await supabase
//         .from('notification')
//         .select(`
//           id_notification,
//           id_expediteur,
//           id_destinataire,
//           message,
//           date_creation,
//           lu
//         `)
//         .eq('id_destinataire', userId)
//         .order('date_creation', { ascending: false });

//       if (error) {
//         console.error('Erreur Supabase notifications:', error);
//         return
//       }
//       //console.log("les data verifier",JSON.stringify(data));
//       //data.map(d => console.log(d.id_expediteur,d.id_notification))
//       // Récupérer les informations des expéditeurs
//       const expediteurIds = [...new Set((data || []).map(n => n.id_expediteur).filter(Boolean))]
      
//       let expediteursInfo: { [key: string]: { nom: string, prenom: string, photo_profil?: string } } = {}
      
//       if (expediteurIds.length > 0) {
//         // D'abord chercher dans site_utilisateur
//         const { data: siteUsersData } = await supabase
//           .from('utilisateur')
//           .select('id_utilisateur, nom, prenoms,photo_profil')
//           .in('id_utilisateur', expediteurIds)

//         if (siteUsersData) {
//           siteUsersData.forEach(user => {
//             expediteursInfo[user.id_utilisateur] = {
//               nom: user.nom || 'Utilisateur',
//               prenom: user.prenoms || '',
//               photo_profil: user.photo_profil || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(`${user.prenoms} ${user.nom}`)
//             }
//           })
//         }

//         // Ensuite, chercher dans utilisateur_par_role pour obtenir le statut
//     //   const { data: status } = await supabase
//     //     .from('utilisateur_par_role')
//     //     .select('nom_role')
//     //     .eq('id_utilisateur', expediteurIds)
//     //     .single();

//     //      if (status) {
//     //       status.forEach(ur => {
//     //         expediteursInfo[ur.id_utilisateur] = {
//     //           nom: user.nom_role || 'Utilisateur',
              
//     //         }
//     //       })
//     //     }

//    const { data: distinctRoles, error: distinctError } = await supabase
//   .from('utilisateur_par_role')
//   .select('nom_role');
 

// if (distinctError) {
//   console.error('Erreur:', distinctError);
// } else {
//   // Filtrer les doublons
//   const unique = distinctRoles?.filter((role, index, self) => 
//     index === self.findIndex(r => r.nom_role === role.nom_role)
//   );
//   console.log("Rôles distincts:", unique);
// }
         
//         // Puis chercher dans utilisateur pour avoir les photos (si vous avez une relation)
//         // Vous devrez adapter cette partie selon votre structure de données
//       }
//     //console.log('notification');
//       const formatted: Notification[] = (data || []).map((notif: any) => {
//         const expediteur = expediteursInfo[notif.id_expediteur] || { nom: 'Utilisateur', prenom: '' }
//         const fullName = `${expediteur.prenom} ${expediteur.nom}`.trim() || 'Utilisateur inconnu'
//        // console.log('id_expediteur:', notif.id_expediteur, 'Nom complet:', fullName);
//         return {
//           id: notif.id_notification,
//           type: 'comment',
//           user: fullName,
//           avatar: expediteur.photo_profil || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(fullName),
//           action: 'vous a envoyé une notification',
//           time: new Date(notif.date_creation).toLocaleTimeString('fr-FR', {
//             hour: '2-digit',
//             minute: '2-digit'
//           }),
//           isRead: notif.lu,
//           content: notif.message,
//           id_expediteur: notif.id_expediteur
//         }
//       });

//       console.log('Notifications formatées:', formatted.length)
     
//       setNotifications(formatted);
//     } catch (error) {
//       console.error('Erreur lors de la récupération des notifications:', error)
//     }
//   }

//   const initializeData = async () => {
//     setLoading(true)
//     try {
//       // 1. Récupérer l'utilisateur authentifié
//       const {
//         data: { user: authUser },
//       } = await supabase.auth.getUser()

//       if (!authUser) {
//         console.log("Aucun utilisateur authentifié")
//         setLoading(false)
//         return
//       }

//       console.log("Utilisateur authentifié:", authUser.email)

//       // 2. Chercher l'utilisateur dans site_utilisateur
//       const { data: siteUser, error: siteError } = await supabase
//         .from("utilisateur")
//         .select("*")
//         .eq("email", authUser.email)
//         .single()

//       if (siteError || !siteUser) {
//         console.error("Erreur lors de la récupération de site_utilisateur:", siteError)
//         Alert.alert("Erreur", "Utilisateur non trouvé dans site_utilisateur")
//         setLoading(false)
//         return
//       }

//       console.log("Site utilisateur trouvé:", siteUser.id_utilisateur)

//       // 3. Définir l'ID utilisateur actuel et les données du site utilisateur
//       const userId = siteUser.id_utilisateur
//       setCurrentUserId(userId)
//       setCurrentSiteUser({
//         id_site_utilisateur: siteUser.id_site_utilisateur,
//         email: siteUser.email,
//         nom: siteUser.nom,
//         prenom: siteUser.prenom,
//         id_role: siteUser.id_role,
//         statut: siteUser.statut,
//         derniere_connection: new Date(siteUser.derniere_connection),
//         create_at: new Date(siteUser.create_at),
//         update_at: new Date(siteUser.update_at),
//       })

//       // 4. Mettre à jour la dernière connexion
//       await supabase
//         .from("site_utilisateur")
//         .update({
//           derniere_connection: new Date().toISOString(),
//           update_at: new Date().toISOString(),
//         })
//         .eq("id_site_utilisateur", userId)

//       // 5. Récupérer toutes les données en parallèle
//       const [usersData, siteUsersData] = await Promise.all([
//         fetchUsers(),
//         fetchSiteUtilisateurs(),
//       ])

//       // 6. Essayer de trouver l'utilisateur correspondant dans la table utilisateur
//       // (si vous avez une relation entre les deux tables)
//       if (usersData && usersData.length > 0) {
//         // Option 1: Si vous avez une relation par email
//         // const userByEmail = usersData.find(u => u.email === authUser.email)
//         // if (userByEmail) {
//         //   setCurrentUser(userByEmail)
//         //   console.log("Utilisateur trouvé par email:", userByEmail.nom, userByEmail.prenoms)
//         // }
        
//        // Option 2: Si vous avez une relation par ID (vous devrez adapter selon votre structure)
//         const userById = usersData.find(u => u.id_utilisateur === userId)
//         if (userById) {
//           setCurrentUser(userById)
//           console.log("Utilisateur trouvé par email:", userById.nom, userById.prenoms)
//         }
//       }

//       // 7. Récupérer les notifications
//       await getNotifications(userId)

//     } catch (error) {
//       console.error("Erreur lors de l'initialisation:", error)
//       Alert.alert("Erreur", "Impossible de charger les données")
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => {
//     initializeData();
//   }, [])

//   const markAllAsRead = async () => {
//     setNotifications(prev =>
//       prev.map(notif => ({ ...notif, isRead: true }))
//     );

//     // Optionnel: Mettre à jour la base de données
//     if (currentUserId) {
//       try {
//         await supabase
//           .from('notification')
//           .update({ lu: true })
//           .eq('id_destinataire', currentUserId)
//           .eq('lu', false)
//       } catch (error) {
//         console.error('Erreur lors de la mise à jour des notifications:', error)
//       }
//     }
//   };

//   const getNotificationIcon = (type: string) => {
//     switch (type) {
//       case 'like':
//         return '👍';
//       case 'comment':
//         return '💬';
//       case 'friend_request':
//         return '👥';
//       case 'tag':
//         return '🏷️';
//       case 'birthday':
//         return '🎂';
//       default:
//         return '📢';
//     }
//   };

//   const unreadCount = notifications.filter(n => !n.isRead).length;

//   if (loading) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <View style={styles.emptyState}>
//           <Text style={styles.emptyText}>Chargement...</Text>
//           {currentSiteUser && (
//             <Text style={styles.emptySubtext}>
//               Connexion de {currentSiteUser.prenom} {currentSiteUser.nom}
//             </Text>
//           )}
//         </View>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <View>
//           <Text style={styles.title}>Notifications</Text>
//           {currentSiteUser && (
//             <Text style={styles.subtitle}>
//               {currentSiteUser.prenom} {currentSiteUser.nom}
//             </Text>
//           )}
//         </View>
//         {unreadCount > 0 && (
//           <TouchableOpacity onPress={markAllAsRead} style={styles.markAllButton}>
//             <Text style={styles.markAllText}>Tout marquer comme lu</Text>
//           </TouchableOpacity>
//         )}
//       </View>

//       {/* User Info Debug (à supprimer en production)
//       {__DEV__ && currentSiteUser && (
//         <View style={styles.debugInfo}>
//           <Text>Debug - Site User ID: {currentUserId}</Text>
//           <Text>Email: {currentSiteUser.email}</Text>
//           <Text>Current User: {currentUser ? `${currentUser.prenoms} ${currentUser.nom}` : 'Non trouvé'}</Text>
//         </View>
//       )} */}

//       {/* Unread count */}
//       {unreadCount > 0 && (
//         <View style={styles.unreadBanner}>
//           <Text style={styles.unreadText}>
//             {unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue{unreadCount > 1 ? 's' : ''}
//           </Text>
//         </View>
//       )}

//       {/* Notifications List */}
//       <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
//         {notifications.map((notification) => (
//           <TouchableOpacity
//             key={notification.id}
//             style={[
//               styles.notificationItem,
//               !notification.isRead && styles.unreadNotification
//             ]}
//             onPress={() => markAsRead(notification.id)}
//           >
//             {!notification.isRead && <View style={styles.unreadDot} />}
            
//             <Image
//               source={{ uri: notification.avatar }}
//               style={styles.avatar}
//             />
            
//             <View style={styles.notificationContent}>
//               <View style={styles.textContainer}>
//                 <Text style={styles.notificationText}>
//                   <Text style={styles.userName}>{notification.user}</Text>
//                   {' ' + notification.action}
//                 </Text>
                
//                 {notification.content && (
//                   <Text style={styles.contentText}>"{notification.content}"</Text>
//                 )}
                
//                 <Text style={styles.timeText}>{notification.time}</Text>
//               </View>
              
//               <View style={styles.iconContainer}>
//                 <Text style={styles.notificationIcon}>
//                   {getNotificationIcon(notification.type)}
//                 </Text>
//               </View>
//             </View>
//           </TouchableOpacity>
//         ))}
//       </ScrollView>

//       {/* Empty state when no notifications */}
//       {notifications.length === 0 && !loading && (
//         <View style={styles.emptyState}>
//           <Text style={styles.emptyIcon}>🔔</Text>
//           <Text style={styles.emptyText}>Aucune notification</Text>
//           <Text style={styles.emptySubtext}>
//             Vos notifications apparaîtront ici
//           </Text>
//         </View>
//       )}
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f8f9fa',
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingVertical: 15,
//     backgroundColor: '#fff',
//     borderBottomWidth: 1,
//     borderBottomColor: '#e9ecef',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#1c1e21',
//   },
//   subtitle: {
//     fontSize: 12,
//     color: '#65676b',
//     marginTop: 2,
//   },
//   debugInfo: {
//     backgroundColor: '#fff3cd',
//     padding: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: '#e9ecef',
//   },
//   markAllButton: {
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     backgroundColor: '#1877f2',
//     borderRadius: 6,
//   },
//   markAllText: {
//     color: '#fff',
//     fontSize: 12,
//     fontWeight: '600',
//   },
//   unreadBanner: {
//     backgroundColor: '#d0f7da',
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#e9ecef',
//   },
//   unreadText: {
//     color: '#1565c0',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   scrollView: {
//     flex: 1,
//   },
//   notificationItem: {
//     flexDirection: 'row',
//     padding: 16,
//     backgroundColor: '#fff',
//     borderBottomWidth: 1,
//     borderBottomColor: '#e9ecef',
//     position: 'relative',
//   },
//   unreadNotification: {
//      backgroundColor: '#c8f5c6',
//    // backgroundColor: '#00000',
//   },
//   unreadDot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: '#1877f2',
//     position: 'absolute',
//     left: 8,
//     top: 20,
//   },
//   avatar: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     marginRight: 12,
//   },
//   notificationContent: {
//     flex: 1,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   textContainer: {
//     flex: 1,
//   },
//   notificationText: {
//     fontSize: 15,
//     color: '#1c1e21',
//     lineHeight: 20,
//   },
//   userName: {
//     fontWeight: '600',
//     color: '#1c1e21',
//   },
//   contentText: {
//     fontSize: 14,
//     color: '#65676b',
//     fontStyle: 'italic',
//     marginTop: 4,
//     lineHeight: 18,
//   },
//   timeText: {
//     fontSize: 13,
//     color: '#65676b',
//     marginTop: 6,
//   },
//   iconContainer: {
//     marginLeft: 8,
//     justifyContent: 'center',
//   },
//   notificationIcon: {
//     fontSize: 24,
//   },
//   emptyState: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 40,
//   },
//   emptyIcon: {
//     fontSize: 64,
//     marginBottom: 20,
//     opacity: 0.5,
//   },
//   emptyText: {
//     fontSize: 20,
//     fontWeight: '600',
//     color: '#1c1e21',
//     marginBottom: 8,
//   },
//   emptySubtext: {
//     fontSize: 16,
//     color: '#65676b',
//     textAlign: 'center',
//   },
// });

// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   Image,
//   SafeAreaView,
//   Alert,
// } from 'react-native';

// interface User {
//   id_utilisateur: string
//   nom: string
//   email: string
//   photo_profil: string
//   photo_couverture: string
//   created_at: Date
//   prenoms: string
//   id_role: number
//   bio: string | null
//   adresse: string
// }

// interface SiteUtilisateur {
//   id_site_utilisateur: string
//   email: string
//   nom: string
//   prenom: string
//   id_role: number
//   statut: string
//   derniere_connection: Date
//   create_at: Date
//   update_at: Date
// }

// interface Notification {
//   id: string
//   type: string
//   user: string
//   avatar: string
//   action: string
//   time: string
//   isRead: boolean
//   content?: string
//   id_expediteur?: string
// }

// import { supabase } from '~/lib/data';

// export default function NotifScreen() {
//   const [currentUserId, setCurrentUserId] = useState<string>("")
//   const [currentUser, setCurrentUser] = useState<User | null>(null)
//   const [currentSiteUser, setCurrentSiteUser] = useState<SiteUtilisateur | null>(null)
//   const [users, setUsers] = useState<User[]>([])
//   const [siteUtilisateurs, setSiteUtilisateurs] = useState<SiteUtilisateur[]>([])
//   const [loading, setLoading] = useState(true)
//   const [notifications, setNotifications] = useState<Notification[]>([])

//   const markAsRead = async (id: string | number) => {
//     // Mettre à jour l'état local immédiatement
//     setNotifications(prev =>
//       prev.map(notif =>
//         notif.id === id.toString() ? { ...notif, isRead: true } : notif
//       )
//     );

//     // Mettre à jour la base de données
//     try {
//       await supabase
//         .from('notification')
//         .update({ lu: true })
//         .eq('id_notification', id.toString());
//     } catch (error) {
//       console.error('Erreur lors de la mise à jour de la notification:', error);
//     }
//   };
  
//   const fetchSiteUtilisateurs = async () => {
//     try {
//       const { data, error } = await supabase.from("utilisateur").select("*")

//       if (error) {
//         console.error("Erreur lors de la récupération des utilisateurs du site:", error)
//         return
//       }

//       const formattedData: SiteUtilisateur[] = (data || []).map((item: any) => ({
//         id_site_utilisateur: item.id_site_utilisateur,
//         email: item.email,
//         nom: item.nom,
//         prenom: item.prenom,
//         id_role: item.id_role,
//         statut: item.statut,
//         derniere_connection: new Date(item.derniere_connection),
//         create_at: new Date(item.create_at),
//         update_at: new Date(item.update_at),
//       }))

//       setSiteUtilisateurs(formattedData)
//       console.log("Utilisateurs du site récupérés:", formattedData.length)
      
//       return formattedData
//     } catch (error) {
//       console.error("Erreur fetchSiteUtilisateurs:", error)
//       return []
//     }
//   }

//   const fetchUsers = async () => {
//     try {
//       const { data, error } = await supabase.from("utilisateur").select("*")

//       if (error) {
//         console.error("Erreur lors de la récupération des utilisateurs:", error)
//         return []
//       }

//       const formattedData: User[] = (data || []).map((item: any) => ({
//         id_utilisateur: item.id_utilisateur,
//         nom: item.nom,
//         email: item.email,
//         photo_profil: item.photo_profil,
//         photo_couverture: item.photo_couverture,
//         created_at: new Date(item.created_at),
//         prenoms: item.prenoms,
//         id_role: item.id_role,
//         bio: item.bio,
//         adresse: item.adresse,
//       }))

//       setUsers(formattedData)
//       console.log("Utilisateurs récupérés:", formattedData.length)
      
//       return formattedData
//     } catch (error) {
//       console.error("Erreur fetchUsers:", error)
//       return []
//     }
//   }

//   const getNotifications = async (userId: string) => {
//     if (!userId) {
//       console.log("Pas d'ID utilisateur pour récupérer les notifications")
//       return
//     }
//     console.log("voici l'id actuel",userId);
//     try {
//       const { data, error } = await supabase
//         .from('notification')
//         .select(`
//           id_notification,
//           id_expediteur,
//           id_destinataire,
//           message,
//           date_creation,
//           lu
//         `)
//         .eq('id_destinataire', userId)
//         .order('date_creation', { ascending: false });

//       if (error) {
//         console.error('Erreur Supabase notifications:', error);
//         return
//       }

//       // Récupérer les informations des expéditeurs
//       const expediteurIds = [...new Set((data || []).map(n => n.id_expediteur).filter(Boolean))]
      
//       let expediteursInfo: { [key: string]: { nom: string, prenom: string, photo_profil?: string } } = {}
      
//       if (expediteurIds.length > 0) {
//         // D'abord chercher dans site_utilisateur
//         const { data: siteUsersData } = await supabase
//           .from('utilisateur')
//           .select('id_utilisateur, nom, prenoms,photo_profil')
//           .in('id_utilisateur', expediteurIds)

//         if (siteUsersData) {
//           siteUsersData.forEach(user => {
//             expediteursInfo[user.id_utilisateur] = {
//               nom: user.nom || 'Utilisateur',
//               prenom: user.prenoms || '',
//               photo_profil: user.photo_profil || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(`${user.prenoms} ${user.nom}`)
//             }
//           })
//         }

//         const { data: distinctRoles, error: distinctError } = await supabase
//           .from('utilisateur_par_role')
//           .select('nom_role');
     
//         if (distinctError) {
//           console.error('Erreur:', distinctError);
//         } else {
//           // Filtrer les doublons
//           const unique = distinctRoles?.filter((role, index, self) => 
//             index === self.findIndex(r => r.nom_role === role.nom_role)
//           );
//           console.log("Rôles distincts:", unique);
//         }
//       }

//       const formatted: Notification[] = (data || []).map((notif: any) => {
//         const expediteur = expediteursInfo[notif.id_expediteur] || { nom: 'Utilisateur', prenom: '' }
//         const fullName = `${expediteur.prenom} ${expediteur.nom}`.trim() || 'Utilisateur inconnu'
        
//         return {
//           id: notif.id_notification,
//           type: 'comment',
//           user: fullName,
//           avatar: expediteur.photo_profil || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(fullName),
//           action: 'vous a envoyé une notification',
//           time: new Date(notif.date_creation).toLocaleTimeString('fr-FR', {
//             hour: '2-digit',
//             minute: '2-digit'
//           }),
//           isRead: notif.lu,
//           content: notif.message,
//           id_expediteur: notif.id_expediteur
//         }
//       });

//       console.log('Notifications formatées:', formatted.length)
     
//       setNotifications(formatted);
//     } catch (error) {
//       console.error('Erreur lors de la récupération des notifications:', error)
//     }
//   }

//   // Configuration de l'écoute en temps réel
//   const setupRealtimeSubscription = (userId: string) => {
//     if (!userId) return;

//     console.log('Configuration de l\'écoute temps réel pour l\'utilisateur:', userId);

//     // Écouter les changements dans la table notification
//     const notificationSubscription = supabase
//       .channel('notification_changes')
//       .on(
//         'postgres_changes',
//         {
//           event: '*', // Écouter tous les événements (INSERT, UPDATE, DELETE)
//           schema: 'public',
//           table: 'notification',
//           filter: `id_destinataire=eq.${userId}`, // Filtrer par destinataire
//         },
//         (payload) => {
//           console.log('Changement détecté dans les notifications:', payload);
          
//           if (payload.eventType === 'INSERT') {
//             // Nouvelle notification reçue
//             console.log('Nouvelle notification reçue');
//             getNotifications(userId); // Recharger toutes les notifications
//           } else if (payload.eventType === 'UPDATE') {
//             // Notification mise à jour (ex: marquée comme lue)
//             console.log('Notification mise à jour');
//             getNotifications(userId);
//           } else if (payload.eventType === 'DELETE') {
//             // Notification supprimée
//             console.log('Notification supprimée');
//             getNotifications(userId);
//           }
//         }
//       )
//       .subscribe((status) => {
//         console.log('Statut de l\'abonnement notifications:', status);
//       });

//     // Écouter les changements dans la table utilisateur (pour les avatars/noms)
//     const userSubscription = supabase
//       .channel('user_changes')
//       .on(
//         'postgres_changes',
//         {
//           event: 'UPDATE',
//           schema: 'public',
//           table: 'utilisateur',
//         },
//         (payload) => {
//           console.log('Changement détecté dans les utilisateurs:', payload);
//           // Recharger les notifications pour mettre à jour les infos utilisateurs
//           getNotifications(userId);
//         }
//       )
//       .subscribe((status) => {
//         console.log('Statut de l\'abonnement utilisateurs:', status);
//       });

//     // Retourner une fonction de nettoyage
//     return () => {
//       console.log('Nettoyage des abonnements temps réel');
//       supabase.removeChannel(notificationSubscription);
//       supabase.removeChannel(userSubscription);
//     };
//   };

//   const initializeData = async () => {
//     setLoading(true)
//     try {
//       // 1. Récupérer l'utilisateur authentifié
//       const {
//         data: { user: authUser },
//       } = await supabase.auth.getUser()

//       if (!authUser) {
//         console.log("Aucun utilisateur authentifié")
//         setLoading(false)
//         return
//       }

//       console.log("Utilisateur authentifié:", authUser.email)

//       // 2. Chercher l'utilisateur dans site_utilisateur
//       const { data: siteUser, error: siteError } = await supabase
//         .from("utilisateur")
//         .select("*")
//         .eq("email", authUser.email)
//         .single()

//       if (siteError || !siteUser) {
//         console.error("Erreur lors de la récupération de site_utilisateur:", siteError)
//         Alert.alert("Erreur", "Utilisateur non trouvé dans site_utilisateur")
//         setLoading(false)
//         return
//       }

//       console.log("Site utilisateur trouvé:", siteUser.id_utilisateur)

//       // 3. Définir l'ID utilisateur actuel et les données du site utilisateur
//       const userId = siteUser.id_utilisateur
//       setCurrentUserId(userId)
//       setCurrentSiteUser({
//         id_site_utilisateur: siteUser.id_site_utilisateur,
//         email: siteUser.email,
//         nom: siteUser.nom,
//         prenom: siteUser.prenom,
//         id_role: siteUser.id_role,
//         statut: siteUser.statut,
//         derniere_connection: new Date(siteUser.derniere_connection),
//         create_at: new Date(siteUser.create_at),
//         update_at: new Date(siteUser.update_at),
//       })

//       // 4. Mettre à jour la dernière connexion
//       await supabase
//         .from("site_utilisateur")
//         .update({
//           derniere_connection: new Date().toISOString(),
//           update_at: new Date().toISOString(),
//         })
//         .eq("id_site_utilisateur", userId)

//       // 5. Récupérer toutes les données en parallèle
//       const [usersData, siteUsersData] = await Promise.all([
//         fetchUsers(),
//         fetchSiteUtilisateurs(),
//       ])

//       // 6. Essayer de trouver l'utilisateur correspondant dans la table utilisateur
//       if (usersData && usersData.length > 0) {
//         const userById = usersData.find(u => u.id_utilisateur === userId)
//         if (userById) {
//           setCurrentUser(userById)
//           console.log("Utilisateur trouvé par email:", userById.nom, userById.prenoms)
//         }
//       }

//       // 7. Récupérer les notifications
//       await getNotifications(userId)

//       // 8. Configurer l'écoute temps réel
//       const cleanup = setupRealtimeSubscription(userId);
      
//       // Stocker la fonction de nettoyage pour l'utiliser dans useEffect
//       return cleanup;

//     } catch (error) {
//       console.error("Erreur lors de l'initialisation:", error)
//       Alert.alert("Erreur", "Impossible de charger les données")
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => {
//     let cleanup: (() => void) | undefined;

//     const init = async () => {
//       cleanup = await initializeData();
//     };

//     init();

//     // Fonction de nettoyage
//     return () => {
//       if (cleanup) {
//         cleanup();
//       }
//     };
//   }, [])

//   const markAllAsRead = async () => {
//     setNotifications(prev =>
//       prev.map(notif => ({ ...notif, isRead: true }))
//     );

//     // Mettre à jour la base de données
//     if (currentUserId) {
//       try {
//         await supabase
//           .from('notification')
//           .update({ lu: true })
//           .eq('id_destinataire', currentUserId)
//           .eq('lu', false)
//       } catch (error) {
//         console.error('Erreur lors de la mise à jour des notifications:', error)
//       }
//     }
//   };

//   const getNotificationIcon = (type: string) => {
//     switch (type) {
//       case 'like':
//         return '👍';
//       case 'comment':
//         return '💬';
//       case 'friend_request':
//         return '👥';
//       case 'tag':
//         return '🏷️';
//       case 'birthday':
//         return '🎂';
//       default:
//         return '📢';
//     }
//   };

//   const unreadCount = notifications.filter(n => !n.isRead).length;

//   if (loading) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <View style={styles.emptyState}>
//           <Text style={styles.emptyText}>Chargement...</Text>
//           {currentSiteUser && (
//             <Text style={styles.emptySubtext}>
//               Connexion de {currentSiteUser.prenom} {currentSiteUser.nom}
//             </Text>
//           )}
//         </View>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <View>
//           <Text style={styles.title}>Notifications</Text>
//           {currentSiteUser && (
//             <Text style={styles.subtitle}>
//               {currentSiteUser.prenom} {currentSiteUser.nom}
//             </Text>
//           )}
//         </View>
//         {unreadCount > 0 && (
//           <TouchableOpacity onPress={markAllAsRead} style={styles.markAllButton}>
//             <Text style={styles.markAllText}>Tout marquer comme lu</Text>
//           </TouchableOpacity>
//         )}
//       </View>

//       {/* Unread count */}
//       {unreadCount > 0 && (
//         <View style={styles.unreadBanner}>
//           <Text style={styles.unreadText}>
//             {unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue{unreadCount > 1 ? 's' : ''}
//           </Text>
//         </View>
//       )}

//       {/* Notifications List */}
//       <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
//         {notifications.map((notification) => (
//           <TouchableOpacity
//             key={notification.id}
//             style={[
//               styles.notificationItem,
//               !notification.isRead && styles.unreadNotification
//             ]}
//             onPress={() => markAsRead(notification.id)}
//           >
//             {!notification.isRead && <View style={styles.unreadDot} />}
            
//             <Image
//               source={{ uri: notification.avatar }}
//               style={styles.avatar}
//             />
            
//             <View style={styles.notificationContent}>
//               <View style={styles.textContainer}>
//                 <Text style={styles.notificationText}>
//                   <Text style={styles.userName}>{notification.user}</Text>
//                   {' ' + notification.action}
//                 </Text>
                
//                 {notification.content && (
//                   <Text style={styles.contentText}>"{notification.content}"</Text>
//                 )}
                
//                 <Text style={styles.timeText}>{notification.time}</Text>
//               </View>
              
//               <View style={styles.iconContainer}>
//                 <Text style={styles.notificationIcon}>
//                   {getNotificationIcon(notification.type)}
//                 </Text>
//               </View>
//             </View>
//           </TouchableOpacity>
//         ))}
//       </ScrollView>

//       {/* Empty state when no notifications */}
//       {notifications.length === 0 && !loading && (
//         <View style={styles.emptyState}>
//           <Text style={styles.emptyIcon}>🔔</Text>
//           <Text style={styles.emptyText}>Aucune notification</Text>
//           <Text style={styles.emptySubtext}>
//             Vos notifications apparaîtront ici
//           </Text>
//         </View>
//       )}
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f0fdf4', // Vert très clair pour le fond
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingVertical: 15,
//     backgroundColor: '#ffffff',
//     borderBottomWidth: 2,
//     borderBottomColor: '#8efa84', // Bordure verte claire
//     shadowColor: '#27961d',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//     elevation: 3,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#166534', // Vert foncé
//   },
//   subtitle: {
//     fontSize: 12,
//     color: '#22c55e', // Vert moyen
//     marginTop: 2,
//   },
//   debugInfo: {
//     backgroundColor: '#dcfce7', // Vert très clair
//     padding: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: '#8efa84',
//   },
//   markAllButton: {
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     backgroundColor: '#27961d', // Vert foncé
//     borderRadius: 8,
//     shadowColor: '#166534',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.2,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   markAllText: {
//     color: '#ffffff',
//     fontSize: 12,
//     fontWeight: '600',
//   },
//   unreadBanner: {
//     backgroundColor: '#8efa84', // Vert clair
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#22c55e',
//   },
//   unreadText: {
//     color: '#166534', // Vert foncé
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   scrollView: {
//     flex: 1,
//   },
//   notificationItem: {
//     flexDirection: 'row',
//     padding: 16,
//     backgroundColor: '#ffffff',
//     borderBottomWidth: 1,
//     borderBottomColor: '#dcfce7', // Bordure verte très claire
//     position: 'relative',
//     marginHorizontal: 8,
//     marginVertical: 2,
//     borderRadius: 8,
//     shadowColor: '#22c55e',
//     shadowOffset: {
//       width: 0,
//       height: 1,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 1,
//   },
//   unreadNotification: {
//     backgroundColor: '#f0fdf4', // Fond vert très clair pour les notifications non lues
//     borderLeftWidth: 4,
//     borderLeftColor: '#22c55e', // Bordure gauche verte
//   },
//   unreadDot: {
//     width: 10,
//     height: 10,
//     borderRadius: 5,
//     backgroundColor: '#27961d', // Point vert foncé
//     position: 'absolute',
//     left: 8,
//     top: 20,
//     shadowColor: '#166534',
//     shadowOffset: {
//       width: 0,
//       height: 1,
//     },
//     shadowOpacity: 0.3,
//     shadowRadius: 1,
//     elevation: 2,
//   },
//   avatar: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     marginRight: 12,
//     borderWidth: 2,
//     borderColor: '#8efa84', // Bordure verte claire pour l'avatar
//   },
//   notificationContent: {
//     flex: 1,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   textContainer: {
//     flex: 1,
//   },
//   notificationText: {
//     fontSize: 15,
//     color: '#1c1e21',
//     lineHeight: 20,
//   },
//   userName: {
//     fontWeight: '600',
//     color: '#166534', // Nom d'utilisateur en vert foncé
//   },
//   contentText: {
//     fontSize: 14,
//     color: '#22c55e', // Contenu en vert moyen
//     fontStyle: 'italic',
//     marginTop: 4,
//     lineHeight: 18,
//     backgroundColor: '#f0fdf4', // Fond vert très clair
//     padding: 8,
//     borderRadius: 6,
//     borderLeftWidth: 3,
//     borderLeftColor: '#8efa84',
//   },
//   timeText: {
//     fontSize: 13,
//     color: '#16a34a', // Vert pour l'heure
//     marginTop: 6,
//     fontWeight: '500',
//   },
//   iconContainer: {
//     marginLeft: 8,
//     justifyContent: 'center',
//     backgroundColor: '#dcfce7', // Fond vert clair pour l'icône
//     borderRadius: 20,
//     width: 40,
//     height: 40,
//     alignItems: 'center',
//   },
//   notificationIcon: {
//     fontSize: 24,
//   },
//   emptyState: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 40,
//     backgroundColor: '#f0fdf4', // Fond vert très clair
//   },
//   emptyIcon: {
//     fontSize: 64,
//     marginBottom: 20,
//     opacity: 0.6,
//   },
//   emptyText: {
//     fontSize: 20,
//     fontWeight: '600',
//     color: '#166534', // Vert foncé
//     marginBottom: 8,
//   },
//   emptySubtext: {
//     fontSize: 16,
//     color: '#22c55e', // Vert moyen
//     textAlign: 'center',
//   },
// });