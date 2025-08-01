import React from 'react';
import { View, Text, Modal, StyleSheet } from 'react-native';
import { Button } from '../ui/terrain/Button';
import { supabase } from '../../integrations/supabase/client';
import { TerrainData } from '../../types/Terrain';
import { useToast } from '../ui/terrain/use-toast';

interface TerrainDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  terrain: TerrainData | undefined;
  onTerrainUpdate: (terrain: TerrainData, action: 'delete') => void;
}

const TerrainDeleteDialog: React.FC<TerrainDeleteDialogProps> = ({
  isOpen,
  onClose,
  terrain,
  onTerrainUpdate,
}) => {
  const { toast } = useToast();

  const handleConfirmDelete = async () => {
    if (!terrain || terrain.id_terrain == null) {
      toast({
        title: 'Erreur',
        description: 'Aucun terrain sélectionné ou ID manquant',
        variant: 'error',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('terrain')
        .delete()
        .eq('id_terrain', terrain.id_terrain as number);

      if (error) throw error;

      onTerrainUpdate(terrain, 'delete');
      toast({
        title: 'Succès',
        description: `Terrain ${terrain.nom_terrain || `ID ${terrain.id_terrain}`} supprimé`,
        variant: 'success',
      });
    } catch (error: any) {
      console.error('Erreur lors de la suppression du terrain:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de supprimer le terrain',
        variant: 'error',
      });
    } finally {
      onClose();
    }
  };

  return (
    <Modal visible={isOpen} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>Confirmer la suppression</Text>
          <Text style={styles.message}>
            Voulez-vous vraiment supprimer le terrain "
            {terrain?.nom_terrain || `ID ${terrain?.id_terrain || 'inconnu'}`}" ?
          </Text>
          <View style={styles.buttons}>
            <Button
              variant="outline"
              title="Annuler"
              onPress={onClose}
              style={styles.cancelButton}
            />
            <Button
              variant="destructive"
              title="Supprimer"
              onPress={handleConfirmDelete}
              style={styles.confirmButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialog: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    width: '80%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    marginBottom: 20,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cancelButton: {
    padding: 10,
  },
  confirmButton: {
    padding: 10,
  },
});

export default TerrainDeleteDialog;