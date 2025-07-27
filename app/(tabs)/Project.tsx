// Project.tsx
import { error } from 'console';
import { Plus, SearchIcon} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDetails, useProjects } from '@/hooks/useProject';
import type { ProjectData } from '@/type/projectInterface';

const colorCode = {
    "en attente": "#cbe043",
    "en financement": "#94e043",
    "en cours": "#5de043",
    "terminé": "#2ce026",
  }


/* ---------- Carte projet ---------- */
type ListTerrainProps = { item: ProjectData; selected: string };

const ListTerrain = ({ item, selected }: ListTerrainProps) => {
  const [modalVisible, setModalVisible] = useState(false);

  const visible = useMemo(() => {
    switch (selected) {
      case 'en_attente':
        return item.statut === 'en attente';
      case 'finance':
        return item.statut === 'en financement';
      case 'en_prod':
        return item.statut === 'en cours';
      case 'termine':
        return item.statut === 'terminé';
      default:
        return true;
    }
  }, [item.statut, selected]);

  if (!visible) return null;

  return (
    <>
      <TouchableOpacity
        className="my-2 min-h-24 rounded-lg border border-gray-300 p-3"
        activeOpacity={0.5}
        onPress={() => setModalVisible(true)}
      >
        <View className="flex-row justify-between">
          <View>
            <Text className="text-xl font-bold">{item.titre}</Text>
            <Text className="text-gray-500">
              {item.tantsaha?.nom} {item.tantsaha?.prenoms}
            </Text>
          </View>
          <View className="justify-end">
            <Text className={`rounded-full border border-gray-200 px-2 text-sm`} style={{ backgroundColor: colorCode[item.statut as keyof typeof colorCode] }} >{item.statut}</Text>
          </View>
        </View>
      </TouchableOpacity>

      <ModalDetails
        projectId={item.id_projet}
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
      /> bg-[${colorCode[item.statut  as keyof typeof colorCode]}]
    </>
  );
};

type ModalDetailsProps = {
  projectId: number;
  isVisible: boolean;
  onClose: () => void;
};

const ModalDetails = ({ projectId, isVisible, onClose }: ModalDetailsProps) => {
  const {projects, loading} = useDetails(projectId);
  const [finJal, setFinJal] = useState<boolean>(false)
  return (
    <Modal visible={isVisible} transparent animationType="slide">
      {loading && <ActivityIndicator size={30} color="#009800" className="mt-5" />}
      <View className="flex-1 justify-center bg-black/50 px-4">
        <View className="rounded-xl bg-white p-6 border border-zinc-500">
          <Text className="text-2xl font-bold text-gray-600">Détails sur le projet:  {projects?.titre}</Text>
          <View className="mt-4">
            <Text className="font-semibold text-xl">Agriculteur:</Text>
            <View className="mt-2 flex-row items-center justify-between">
              <Text>{projects?.tantsaha?.nom} {projects?.tantsaha?.prenoms}</Text>
              {projects?.tantsaha?.photo_profil && (
                <Image
                  source={{ uri: projects.tantsaha.photo_profil }}
                  // style={{ width: 40, height: 40 }}
                  width={50}
                  height={50}
                  className="rounded-full"
                />
              )}
            </View>
          </View>
          <View>
            <Text className='text-xl font-semibold'>Terrain:</Text>
            <View>
              <Text>nom: {projects?.terrain?.nom_terrain}</Text>
              <Text>surface: {projects?.surface_ha} Ha</Text>
              <Text>Localisation: {projects?.region?.nom_region}, {projects?.district?.nom_district}, {projects?.commune?.nom_commune}</Text>
            </View>
            <Text>Description: {projects?.description}</Text>
          </View>
          <View className='flex flex-row items-center justify-around text-base tracking-wide'>
            <TouchableOpacity onPress={onClose} className="mt-3 p-3 items-center bg-yellow-500 rounded-lg px-6">
              <Text className=" font-semibold">Fermer</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {}} className='mt-3 p-3 items-center flex flex-row bg-zinc-200 rounded-lg px-6'>
              <Text className='text-green-700 font-bold'>Modifier</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className='bg-gray-300 min-h-8 rounded-lg p-1'>
              <View className=' rounded flex flex-row justify-around'>
                <TouchableOpacity className='p-1' onPress={() => setFinJal(false)}>
                  <Text className={`text-2xl py-1 px-4 rounded-md w-full ${!finJal && 'bg-white'}`}>Financement</Text>
                </TouchableOpacity>
                <TouchableOpacity className='p-1' onPress={() => setFinJal(true)}>
                  <Text className={`text-2xl py-1 px-4 rounded-md w-full ${finJal && 'bg-white'}`}>Jalons & Production</Text>
                </TouchableOpacity>
              </View>
        </View>
        <View className='bg-white rounded-lg p-4 mt-1 min-h-20'>

        </View>
      </View>
    </Modal>
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
    { key: 'finance', label: 'En financement' },
    { key: 'en_prod', label: 'En production' },
    { key: 'termine', label: 'Terminés' },
  ];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
      {filters.map(({ key, label }) => (
        <TouchableOpacity key={key} onPress={() => setSelected(key)} className="mx-2">
          <Text style={[styles.text, selected === key && styles.selected]}>{label}</Text>
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
        <Text className="text-4xl font-extrabold">Projects</Text>
        <Text className="text-xl text-gray-500">Gérez vos projets agricole ici</Text>
      </View>

      {/* Barre de recherche */}
      <View className="my-5">
        <View
          className={`mt-4 flex-row items-center rounded-lg border p-2 ${
            isSearchFocus ? 'border-2 border-green-700' : 'border-gray-300'
          }`}>
          <SearchIcon size={20} color="#888" />
          <TextInput
            placeholder="Rechercher..."
            className="ml-2 flex-1"
            onFocus={() => setIsSearchFocus(true)}
            onBlur={() => setIsSearchFocus(false)}
          />
        </View>

        <TouchableOpacity className="mt-3 flex flex-row items-center justify-center rounded-lg bg-green-600 py-3">
          <Plus color="#ffffff" />
          <Text className="ml-1 font-semibold text-white">Nouveau projet</Text>
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
        className="my-5 rounded-xl border border-gray-300 p-3"
      />
    </ScrollView>
  );
}
