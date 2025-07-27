import { View, Text } from 'react-native';

export default function Investissement() {
  return (
    <View className="flex-1 p-4 bg-gray-50">
      <Text className="text-lg font-bold mb-4">Mes Investisement</Text>
      <View className="bg-white p-4 rounded-lg">
        <Text>Liste des projets...</Text>
      </View>
    </View>
  );
}