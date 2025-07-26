// app/notifications/index.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
// import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
// import Navbar from '../../components/Navbar';

interface Notification {
  id: string;
  type: 'terrain' | 'projet' | 'system' | 'message' | 'validation';
  title: string;
  description: string;
  time: string;
  isNew: boolean;
  priority: 'low' | 'medium' | 'high';
  actionable?: boolean;
  relatedId?: string;
}

const NotificationsScreen = () => {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'new' | 'terrain' | 'projet'>('all');

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'terrain',
      title: 'Nouveau terrain validé',
      description: 'Votre terrain "Parcelle Ankadifotsy" a été validé et est maintenant visible par tous les utilisateurs.',
      time: 'il y a 2 heures',
      isNew: true,
      priority: 'high',
      actionable: true,
      relatedId: 'terrain_123'
    },
    {
      id: '2',
      type: 'message',
      title: 'Nouveau message',
      description: 'Vous avez reçu un nouveau message de l\'administrateur concernant votre projet.',
      time: 'il y a 4 heures',
      isNew: true,
      priority: 'medium',
      actionable: true
    },
    {
      id: '3',
      type: 'projet',
      title: 'Projet en attente',
      description: 'Votre projet "Construction Villa" nécessite une validation supplémentaire.',
      time: 'il y a 1 jour',
      isNew: true,
      priority: 'medium',
      actionable: true,
      relatedId: 'projet_456'
    },
    {
      id: '4',
      type: 'validation',
      title: 'Document requis',
      description: 'Veuillez fournir une pièce d\'identité pour finaliser votre validation.',
      time: 'il y a 2 jours',
      isNew: false,
      priority: 'high',
      actionable: true
    },
    {
      id: '5',
      type: 'system',
      title: 'Mise à jour disponible',
      description: 'Une nouvelle version de l\'application Maintso Vola est disponible avec de nouvelles fonctionnalités.',
      time: 'il y a 3 jours',
      isNew: false,
      priority: 'low',
      actionable: false
    },
    {
      id: '6',
      type: 'terrain',
      title: 'Terrain rejeté',
      description: 'Votre terrain "Lot Ambohipo" a été rejeté. Raison: Documents incomplets.',
      time: 'il y a 5 jours',
      isNew: false,
      priority: 'high',
      actionable: true,
      relatedId: 'terrain_789'
    }
  ]);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'terrain':
        return 'location-on';
      case 'projet':
        return 'description';
      case 'message':
        return 'chat';
      case 'validation':
        return 'verified';
      case 'system':
        return 'settings';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type: Notification['type'], priority: Notification['priority']) => {
    if (priority === 'high') return 'text-red-600';
    if (priority === 'medium') return 'text-orange-600';
    
    switch (type) {
      case 'terrain':
        return 'text-green-600';
      case 'projet':
        return 'text-blue-600';
      case 'message':
        return 'text-purple-600';
      case 'validation':
        return 'text-yellow-600';
      case 'system':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const getBgColor = (type: Notification['type'], priority: Notification['priority']) => {
    if (priority === 'high') return 'bg-red-100';
    if (priority === 'medium') return 'bg-orange-100';
    
    switch (type) {
      case 'terrain':
        return 'bg-green-100';
      case 'projet':
        return 'bg-blue-100';
      case 'message':
        return 'bg-purple-100';
      case 'validation':
        return 'bg-yellow-100';
      case 'system':
        return 'bg-gray-100';
      default:
        return 'bg-gray-100';
    }
  };

//   const markAsRead = (id: string) => {
//     setNotifications(prev =>
//       prev.map(notification =>
//         notification.id === id ? { ...notification, isNew: false } : notification
//       )
//     );
  };    