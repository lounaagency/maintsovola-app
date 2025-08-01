import { View, Text, ActivityIndicator } from 'react-native';
import React from 'react';
import InvestmentSummary from '~/components/InvestmentSummary';
import { useFetchInvestmentData } from '~/hooks/useFetchInvestmentData'; // Assurez-vous que le chemin est correct

const DashboardPage = () => {
  const { data, loading, error } = useFetchInvestmentData();

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-2 text-gray-600">Chargement des données d{"'"}investissement...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-red-500 text-center">Erreur: {error}</Text>
      </View>
    );
  }

  // Si les données sont nulles (par exemple, après une erreur sans que 'error' ne soit défini, bien que peu probable ici)
  if (!data) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-gray-600 text-center">Aucune donnée d{"'"}investissement disponible.</Text>
      </View>
    );
  }

  return (
    <View className="">      
      <InvestmentSummary
        totalInvested={data.totalInvested}
        totalProfit={data.totalProfit}
        averageROI={data.averageROI}
        ongoingProjects={data.ongoingProjects}
        completedProjects={data.completedProjects}
        projectsByStatusData={data.projectsByStatusData}
      />
    </View>
  );
};

export default DashboardPage;