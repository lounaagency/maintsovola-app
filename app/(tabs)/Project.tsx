// Project.tsx
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SearchIcon, Plus, SquareArrowOutUpRight } from 'lucide-react-native';
import type { ProjectData } from '~/type/projectInterface';
import { useProjects } from '~/hooks/useProject';

/* ---------- Carte projet ---------- */
type ListTerrainProps = { item: ProjectData; selected: string };
const ListTerrain = ({ item, selected }: ListTerrainProps) => {
  const visible = useMemo(() => {
    switch (selected) {
      case 'en_attente': return item.statut === 'en attente';
      case 'finance':    return item.statut === 'en financement';
      case 'en_prod':    return item.statut === 'en cours';
      case 'termine':    return item.statut === 'terminé';
      default:           return true;
    }
  }, [item.statut, selected]);

  if (!visible) return null;

  return (
    <TouchableOpacity
      className="border border-gray-300 rounded-lg min-h-24 p-3 my-2"
      activeOpacity={0.5}
    >
      <View className="flex-row justify-between">
        <View>
          <Text className="text-xl font-bold">{item.titre}</Text>
          <Text className="text-gray-500">
            {item.tantsaha?.nom} {item.tantsaha?.prenoms}
          </Text>
        </View>

        <View className="justify-end">
          <Text className="border border-gray-200 px-2 rounded-full text-sm">
            {item.statut}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

/* ---------- Barre de filtres ---------- */
type StatusSelectProps = {
  selected: string;
  setSelected: (s: string) => void;
};
const StatusSelect = ({ selected, setSelected }: StatusSelectProps) => {
  const styles = StyleSheet.create({
    scroll: { paddingHorizontal: 10 },
    text: { fontSize: 14, color: '#000' },
    selected: { color: '#009900', fontWeight: 'bold' },
  });

  const filters = [
    { key: 'all', label: 'Tous' },
    { key: 'en_attente', label: 'En attente' },
    { key: 'finance', label: 'Financement 100%' },
    { key: 'en_prod', label: 'En production' },
    { key: 'termine', label: 'Terminés' },
  ];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
      {filters.map(({ key, label }) => (
        <TouchableOpacity key={key} onPress={() => setSelected(key)} className="mx-2">
          <Text style={[styles.text, selected === key && styles.selected]}>
            {label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};



/* ---------- Écran principal ---------- */
export default function Project() {
  const [isSearchFocus, setIsSearchFocus] = useState(false);
  const { projects, loading } = useProjects();
  const [selected, setSelected] = useState('all');

  return (
    <ScrollView className="px-5">
      <View className="mt-4">
        <Text className="font-extrabold text-4xl">Projects</Text>
        <Text className="text-gray-500 text-xl">
          Gérez vos projets agricole ici
        </Text>
      </View>

      {/* Barre de recherche */}
      <View className="my-5">
        <View
          className={`flex-row items-center border rounded-lg mt-4 p-2 ${
            isSearchFocus ? 'border-green-700 border-2' : 'border-gray-300'
          }`}
        >
          <SearchIcon size={20} color="#888" />
          <TextInput
            placeholder="Rechercher..."
            className="ml-2 flex-1"
            onFocus={() => setIsSearchFocus(true)}
            onBlur={() => setIsSearchFocus(false)}
          />
        </View>

        <TouchableOpacity className="bg-green-600 rounded-lg py-3 flex flex-row justify-center items-center mt-3">
          <Plus color="#ffffff" />
          <Text className="text-white font-semibold ml-1">Nouveau projet</Text>
        </TouchableOpacity>
      </View>

      {/* Filtres */}
      <StatusSelect selected={selected} setSelected={setSelected} />

      {loading && <ActivityIndicator size={30} color="#009800" className="mt-5" />}

      {/* Liste */}
      <FlatList
        data={projects}
        keyExtractor={(p) => String(p.id_projet)}
        renderItem={({ item }) => <ListTerrain item={item} selected={selected} />}
        scrollEnabled={false}
        className="border border-gray-300 rounded-xl p-3 my-5"
      />
    </ScrollView>
  );
}