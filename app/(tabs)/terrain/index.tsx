import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import SubNavTabs from 'components/SubNavTabs';
import { useAuth } from 'contexts/AuthContext';
import { router } from 'expo-router';
import { supabase } from 'integrations/supabase/client';
import { TerrainData } from '../../../types/Terrain';
import { useToast } from '../../../components/ui/terrain/use-toast';
import TerrainTable from '../../../components/terrain/TerrainTable';
import TerrainCard from '~/components/terrain/TerrainCard';
// import TerrainEditDialog from '../../../components/TerrainEditDialog';

// import TerrainCard from 'components/terrain/TerrainCard';

const Header = ({ onCreateTerrain }: { onCreateTerrain: () => void }) => {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Gestion des terrains</Text>
      <TouchableOpacity style={styles.button} onPress={onCreateTerrain}>
        <AntDesign name="plus" size={20} color="white" style={styles.icon} />
        <Text style={styles.text}>Nouveau terrain</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function TerrainScreen() {
  const { user, profile } = useAuth();

  const userRole = profile?.nom_role?.toLowerCase() || 'superviseur';

  useEffect(() => {
    if (!user) {
      router.replace('/(auth)/login');
    }
  }, [user]);

  const { toast } = useToast();

  const [loadingTerrains, setLoadingTerrains] = useState(true);
  const [pendingTerrains, setPendingTerrains] = useState<TerrainData[]>([]);
  const [validatedTerrains, setValidatedTerrains] = useState<TerrainData[]>([]);
  const [selectedTerrain, setSelectedTerrain] = useState<TerrainData | null>(null);
  const [isTerrainDialogOpen, setIsTerrainDialogOpen] = useState(false);
  const [isTerrainCardOpen, setIsTerrainCardOpen] = useState(false);
  const [isTerrainValidateOpen, setIsTerrainValidateOpen] = useState(false);
  const [isTerrainDeleteOpen, setIsTerrainDeleteOpen] = useState(false);
  const [agriculteurs, setAgriculteurs] = useState<
    {
      id_utilisateur: string;
      nom: string;
      prenoms?: string;
    }[]
  >([]);
  const [techniciens, setTechniciens] = useState<
    {
      id_utilisateur: string;
      nom: string;
      prenoms?: string;
    }[]
  >([]);

  const fetchAgriculteurs = useCallback(async () => {
    if (userRole !== 'technicien' && userRole !== 'superviseur') return;
    try {
      const { data, error } = await supabase
        .from('utilisateurs_par_role')
        .select('id_utilisateur, nom, prenoms')
        .eq('id_role', 1);
      if (error) throw error;
      setAgriculteurs(
        (data || []).map(
          (item: {
            id_utilisateur: string | null;
            nom: string | null;
            prenoms: string | null;
          }) => ({
            id_utilisateur: item.id_utilisateur ?? '',
            nom: item.nom ?? '',
            ...(item.prenoms !== null && { prenoms: item.prenoms }),
          })
        )
      );
    } catch (error) {
      console.error('Error fetching agriculteurs:', error);
    }
  }, [userRole]);
  const fetchTerrains = useCallback(async () => {
    if (!user) return;
    setLoadingTerrains(true);
    try {
      /**
       * 1. Prépare le filtre sur le rôle
       *    (on ne modifie QUE la partie `filter`, pas la requête principale)
       */
      const roleFilter: Record<string, unknown> = {};
      if (userRole === 'simple') roleFilter.id_tantsaha = user.id;
      else if (userRole === 'technicien') roleFilter.id_technicien = user.id;
      /**
       * 2. Requête unique comprenant :
       *    - les tables dépendantes (`region`, `district`, `commune`)
       *    - les trois utilisateurs liés (tech, superviseur, tantsaha)
       */

      const { data, error } = await supabase
        .from('v_terrain_complet')
        .select('*')
        .match(roleFilter); // même logique de filtre

      if (error) throw error;
      const terrains = (data ?? []).map((t) => ({
        id_terrain: t.id_terrain,
        nom_terrain: t.nom_terrain || `Terrain #${t.id_terrain}`,
        surface_proposee: t.surface_proposee,
        surface_validee: t.surface_validee,
        acces_eau: t.acces_eau,
        acces_route: t.acces_route,
        statut: t.statut,
        geom: t.geom,
        photos: t.photos ?? '',
        photos_validation: t.photos_validation ?? '',
        rapport_validation: t.rapport_validation ?? '',
        date_validation: t.date_validation,
        /* libellés déjà disponibles */
        id_region: t.id_region ?? null,
        id_district: t.id_district ?? null,
        id_commune: t.id_commune ?? null,
        region_name: t.nom_region ?? 'Non spécifié',
        district_name: t.nom_district ?? 'Non spécifié',
        commune_name: t.nom_commune ?? 'Non spécifié',
        id_technicien: t.id_technicien ?? null,
        id_superviseur: t.id_superviseur ?? null,
        id_tantsaha: t.id_tantsaha ?? null,
        techniqueNom: t.technicien_nom
          ? `${t.technicien_nom} ${t.technicien_prenoms ?? ''}`.trim()
          : 'Non assigné',
        superviseurNom: t.superviseur_nom
          ? `${t.superviseur_nom} ${t.superviseur_prenoms ?? ''}`.trim()
          : 'Non assigné',
        tantsahaNom: t.tantsaha_nom
          ? `${t.tantsaha_nom} ${t.tantsaha_prenoms ?? ''}`.trim()
          : 'Non spécifié',
      }));
      setPendingTerrains(terrains.filter((t) => t.statut === false) as TerrainData[]);
      setValidatedTerrains(terrains.filter((t) => t.statut === true) as TerrainData[]);
    } catch (err) {
      console.error('Error fetching terrains:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible de récupérer les terrains',
        variant: 'error',
      });
    } finally {
      setLoadingTerrains(false);
    }
  }, [user, userRole, toast]);
  const fetchTechniciens = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('utilisateurs_par_role')
        .select('id_utilisateur, nom, prenoms')
        .eq('id_role', 4);
      if (error) throw error;
      setTechniciens(
        (data || []).map(
          (item: {
            id_utilisateur: string | null;
            nom: string | null;
            prenoms: string | null;
          }) => ({
            id_utilisateur: item.id_utilisateur ?? '',
            nom: item.nom ?? '',
            ...(item.prenoms !== null && { prenoms: item.prenoms }),
          })
        )
      );
    } catch (error) {
      console.error('Error fetching techniciens:', error);
    }
  }, []);

  const [activeTab, setActiveTab] = useState('À assigner');
  const tabs = ['À assigner', 'À valider', 'Validés'];

  useEffect(() => {
    if (user) {
      fetchTerrains();
      fetchTechniciens();
      fetchAgriculteurs();
    }
  }, [user, fetchTerrains, fetchTechniciens, fetchAgriculteurs]);

  const handleTerrainUpdate = (
    updatedTerrain?: TerrainData,
    action?: 'add' | 'update' | 'delete'
  ) => {
    if (!updatedTerrain) return;
    if (action === 'delete') {
      setPendingTerrains((prev) => prev.filter((t) => t.id_terrain !== updatedTerrain.id_terrain));
      setValidatedTerrains((prev) =>
        prev.filter((t) => t.id_terrain !== updatedTerrain.id_terrain)
      );
    } else if (action === 'add') {
      if (updatedTerrain.statut) {
        setValidatedTerrains((prev) => [updatedTerrain, ...prev]);
      } else {
        setPendingTerrains((prev) => [updatedTerrain, ...prev]);
      }
    } else if (action === 'update') {
      if (updatedTerrain.statut) {
        setPendingTerrains((prev) =>
          prev.filter((t) => t.id_terrain !== updatedTerrain.id_terrain)
        );
        setValidatedTerrains((prev) => {
          const exists = prev.some((t) => t.id_terrain === updatedTerrain.id_terrain);
          if (exists) {
            return prev.map((t) =>
              t.id_terrain === updatedTerrain.id_terrain ? updatedTerrain : t
            );
          } else {
            return [updatedTerrain, ...prev];
          }
        });
      } else {
        setValidatedTerrains((prev) =>
          prev.filter((t) => t.id_terrain !== updatedTerrain.id_terrain)
        );
        setPendingTerrains((prev) => {
          const exists = prev.some((t) => t.id_terrain === updatedTerrain.id_terrain);
          if (exists) {
            return prev.map((t) =>
              t.id_terrain === updatedTerrain.id_terrain ? updatedTerrain : t
            );
          } else {
            return [updatedTerrain, ...prev];
          }
        });
      }
    }
  };
  const handleCreateTerrain = () => {
    setSelectedTerrain(null);
    setIsTerrainDialogOpen(true);
  };
  const handleEditTerrain = (terrain: TerrainData) => {
    setSelectedTerrain(terrain);
    setIsTerrainDialogOpen(true);
  };
  const handleViewTerrainDetails = (terrain: TerrainData) => {
    setSelectedTerrain(terrain);
    setIsTerrainCardOpen(true);
  };
  const handleValidateTerrain = (terrain: TerrainData) => {
    setSelectedTerrain(terrain);
    setIsTerrainValidateOpen(true);
  };
  const handleDeleteTerrain = (terrain: TerrainData) => {
    setSelectedTerrain(terrain);
    setIsTerrainDeleteOpen(true);
  };
  const handleTerrainSaved = (updatedTerrain: TerrainData) => {
    console.log('Terrain saved:', updatedTerrain);
    const isNewTerrain =
      !pendingTerrains.some((t) => t.id_terrain === updatedTerrain.id_terrain) &&
      !validatedTerrains.some((t) => t.id_terrain === updatedTerrain.id_terrain);
    if (isNewTerrain) {
      handleTerrainUpdate(updatedTerrain, 'add');
    } else {
      handleTerrainUpdate(updatedTerrain, 'update');
    }
    setIsTerrainDialogOpen(false);
    setIsTerrainValidateOpen(false);
  };
  return (
    <View style={styles.container}>
      <Header onCreateTerrain={handleCreateTerrain} />
      {userRole === 'superviseur' ? (
        <View>
          <SubNavTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
          {activeTab === 'À assigner' && (
            <ScrollView horizontal={true} style={styles.viewContainer}>
              <TerrainTable
                terrains={pendingTerrains.filter((t) => !t.id_technicien)}
                type="pending"
                userRole={userRole}
                onTerrainUpdate={handleTerrainUpdate}
                techniciens={techniciens}
                onEdit={handleEditTerrain}
                onViewDetails={handleViewTerrainDetails}
                onValidate={handleValidateTerrain}
                onDelete={handleDeleteTerrain}
              />
            </ScrollView>
          )}
          {activeTab === 'À valider' && (
            <ScrollView horizontal={true} style={styles.viewContainer}>
              <TerrainTable
                terrains={pendingTerrains.filter((t) => t.id_technicien)}
                type="pending"
                userRole={userRole}
                onTerrainUpdate={handleTerrainUpdate}
                onEdit={handleEditTerrain}
                onViewDetails={handleViewTerrainDetails}
                onValidate={handleValidateTerrain}
                onDelete={handleDeleteTerrain}
              />
            </ScrollView>
          )}
          {activeTab === 'Validés' && (
            <ScrollView horizontal={true} style={styles.viewContainer}>
              <TerrainTable
                terrains={validatedTerrains}
                type="validated"
                userRole={userRole}
                onTerrainUpdate={handleTerrainUpdate}
                onEdit={handleEditTerrain}
                onViewDetails={handleViewTerrainDetails}
                onDelete={handleDeleteTerrain}
              />
            </ScrollView>
          )}
        </View>
      ) : userRole === 'technicien' ? (
        <View>
          {/* <Text style={styles.littleDescription}>Terrains en attente de validation</Text>
          <ScrollView horizontal={true} style={styles.viewContainer}>
            <TerrainTable
              terrains={pendingTerrains.filter((t) => t.id_technicien === user.id)}
              type="pending"
              userRole={userRole}
              onTerrainUpdate={handleTerrainUpdate}
              onEdit={handleEditTerrain}
              onViewDetails={handleViewTerrainDetails}
              onValidate={handleValidateTerrain}
              onDelete={handleDeleteTerrain}
            />
          </ScrollView> */}
        </View>
      ) : (
        <View>
          <Text>ICI un technicien</Text>
        </View>
      )}
      {/* {isTerrainDialogOpen && (
        <TerrainEditDialog
          isOpen={isTerrainDialogOpen}
          onClose={() => setIsTerrainDialogOpen(false)}
          terrain={selectedTerrain || undefined}
          onSubmitSuccess={handleTerrainSaved}
          userId={user.id}
          userRole={userRole}
          agriculteurs={agriculteurs}
        />
      )} */}
    {isTerrainCardOpen && selectedTerrain && <TerrainCard isOpen={isTerrainCardOpen} onClose={() => setIsTerrainCardOpen(false)} terrain={selectedTerrain} onTerrainUpdate={handleTerrainUpdate} />}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 23,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#4d7c0f',
    width: '50%',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16a34a',
    padding: 14,
    borderRadius: 8,
    gap: 14,
  },
  text: {
    fontSize: 15,
    fontWeight: '500',
    color: 'white',
  },
  icon: {
    fontSize: 15,
    fontWeight: 600,
  },
  viewContainer: {
    borderColor: '#e5e7eb',
    borderWidth: 1,
    borderRadius: 5,
    maxHeight: 550,
    height: '95%',
  },
  littleDescription: {
    fontSize: 15,
    fontWeight: 500,
    marginVertical: 15,
  },
});
