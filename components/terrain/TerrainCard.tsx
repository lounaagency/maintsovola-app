import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  FlatList
} from 'react-native';
import { Polygon, UrlTile } from 'react-native-maps';
import MapView from 'react-native-maps';
import { Button } from 'components/terrain/button';
import { TerrainData } from '../../types/Terrain';
import { useAuth } from 'contexts/AuthContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { Pencil, Trash2, Mail, User, MapPin, Calendar, Check, X, RefreshCw } from 'lucide-react-native';
import UserAvatar from 'components/terrain/UserAvatar';
import { supabase } from 'integrations/supabase/client';
import Toast from 'react-native-toast-message';
import { white } from 'react-native-paper/lib/typescript/styles/themes/v2/colors';

interface TerrainCardProps {
  isOpen: boolean;
  onClose: () => void;
  terrain: TerrainData;
  onTerrainUpdate?: (terrain: TerrainData, action?: 'update' | 'delete') => void;
  userRole?: string;
  isDeleteMode?: boolean;
}

const TerrainCard: React.FC<TerrainCardProps> = ({
  isOpen,
  onClose,
  terrain: initialTerrain,
  onTerrainUpdate,
  userRole = 'simple',
  isDeleteMode = false,
}) => {
  const { user } = useAuth();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [terrain, setTerrain] = useState<TerrainData>(initialTerrain);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);


  const canModify =
    userRole === 'admin' ||
    (userRole === 'technicien' && terrain.id_technicien === user?.id) ||
    userRole === 'superviseur' ||
    (userRole === 'simple' && terrain.id_tantsaha === user?.id);
  const canDelete =
    userRole === 'admin' ||
    userRole === 'superviseur' ||
    (userRole === 'simple' && terrain.id_tantsaha === user?.id && !terrain.statut);

  const getPolygonCoordinates = () => {
    if (!terrain.geom) return [];
    try {
      const geomData = typeof terrain.geom === 'string' ? JSON.parse(terrain.geom) : terrain.geom;
      if (geomData && geomData.coordinates && geomData.coordinates[0]) {
        return geomData.coordinates[0].map((coord: number[]) => ({
          latitude: coord[1],
          longitude: coord[0],
        }));
      }
    } catch (error) {
      console.error('Error parsing polygon geometry:', error);
    }
    return [];
  };

  const polygonCoordinates = getPolygonCoordinates();

  const getPhotos = () => {
    if (!terrain.photos) return [];
    if (typeof terrain.photos === 'string') {
      return terrain.photos
        .split(',')
        .map(p => p.trim())
        .filter(p => p !== '' && p !== null && p !== undefined);
    }
    if (Array.isArray(terrain.photos)) {
      return terrain.photos.filter(p => p && p.trim && p.trim() !== '');
    }
    return [];
  };

  const getValidationPhotos = () => {
    if (!terrain.photos_validation) return [];
    if (typeof terrain.photos_validation === 'string') {
      return terrain.photos_validation
        .split(',')
        .map(p => p.trim())
        .filter(p => p !== '' && p !== null && p !== undefined);
    }
    if (Array.isArray(terrain.photos_validation)) {
      return terrain.photos_validation.filter(p => p && p.trim && p.trim() !== '');
    }
    return [];
  };

  const photos = getPhotos();
  const validationPhotos = getValidationPhotos();

  const handleDelete = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('terrain')
        .update({ archive: true })
        .eq('id_terrain', terrain.id_terrain ?? 0);
      if (error) throw error;
      Toast.show({
        type: 'success',
        text1: 'Succès',
        text2: 'Terrain supprimé avec succès',
      });
      if (onTerrainUpdate) onTerrainUpdate({ ...terrain, archive: true }, 'delete');
      setIsDeleteConfirmOpen(false);
      onClose();
    } catch (error: any) {
      console.error('Error deleting terrain:', error);
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: `Erreur: ${error.message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('terrain')
        .select('*')
        .eq('id_terrain', terrain.id_terrain ?? 0)
        .single();
      if (error) throw error;
      setTerrain(data as TerrainData);
      Toast.show({
        type: 'success',
        text1: 'Succès',
        text2: 'Données du terrain rafraîchies',
      });
    } catch (error: any) {
      console.error('Erreur lors du rafraîchissement du terrain:', error);
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: `Erreur: ${error.message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) onClose();
  };

  if (isDeleteMode) {
    return (
      <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le terrain</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le terrain {terrain.nom_terrain} ? Cette action ne peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading} onPress={onClose} style={styles.cancelButton}>
              <Text>Annuler</Text>
            </AlertDialogCancel>
            <AlertDialogAction disabled={isLoading} onPress={handleDelete} style={styles.destructiveButton}>
              <Text style={{color:'white'}}>{isLoading ? 'Suppression...' : 'Supprimer'}</Text>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }
  const currentImages = activeTab === 'details' ? photos : validationPhotos;

  return (
    <Modal visible={isOpen} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>{terrain.nom_terrain}</Text>
          <Button
            variant="ghost"
            size="icon"
            onPress={onClose}
            icon={<X size={24} color="#000" />}
          />
        </View>

        <Text style={styles.description}>Détails du terrain #{terrain.id_terrain}</Text>

        <View style={styles.tabsContainer}>
          <Button
            variant={activeTab === 'details' ? 'secondary' : 'ghost'}
            size="sm"
            onPress={() => setActiveTab('details')}
            title="Détails du terrain"
          />
          <Button
            variant={activeTab === 'validation' ? 'secondary' : 'ghost'}
            size="sm"
            onPress={() => setActiveTab('validation')}
            title="Rapport de validation"
            disabled={!terrain.statut}
          />
        </View>

        <ScrollView style={styles.contentContainer}>
          {activeTab === 'details' ? (
            <View style={styles.detailsContainer}>
              <View style={styles.card}>
                <View style={styles.cardContent}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Proposé par</Text>
                    <View style={styles.detailValue}>
                      <UserAvatar name={terrain.tantsahaNom || 'Utilisateur'} size="sm" photoUrl={undefined} />
                      <Text style={styles.detailText}>{terrain.tantsahaNom || 'Non spécifié'}</Text>
                    </View>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Surface proposée</Text>
                    <Text style={styles.detailText}>{terrain.surface_proposee} hectares</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Localisation</Text>
                    <Text style={[styles.detailText, styles.textRight]}>
                      {terrain.commune_name}, {terrain.district_name}, {terrain.region_name}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Accès à l'eau</Text>
                    {terrain.acces_eau ? <Check size={20} color="#10B981" /> : <X size={20} color="#EF4444" />}
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Accès à la route</Text>
                    {terrain.acces_route ? <Check size={20} color="#10B981" /> : <X size={20} color="#EF4444" />}
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Statut</Text>
                    <Text style={[styles.detailText, terrain.statut ? styles.textSuccess : styles.textWarning]}>
                      {terrain.statut ? 'Validé' : 'En attente de validation'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Technicien assigné</Text>
                    <View style={styles.detailValue}>
                      <UserAvatar name={terrain.techniqueNom || 'Non assigné'} size="sm" photoUrl={undefined} />
                      <Text style={styles.detailText}>{terrain.techniqueNom || 'Non assigné'}</Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.mapPhotoContainer}>
                <View style={styles.mapContainer}>
                  {polygonCoordinates.length > 0 ? (
                    <MapView
                      style={styles.map}
                      initialRegion={{
                        latitude: polygonCoordinates[0].latitude,
                        longitude: polygonCoordinates[0].longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                      }}>
                      <UrlTile
                        urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        maximumZ={19}
                        tileSize={256}
                      />
                      <Polygon
                        coordinates={polygonCoordinates}
                        strokeColor="red"
                        fillColor="rgba(255,0,0,0.3)"
                        strokeWidth={2}
                      />
                    </MapView>
                  ) : (
                    <View style={styles.noMapData}>
                      <Text style={styles.noMapDataText}>Aucune donnée de carte disponible</Text>
                    </View>
                  )}
                </View>

                <View style={styles.card}>
                  <View style={styles.cardContent}>
                    <Text style={styles.photoTitle}>Photos ({photos.length})</Text>
                    <View style={styles.photoGrid}>
                      {photos.map((photo, index) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() => setSelectedPhotoIndex(index)}
                          style={styles.photoItem}
                        >
                          <Image
                            source={{ uri: photo }}
                            style={styles.photoImage}
                            resizeMode="cover"
                          />
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.validationContainer}>
              {terrain.statut ? (
                <View style={styles.validationContent}>
                  <View style={styles.card}>
                    <View style={styles.cardContent}>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Validé par</Text>
                        <View style={styles.detailValue}>
                          <UserAvatar name={terrain.superviseurNom || 'Non spécifié'} size="sm" photoUrl={undefined} />
                          <Text style={styles.detailText}>{terrain.superviseurNom || 'Non spécifié'}</Text>
                        </View>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Date de validation</Text>
                        <Text style={styles.detailText}>
                          {terrain.date_validation ? new Date(terrain.date_validation).toLocaleDateString() : 'N/A'}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Surface validée</Text>
                        <Text style={styles.detailText}>{terrain.surface_validee || terrain.surface_proposee} hectares</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.card}>
                    <View style={styles.cardContent}>
                      <Text style={styles.reportTitle}>Rapport de validation</Text>
                      <Text style={styles.reportText}>{terrain.rapport_validation || 'Aucun rapport fourni'}</Text>
                    </View>
                  </View>

                  <View style={styles.card}>
                    <View style={styles.cardContent}>
                      <Text style={styles.photoTitle}>Photos de validation ({validationPhotos.length})</Text>
                      <View style={styles.photoGrid}>
                        {validationPhotos.map((photo, index) => (
                          <TouchableOpacity
                            key={index}
                            onPress={() => setSelectedPhoto(photo)}
                            style={styles.photoItem}
                          >
                            <Image
                              source={{ uri: photo }}
                              style={styles.photoImage}
                              resizeMode="cover"
                            />
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </View>
                </View>
              ) : (
                <View style={styles.notValidated}>
                  <Text style={styles.notValidatedText}>Ce terrain n'a pas encore été validé</Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {selectedPhotoIndex !== null && (
          <View style={styles.overlay}>
            <View style={styles.imageViewer}>
              <FlatList
                horizontal
                pagingEnabled
                data={currentImages}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <View style={styles.scrollViewContent}>
                    <Image
                      source={{ uri: item }}
                      style={styles.fullImage}
                      resizeMode="contain"
                    />
                  </View>
                )}
                initialScrollIndex={selectedPhotoIndex}
                getItemLayout={(data, index) => ({
                  length: Dimensions.get('window').width * 0.9,
                  offset: Dimensions.get('window').width * 0.9 * index,
                  index,
                })}
                showsHorizontalScrollIndicator={false}
              />
              <TouchableOpacity
                onPress={() => setSelectedPhotoIndex(null)}
                style={styles.closeButton}
              >
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>
          </View>
        )}


        <View style={styles.footer}>
          {canDelete && (
            <Button
              variant="destructive"
              onPress={() => setIsDeleteConfirmOpen(true)}
              icon={<Trash2 size={16} color="white" />}
            />
          )}
          <Button variant="outline" onPress={onClose} style={{ flex: 1 }} title="Fermer" />
        </View>
      </View>

      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le terrain</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le terrain '{terrain.nom_terrain}' ? Cette action ne peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading} onPress={() => setIsDeleteConfirmOpen(false)}>
              <Text>Annuler</Text>
            </AlertDialogCancel>
            <AlertDialogAction disabled={isLoading} onPress={handleDelete} style={styles.destructiveButton} >
              
              <Text>{isLoading ? 'Suppression...' : 'Supprimer'}</Text>
            </AlertDialogAction>
            
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10B981',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  contentContainer: {
    flex: 1,
  },
  detailsContainer: {
    gap: 16,
  },
  validationContainer: {
    gap: 16,
  },
  validationContent: {
    gap: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardContent: {
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1, // Permet au texte de s’adapter dans son container
    // flexWrap: 'wrap',
  },
  detailText: {
    fontSize: 14,
    color: '#111827',
    marginLeft: 8,
    // flex: 1, // Permet au texte de s’adapter dans son
    //  flexShrink: 1, // Permet au texte de s’adapter dans son container
  // flexWrap: 'wrap',
  },
  textRight: {
    textAlign: 'right',
  },
  textSuccess: {
    color: '#10B981',
  },
  textWarning: {
    color: '#F59E0B',
  },
  mapPhotoContainer: {
    gap: 16,
  },
  mapContainer: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  noMapData: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  noMapDataText: {
    color: '#6B7280',
  },
  photoTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 12,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photoItem: {
    width: 80,
    height: 80,
    borderRadius: 4,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
  },
  reportText: {
    fontSize: 14,
    color: '#6B7280',
  },
  notValidated: {
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notValidatedText: {
    fontSize: 14,
    color: '#6B7280',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    gap: 8,
  },
  destructiveButton: {
    backgroundColor: '#EF4444',
    padding: 10,
    borderWidth: 1,
    borderRadius: 10,
  },
  cancelButton: {
    backgroundColor: '#faf8f8ff',
    padding: 10,
    borderWidth: 1,
    borderRadius: 10
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  imageViewer: {
    width: '90%',
    height: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
  },
  scrollViewContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: Dimensions.get('window').width * 0.9,
    height: Dimensions.get('window').height * 0.8,
    resizeMode: 'contain',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TerrainCard;