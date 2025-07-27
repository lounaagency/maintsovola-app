import { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import SubNavTabs from '../../components/SubNavTabs';
import { useProjectData } from '../../hooks/use-project-data';
import FeedList from '@/components/FeedList';

export default function FeedScreen() {
  const tabs = ['Pour vous', 'Abonnements'];
  const [activeTab, setActiveTab] = useState('Pour vous');
  const { projects, loading, error } = useProjectData({
    followedUsersOnly: activeTab === 'Abonnements',
    status: 'en financement',
  });

  // TODO: Récupérer l'ID de l'utilisateur connecté depuis le contexte d'authentification
  const userId = 1; // Temporaire pour les tests

  const handleShare = (projectId: number) => {
    console.log('Share project:', projectId);
    // Logique pour le partage à implémenter
  };

  const handleInvest = (projectId: number) => {
    console.log('Invest in project:', projectId);
    // Logique pour l'investissement à implémenter
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Chargement des projets...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Erreur: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Projets en financement</Text>
      <SubNavTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      <FeedList
        projects={projects}
        loading={loading}
        userId={userId}
        onShare={handleShare}
        onInvest={handleInvest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  centerContent: { justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  loadingText: { marginTop: 10, fontSize: 16, color: '#6B7280' },
  errorText: { fontSize: 16, color: '#EF4444', textAlign: 'center' },
});
