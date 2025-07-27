import { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import SubNavTabs from '~/components/SubNavTabs';
import { useProjectData } from '~/hooks/use-project-data';
import FeedList from '~/components/FeedList';
import FilterContainer from '~/components/FilterContainer';
import FilterInterface from '~/components/FilterInterface';

export default function FeedScreen() {
  const tabs = ['Pour vous', 'Abonnements'];
  const [activeTab, setActiveTab] = useState('Pour vous');
  
  // État pour gérer les filtres
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  
  // Utilisation du hook avec les filtres
  const { projects, loading, error } = useProjectData({
    followedUsersOnly: activeTab === 'Abonnements',
    status: 'en financement',
    ...activeFilters, // Spread des filtres actifs
  });

  // TODO: Récupérer l'ID de l'utilisateur connecté depuis le contexte d'authentification
  const userId = 1; // Temporaire pour les tests

  // Fonction pour ajouter un filtre
  const addFilter = (key: string, value: string) => {
    setActiveFilters(prev => {
      const newFilters = {
        ...prev,
        [key]: value
      };
      console.log('Filtres mis à jour:', newFilters);
      return newFilters;
    });
  };

  // Fonction pour supprimer un filtre spécifique
  const removeFilter = (key: string) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  };

  // Fonction pour effacer tous les filtres
  const clearAllFilters = () => {
    setActiveFilters({});
  };

  // Fonctions pour ajouter des filtres spécifiques (exemples)
  const handleRegionFilter = (region: string) => {
    addFilter('region', region);
  };

  const handleDistrictFilter = (district: string) => {
    addFilter('district', district);
  };

  const handleCommuneFilter = (commune: string) => {
    addFilter('commune', commune);
  };

  const handleCultureFilter = (culture: string) => {
    addFilter('culture', culture);
  };

  const handleStatusFilter = (status: string) => {
    addFilter('status', status);
  };

  const handleShare = (projectId: number) => {
    console.log('Share project:', projectId);
    // Logique pour le partage à implémenter
  };

  const handleInvest = (projectId: number) => {
    console.log('Invest in project:', projectId);
    // Logique pour l'investissement à implémenter
  };

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
      
      {/* Conteneur des filtres actifs */}
      <FilterContainer
        filters={activeFilters}
        onRemove={removeFilter}
        onClearAll={clearAllFilters}
      />
      
      {/* Interface pour ajouter des filtres */}
      <FilterInterface
        onRegionFilter={handleRegionFilter}
        onDistrictFilter={handleDistrictFilter}
        onCommuneFilter={handleCommuneFilter}
        onCultureFilter={handleCultureFilter}
        onStatusFilter={handleStatusFilter}
      />
      
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
