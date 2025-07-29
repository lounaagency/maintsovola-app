import { useDetails } from "@/hooks/useProject";
import { ProjectData } from "@/type/projectInterface";
import { useState } from "react";
import { ActivityIndicator, Modal, View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import CreateProjectModal from "../CreateProjectModal";

type ModalDetailsProps = {
  projectId: number;
  isVisible: boolean;
  onClose: () => void;
};


export const ModalDetails = ({ projectId, isVisible, onClose }: ModalDetailsProps) => {
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


type CreateModalProps = {
  project?: any;
  onClose: () => void;
  isVisible: boolean;
};

export const ModalAddStyled = ({ project, onClose, isVisible }: CreateModalProps) => {
  return (
    <Modal visible={isVisible} transparent animationType="slide">
      <View className="flex-1 justify-center bg-black/50 px-4">
        <View className="rounded-xl bg-white p-6 border border-zinc-500">
          <ScrollView>
            <CreateProjectModal project={project} onClose={onClose} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};