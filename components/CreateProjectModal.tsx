// CreateProjectModal.tsx (React Native - Création + Modification de projet)
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, TouchableOpacity, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/utils/supabase';
import { v4 as uuidv4 } from 'uuid';
import { CultureData } from '@/types/cultureData';
import { ProjectData } from '@/type/projectInterface';

const CreateProjectModal = ({ project = null, onClose } : {project: ProjectData } => {
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [terrains, setTerrains] = useState([]);
  const [cultures, setCultures] = useState<CultureData[]>([]);
  const [selectedTerrain, setSelectedTerrain] = useState(null);
  const [selectedCulturesData, setSelectedCulturesData] = useState([]);
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const { data: terrainData } = await supabase.from('terrain').select('*');
      const { data: cultureData } = await supabase.from('culture').select('*');
      if (terrainData) setTerrains(terrainData);
      if (cultureData) setCultures(cultureData);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (project && cultures.length > 0) {
      setTitre(project.titre || '');
      setDescription(project.description || '');
      setSelectedTerrain(project.terrain || null);
      setImageUrl(project.image || '');
      setSelectedCulturesData(
        cultures.filter(c => project.cultures?.includes(c.id))
      );
    }
  }, [project, cultures]);

  const toggleCulture = (id) => {
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
  };

  const summary = {
    nbCultures: selectedCulturesData.length,
    dureeTotale: Math.max(...selectedCulturesData.map(c => c.duree || 0), 0),
    coutTotal: selectedCulturesData.reduce((acc, c) => acc + (c.cout || 0), 0),
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

    let error;
    if (project && project.id) {
      // 🔁 MODIFICATION
      ({ error } = await supabase.from('projet').update(data).eq('id', project.id));
    } else {
      // ✅ CRÉATION
      ({ error } = await supabase.from('projet').insert([data]));
    }

    if (!error) {
      alert(project ? 'Projet modifié avec succès' : 'Projet créé avec succès');
      if (onClose) onClose();
    } else {
      console.error(error);
      alert('Erreur lors de l’enregistrement');
    }
  };

  return (
    <ScrollView className="p-4">
      <Text className="text-lg font-bold mb-2">
        {project ? 'Modifier le Projet' : 'Nouveau Projet'}
      </Text>

      <Text>Titre</Text>
      <TextInput className="border p-2 mb-2" value={titre} onChangeText={setTitre} />

      <Text>Description</Text>
      <TextInput className="border p-2 mb-2 h-24" value={description} onChangeText={setDescription} multiline />

      <Text>Terrain</Text>
      {terrains.map(t => (
        <TouchableOpacity key={t.id} onPress={() => setSelectedTerrain(t.id)}>
          <Text className={`p-2 ${selectedTerrain === t.id ? 'bg-green-300' : 'bg-gray-200'}`}>{t.nom}</Text>
        </TouchableOpacity>
      ))}

      <Text className="mt-4">Cultures</Text>
      {cultures.map(c => (
        <TouchableOpacity key={c.id} onPress={() => toggleCulture(c.id)}>
          <Text className={`p-2 ${selectedCulturesData.find(sel => sel.id === c.id) ? 'bg-green-300' : 'bg-gray-200'}`}>{c.nom}</Text>
        </TouchableOpacity>
      ))}

      <Text className="mt-4">📷 Image</Text>
      <Button title="Choisir une image" onPress={handlePickImage} />
      {imageUrl ? <Image source={{ uri: imageUrl }} className="w-full h-48 mt-2" /> : null}

      <View className="mt-6 p-4 bg-gray-100 rounded">
        <Text className="font-bold text-green-700 mb-2">Résumé du projet</Text>
        <Text>🌱 Cultures sélectionnées : {summary.nbCultures}</Text>
        <Text>⏳ Durée estimée : {summary.dureeTotale} jours</Text>
        <Text>💰 Coût total : {summary.coutTotal.toLocaleString()} Ar</Text>

        {selectedCulturesData.length > 0 && (
          <View className="mt-2">
            <Text className="font-bold">Détail :</Text>
            {selectedCulturesData.map(c => (
              <Text key={c.id}>- {c.nom}: {c.duree} j / {c.cout.toLocaleString()} Ar</Text>
            ))}
          </View>
        )}
      </View>

      <Button title={project ? "Enregistrer les modifications" : "Créer"} onPress={handleSubmit} className="mt-4" />
      {onClose && <Button title="Annuler" onPress={onClose} />}
    </ScrollView>
  );
};

export default CreateProjectModal;
