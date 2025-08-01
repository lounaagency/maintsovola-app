import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useAuth } from '~/contexts/AuthContext';
import { useInvestments } from '~/hooks/useInvestment';
import { PieChart } from 'react-native-chart-kit';

export default function InvestmentsScreen() {
  const { user } = useAuth();
  const { investedProjects, investmentSummary, loading, error, refresh } = useInvestments(user?.id || '');

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#125b47" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-red-500 mb-4">{error}</Text>
        <TouchableOpacity 
          onPress={refresh}
          className="bg-primary py-2 px-4 rounded"
        >
          <Text className="text-white">Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      <View className="mb-6 bg-white rounded-lg p-4 shadow-sm">
        <Text className="text-xl font-bold mb-4 text-gray-800">Résumé des Investissements</Text>
        <View className="flex-col gap-2 justify-between mb-4">
             <View className="border border-gray-300 p-3 rounded-lg">
               <Text className="text-gray-500">Total Investi</Text>
               <Text className="text-xl font-bold text-primary">
                 {investmentSummary.totalInvested.toLocaleString()} AR
               </Text>
             </View>
             <View className="border border-gray-300 p-3 rounded-lg">
               <Text className="text-gray-500">Bénéfice Total</Text>
               <Text className="text-xl font-bold text-green-600">
                 {investmentSummary.totalProfit.toLocaleString()} AR
               </Text>
             </View>
             <View className="border border-gray-300 p-3 rounded-lg">
               <Text className="text-gray-500">ROI Moyen</Text>
               <Text className="text-xl font-bold text-blue-600">
                 {investmentSummary.averageROI.toFixed(1)}%
               </Text>
             </View>
        </View>
        {investmentSummary.projectsByStatusData.length > 0 && (
          <View className="items-center mt-6">
            <Text className="text-gray-500 mb-2">Statut des Projets</Text>
            <PieChart
              data={investmentSummary.projectsByStatusData}
              width={300}
              height={150}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="value"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
            <View className="flex-row flex-wrap justify-center space-x-4 mt-2">
              {investmentSummary.projectsByStatusData.map((item, index) => (
                <View key={index} className="flex-row items-center mr-2 mb-1">
                  <View className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: item.color }} />
                  <Text className="text-xs text-gray-600">{item.name}: {item.value}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      <Text className="text-xl font-bold mb-4 text-gray-800">Mes Projets Investis</Text>

      {investedProjects.length === 0 ? (
        <View className="bg-white rounded-lg p-6 items-center">
          <Text className="text-gray-500 mb-4">Aucun projet investi pour le moment</Text>
          <TouchableOpacity className="bg-primary py-2 px-4 rounded">
            <Text className="text-white">Explorer les projets</Text>
          </TouchableOpacity>
        </View>
      ) : (
        investedProjects.map((project, index) => (
          <TouchableOpacity
            key={`${project.id}-${index}`}
            className="bg-white rounded-lg p-4 mb-4 shadow-sm"
          >
            {/* Titre + statut */}
            <View className="flex-row justify-between items-start mb-2">
              <Text className="font-bold text-lg flex-1">{project.title}</Text>
              <Text
                className={`text-xs px-2 py-1 rounded ${
                  project.status === 'terminé' ? 'bg-green-100 text-green-800' :
                  project.status === 'en financement' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}
              >
                {project.status}
              </Text>
            </View>

            {project.creator && (
              <View className="flex-row items-center mb-2">
                {project.creator.avatar && (
                  <Image
                    source={{ uri: project.creator.avatar }}
                    className="w-6 h-6 rounded-full mr-2"
                  />
                )}
                <Text className="text-sm text-gray-600">Créé par {project.creator.name}</Text>
              </View>
            )}

            <View className="flex-row justify-between mb-1">
              <Text className="text-gray-500">Investissement:</Text>
              <Text className="font-semibold">{project.userInvestment.toLocaleString()} AR</Text>
            </View>

            {/* ROI */}
            <View className="flex-row justify-between mb-1">
              <Text className="text-gray-500">ROI:</Text>
              <Text className={`font-semibold ${project.roi > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {project.roi.toFixed(1)}%
              </Text>
            </View>

            {/* Bénéfice estimé */}
            <View className="flex-row justify-between mb-1">
              <Text className="text-gray-500">Bénéfice estimé:</Text>
              <Text className={`font-semibold ${project.userProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {project.userProfit.toLocaleString()} AR
              </Text>
            </View>

            {/* Barre de progression */}
            <View className="mt-3">
              <View className="flex-row justify-between mb-1">
                <Text className="text-xs text-gray-500">Progrès des jalons</Text>
                <Text className="text-xs text-gray-500">
                  {project.completedJalons}/{project.totalJalons} ({Math.round(project.jalonProgress)}%)
                </Text>
              </View>
              <View className="h-2.5 bg-gray-200 rounded-full overflow-hidden">                
                <View
                  className={`h-full rounded-full ${
                    project.jalonProgress < 33 ? 'bg-red-500' :
                    project.jalonProgress < 66 ? 'bg-yellow-400' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${project.jalonProgress}%` }}
                />                
              </View>
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}
