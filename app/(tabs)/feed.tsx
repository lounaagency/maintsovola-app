import { useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import SubNavTabs from '../../components/SubNavTabs';
import { useProjectData } from '../../hooks/use-project-data';
import FilterContainer from '~/components/FilterContainer';

export default function FeedScreen() {
  const tabs = ['Pour vous', 'Abonnements'];
  const [activeTab, setActiveTab] = useState('Pour vous');
  const { projects, loading, error, toggleLike } = useProjectData({
    followedUsersOnly: activeTab === 'Abonnements',
    status: 'en financement'
  });

  const handleRemoveFilter = (label: string) => {
    // Logique pour supprimer un filtre
  };

  const filters = ['Région', 'District', 'Commune'];

  const renderProject = ({ item }: { item: any }) => (
    <View style={styles.projectCard}>
      {item.images?.length > 0 && (
        <Image source={{ uri: item.images[0] }} style={styles.projectImage} resizeMode="cover" />
      )}
      <View style={styles.projectHeader}>
        <View style={styles.projectTitleContainer}>
          <Text style={styles.projectTitle}>{item.title}</Text>
          <Text style={styles.projectLocation}>
            {item.location?.commune}, {item.location?.district}
          </Text>
        </View>
        <View style={styles.projectOwner}>
          {item.farmer?.avatar && (
            <Image source={{ uri: item.farmer.avatar }} style={styles.ownerPhoto} />
          )}
          <Text style={styles.ownerName}>{item.farmer?.name}</Text>
        </View>
      </View>
      <Text style={styles.projectDescription} numberOfLines={3}>
        {item.description}
      </Text>
      <View style={styles.culturesContainer}>
        <Text style={styles.culturesLabel}>Culture:</Text>
        <Text style={styles.culturesText}>{item.cultivationType}</Text>
      </View>
      <View style={styles.fundingInfo}>
        <View style={styles.fundingRow}>
          <Text style={styles.fundingText}>
            <Text style={styles.fundingAmount}>
              {item.currentFunding?.toLocaleString('fr-FR')}€
            </Text>
            {' / '}
            {item.fundingGoal?.toLocaleString('fr-FR')}€
          </Text>
          <Text style={styles.progressText}>
            {item.isFullyFunded ? 'Financé ✓' : `${Math.round((item.currentFunding / item.fundingGoal) * 100)}%`}
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min((item.currentFunding / item.fundingGoal) * 100, 100)}%`,
                backgroundColor: item.isFullyFunded ? '#10B981' : '#3B82F6'
              }
            ]}
          />
        </View>
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionButton} onPress={() => toggleLike(item.id, item.isLiked)}>
            <Text style={[styles.actionText, item.isLiked && styles.likedText]}>
              {item.isLiked ? '❤️' : '🤍'} {item.likes}
            </Text>
          </TouchableOpacity>
          <Text style={styles.actionText}>💬 {item.comments}</Text>
          <Text style={styles.actionText}>{item.cultivationArea}ha</Text>
        </View>
      </View>
    </View>
  );

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
      <FilterContainer labels={filters} onRemove={handleRemoveFilter} />
      <FlatList
        data={projects}
        renderItem={renderProject}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
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
  listContainer: { paddingBottom: 20 },
  projectCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  projectImage: { width: '100%', height: 200 },
  projectHeader: { padding: 16, paddingBottom: 8, flexDirection: 'row', justifyContent: 'space-between' },
  projectTitleContainer: { marginBottom: 8 },
  projectTitle: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  projectLocation: { fontSize: 14, color: '#6B7280' },
  projectOwner: { flexDirection: 'row', alignItems: 'center' },
  ownerPhoto: { width: 32, height: 32, borderRadius: 16, marginRight: 8 },
  ownerName: { fontSize: 14, fontWeight: '500', color: '#374151' },
  projectDescription: { fontSize: 14, color: '#6B7280', lineHeight: 20, paddingHorizontal: 16, marginBottom: 12 },
  culturesContainer: { paddingHorizontal: 16, marginBottom: 12 },
  culturesLabel: { fontSize: 12, fontWeight: '600', color: '#374151', marginBottom: 4 },
  culturesText: { fontSize: 12, color: '#6B7280', backgroundColor: '#F3F4F6', padding: 8, borderRadius: 6 },
  fundingInfo: { padding: 16 },
  fundingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  fundingText: { fontSize: 14, color: '#6B7280' },
  fundingAmount: { fontWeight: '600', color: '#000' },
  progressText: { fontSize: 14, fontWeight: '600', color: '#10B981' },
  progressBar: { height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, overflow: 'hidden', marginBottom: 12 },
  progressFill: { height: '100%', borderRadius: 3 },
  actionsRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  actionButton: { padding: 4 },
  actionText: { fontSize: 14, color: '#6B7280' },
  likedText: { color: '#EF4444' },
});
