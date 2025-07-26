import { useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import SubNavTabs from '../../components/SubNavTabs';

// Données d'exemple pour les projets
const mockProjects = [
  {
    id: '1',
    title: 'Application Mobile Innovative',
    description: 'Une application révolutionnaire qui change la donne dans le secteur technologique.',
    category: 'Tech',
    funding: '45000€',
    target: '100000€',
    progress: 45,
  },
  {
    id: '2', 
    title: 'Restaurant Écologique',
    description: 'Un restaurant utilisant uniquement des produits locaux et biologiques.',
    category: 'Restauration',
    funding: '78000€',
    target: '150000€',
    progress: 52,
  },
  {
    id: '3',
    title: 'Plateforme E-learning',
    description: 'Une plateforme d\'apprentissage en ligne pour les étudiants africains.',
    category: 'Éducation',
    funding: '32000€',
    target: '80000€',
    progress: 40,
  },
  {
    id: '4',
    title: 'Startup AgriTech',
    description: 'Solution technologique pour optimiser l\'agriculture urbaine.',
    category: 'Agriculture',
    funding: '65000€',
    target: '120000€',
    progress: 54,
  },
];

export default function FeedScreen() {
  const tabs = ['Pour vous', 'Abonnements'];
  const [activeTab, setActiveTab] = useState('Pour vous');

  const renderProject = ({ item }: { item: typeof mockProjects[0] }) => (
    <View style={styles.projectCard}>
      <View style={styles.projectHeader}>
        <Text style={styles.projectTitle}>{item.title}</Text>
        <Text style={styles.projectCategory}>{item.category}</Text>
      </View>
      <Text style={styles.projectDescription}>{item.description}</Text>
      
      <View style={styles.fundingInfo}>
        <View style={styles.fundingRow}>
          <Text style={styles.fundingText}>
            <Text style={styles.fundingAmount}>{item.funding}</Text> collectés sur {item.target}
          </Text>
          <Text style={styles.progressText}>{item.progress}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View 
            style={[styles.progressFill, { width: `${item.progress}%` }]} 
          />
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Projets en financement</Text>
      <SubNavTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      
      <FlatList
        data={mockProjects}
        renderItem={renderProject}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
  projectCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  projectCategory: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    color: '#6B7280',
  },
  projectDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  fundingInfo: {
    marginTop: 8,
  },
  fundingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  fundingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  fundingAmount: {
    fontWeight: '600',
    color: '#000',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
});
