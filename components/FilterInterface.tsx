// Composant d'interface pour ajouter des filtres
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

type FilterInterfaceProps = {
  onRegionFilter: (region: string) => void;
  onDistrictFilter: (district: string) => void;
  onCommuneFilter: (commune: string) => void;
  onCultureFilter: (culture: string) => void;
  onStatusFilter: (status: string) => void;
};

export default function FilterInterface({
  onRegionFilter,
  onDistrictFilter,
  onCommuneFilter,
  onCultureFilter,
  onStatusFilter
}: FilterInterfaceProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ajouter des filtres :</Text>
      
      <View style={styles.filtersGrid}>
        {/* Filtres par région */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>Régions</Text>
          <Pressable 
            style={styles.filterButton} 
            onPress={() => onRegionFilter('Analamanga')}
          >
            <Text style={styles.filterButtonText}>Analamanga</Text>
          </Pressable>
          <Pressable 
            style={styles.filterButton} 
            onPress={() => onRegionFilter('Vakinankaratra')}
          >
            <Text style={styles.filterButtonText}>Vakinankaratra</Text>
          </Pressable>
        </View>

        {/* Filtres par culture */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>Cultures</Text>
          <Pressable 
            style={styles.filterButton} 
            onPress={() => onCultureFilter('riz')}
          >
            <Text style={styles.filterButtonText}>Riz</Text>
          </Pressable>
          <Pressable 
            style={styles.filterButton} 
            onPress={() => onCultureFilter('voanjo')}
          >
            <Text style={styles.filterButtonText}>Voanjo</Text>
          </Pressable>
          <Pressable 
            style={styles.filterButton} 
            onPress={() => onCultureFilter('maïs')}
          >
            <Text style={styles.filterButtonText}>Maïs</Text>
          </Pressable>
        </View>

        {/* Filtres par district */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>Districts</Text>
          <Pressable 
            style={styles.filterButton} 
            onPress={() => onDistrictFilter('Antananarivo')}
          >
            <Text style={styles.filterButtonText}>Antananarivo</Text>
          </Pressable>
          <Pressable 
            style={styles.filterButton} 
            onPress={() => onDistrictFilter('Antsirabe')}
          >
            <Text style={styles.filterButtonText}>Antsirabe</Text>
          </Pressable>
        </View>

        {/* Filtres par statut */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>Statut</Text>
          <Pressable 
            style={styles.filterButton} 
            onPress={() => onStatusFilter('en financement')}
          >
            <Text style={styles.filterButtonText}>En financement</Text>
          </Pressable>
          <Pressable 
            style={styles.filterButton} 
            onPress={() => onStatusFilter('financé')}
          >
            <Text style={styles.filterButtonText}>Financé</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#374151',
  },
  filtersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  filterSection: {
    minWidth: 100,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  filterButton: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
});


// Exemple d'utilisation complète du système de filtres dans FeedScreen

/*
FONCTIONNALITÉS IMPLÉMENTÉES :

1. GESTION D'ÉTAT DES FILTRES
   - activeFilters: Record<string, string> stocke les filtres actifs
   - addFilter(): ajoute ou met à jour un filtre
   - removeFilter(): supprime un filtre spécifique
   - clearAllFilters(): efface tous les filtres

2. INTÉGRATION AVEC useProjectData
   - Les filtres sont passés directement au hook via spread operator
   - Le hook se recharge automatiquement quand les filtres changent
   - Support des filtres : region, district, commune, culture, status

3. INTERFACE UTILISATEUR
   - FilterContainer: affiche les filtres actifs avec possibilité de suppression
   - FilterInterface: boutons pour ajouter des filtres rapidement
   - SubNavTabs: gestion des onglets "Pour vous" / "Abonnements"

4. EXEMPLE D'UTILISATION :

// Dans votre composant
const [activeFilters, setActiveFilters] = useState({
  culture: 'riz',
  region: 'Analamanga'
});

// Les filtres sont automatiquement envoyés à useProjectData :
const { projects } = useProjectData({
  followedUsersOnly: activeTab === 'Abonnements',
  status: 'en financement',
  ...activeFilters  // culture: 'riz', region: 'Analamanga'
});

5. ACTIONS DISPONIBLES :
   - Cliquer sur un bouton dans FilterInterface → ajoute le filtre
   - Cliquer sur le X dans FilterContainer → supprime le filtre
   - Cliquer sur "Effacer les filtres" → supprime tous les filtres

6. EXEMPLES DE FILTRES SUPPORTÉS :
   - { culture: 'voanjo' } → affiche "Culture: voanjo"
   - { region: 'Analamanga' } → affiche "Région: Analamanga"  
   - { status: 'financé' } → affiche "Statut: financé"
   - { district: 'Antananarivo' } → affiche "District: Antananarivo"

7. DEBUGGING :
   - console.log affiche les filtres à chaque changement
   - Vérifiez la console pour voir les filtres envoyés au hook

PROCHAINES ÉTAPES POSSIBLES :
- Ajouter un modal de filtres avancés
- Sauvegarder les préférences de filtres
- Ajouter des filtres par prix, date, etc.
- Intégrer avec une API de suggestions
*/

export const exempleUtilisation = {
  // Filtres multiples
  filtresExemple1: {
    culture: 'riz',
    region: 'Analamanga',
    status: 'en financement'
  },
  
  // Filtre unique
  filtresExemple2: {
    district: 'Antananarivo'
  },
  
  // Pas de filtres
  filtresExemple3: {}
};