// CreateProjectModal.tsx - version adaptée au look ModalDetails
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/utils/supabase';
import { v4 as uuidv4 } from 'uuid';
import { CultureData } from '@/types/cultureData';
import { ProjectData } from '@/type/projectInterface';
import { TerrainData } from '@/types/terrainData';

function daysBetween(dateA: string, dateB: string): number {
  const dA = new Date(dateA);
  const dB = new Date(dateB);
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((dB.getTime() - dA.getTime()) / msPerDay);
}

type CreateProjectModalProps = {
  project?: ProjectData | null;
  onClose: () => void;
};

const CreateProjectModal = ({ project = null, onClose }: CreateProjectModalProps) => {
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [terrains, setTerrains] = useState<TerrainData[] | null>([]);
  const [cultures, setCultures] = useState<CultureData[]>([]);
  const [selectedTerrain, setSelectedTerrain] = useState<TerrainData | null>(null);
  const [selectedCulturesData, setSelectedCulturesData] = useState<CultureData[]>([]);
  const [image, setImage] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: terrainData } = await supabase.from('terrain').select('*');
      const { data: cultureData } = await supabase.from('culture').select('*');
      if (terrainData) setTerrains(terrainData);
      if (cultureData) setCultures(cultureData);
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!project || !terrains?.length) return;
    setLoading(true);
    setTitre(project.titre ?? '');
    setDescription(project.description ?? '');
    setImageUrl(project.photos ?? '');
    const found = terrains.find(t => t.id === project.id_terrain) ?? null;
    setSelectedTerrain(found);
    setSelectedCulturesData(
      cultures.filter(c =>
        project.projet_culture?.some(pc => pc.id_culture === c.id)
      )
    );
    setLoading(false);
  }, [project, terrains, cultures]);

  const toggleCulture = (id: number) => {
    const culture = cultures.find(c => c.id === id);
    if (!culture) return;
    setSelectedCulturesData(prev => {
      if (prev.find(c => c.id === id)) {
        return prev.filter(c => c.id !== id);
      } else {
        return [...prev, culture];
      }
    });
  };

  const handlePickImage = async () => {
    setLoading(true);
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImage(uri);
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileName = `projects/${uuidv4()}`;
      const { data, error } = await supabase.storage.from('project-images').upload(fileName, blob);
      if (!error) {
        const { data: publicUrl } = supabase.storage.from('project-images').getPublicUrl(fileName);
        setImageUrl(publicUrl.publicUrl);
      }
    }
    setLoading(false);
  };

  const summary = {
    nbCultures: selectedCulturesData.length,
    dureeTotale: Math.max(...selectedCulturesData.map(c => daysBetween(c.edit_at, c.create_at) || 0), 0),
    coutTotal: selectedCulturesData.reduce((acc, c) => acc + (c.cout_ha || 0), 0),
  };

  const handleSubmit = async () => {
    const data = {
      titre,
      description,
      terrain: selectedTerrain,
      statut: project ? project.statut : 'en attente',
      cultures: selectedCulturesData.map(c => c.id),
      image: imageUrl,
      duree_totale: summary.dureeTotale,
      cout_total: summary.coutTotal,
    };
    setLoading(true);
    let error;
    if (project && project.id_projet) {
      ({ error } = await supabase.from('projet').update(data).eq('id', project.id_projet));
    } else {
      ({ error } = await supabase.from('projet').insert([data]));
    }
    if (!error) {
      alert(project ? 'Projet modifié avec succès' : 'Projet créé avec succès');
      if (onClose) onClose();
    } else {
      console.error(error);
      alert('Erreur lors de l\'enregistrement');
    }
    setLoading(false);
  };

  return (
    <ScrollView className="p-4">
      <Text className="text-2xl font-bold text-gray-800 mb-4">
        {project ? 'Modifier le Projet' : 'Nouveau Projet'}
      </Text>

      {/* Titre */}
      <View className="mb-4">
        <Text className="text-lg font-semibold text-gray-700 mb-2">Titre</Text>
        <TextInput 
          className="border border-gray-300 p-3 rounded-lg bg-gray-50" 
          value={titre} 
          onChangeText={setTitre} 
        />
      </View>

      {/* Description */}
      <View className="mb-4">
        <Text className="text-lg font-semibold text-gray-700 mb-2">Description</Text>
        <TextInput 
          className="border border-gray-300 p-3 rounded-lg bg-gray-50 h-24" 
          value={description} 
          onChangeText={setDescription} 
          multiline 
        />
      </View>

      {/* Terrain */}
      <View className="mb-4">
        <Text className="text-lg font-semibold text-gray-700 mb-2">Terrain</Text>
        {terrains?.map(t => (
          <TouchableOpacity 
            key={t.id} 
            onPress={() => setSelectedTerrain(t)}
            className="mb-2"
          >
            <Text className={`p-3 rounded-lg ${selectedTerrain?.id === t.id ? 'bg-green-200 border border-green-500' : 'bg-gray-100 border border-gray-300'}`}>
              {t.nom_terrain}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Cultures */}
      <View className="mb-4">
        <Text className="text-lg font-semibold text-gray-700 mb-2">Cultures</Text>
        {cultures.map(c => (
          <TouchableOpacity 
            key={c.id} 
            onPress={() => toggleCulture(c.id)}
            className="mb-2"
          >
            <Text className={`p-3 rounded-lg ${selectedCulturesData.find(sel => sel.id === c.id) ? 'bg-green-200 border border-green-500' : 'bg-gray-100 border border-gray-300'}`}>
              {c.nom}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Image */}
      <View className="mb-4">
        <Text className="text-lg font-semibold text-gray-700 mb-2">Image</Text>
        <TouchableOpacity 
          onPress={handlePickImage}
          className="bg-blue-500 p-3 rounded-lg"
        >
          <Text className="text-white text-center font-semibold">Choisir une image</Text>
        </TouchableOpacity>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} className="w-full h-48 mt-2 rounded-lg" />
        ) : null}
      </View>

      {/* Résumé */}
      <View className="bg-gray-100 p-4 rounded-lg mb-4">
        <Text className="font-bold text-green-700 mb-2">Résumé du projet</Text>
        <Text className="text-base">🌱 Cultures sélectionnées : {summary.nbCultures}</Text>
        <Text className="text-base">⏳ Durée estimée : {summary.dureeTotale} jours</Text>
        <Text className="text-base">💰 Coût total : {summary.coutTotal.toLocaleString()} Ar</Text>

        {selectedCulturesData.length > 0 && (
          <View className="mt-2">
            <Text className="font-bold">Détail :</Text>
            {selectedCulturesData.map(c => (
              <Text key={c.id} className="text-sm">- {c.nom}: {daysBetween(c.edit_at, c.create_at)} j / {c.cout_ha?.toLocaleString()} Ar</Text>
            ))}
          </View>
        )}
      </View>

      {/* Boutons */}
      <View className="flex-row justify-around">
        <TouchableOpacity 
          onPress={handleSubmit}
          className="bg-green-600 p-3 rounded-lg flex-1 mr-2"
        >
          <Text className="text-white text-center font-bold">
            {project ? "Enregistrer" : "Créer"}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={onClose}
          className="bg-gray-500 p-3 rounded-lg flex-1 ml-2"
        >
          <Text className="text-white text-center font-bold">Annuler</Text>
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator size={30} color="#009800" className="mt-5" />}
    </ScrollView>
  );
};

export default CreateProjectModal;