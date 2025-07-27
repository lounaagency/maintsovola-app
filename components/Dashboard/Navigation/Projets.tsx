import { Stack } from 'expo-router';

import { StyleSheet, View } from 'react-native';
import ProjectsSummary from '~/components/ProjectsSummary';
import { ProjectsSummaryProps } from '~/components/ProjectsSummary';



export const simpleProjectsSummaryData: ProjectsSummaryProps = {
  totalProjects: 5,
  totalArea: 10.5,
  totalFunding: 150000,
  totalProfit: 75000,
  ownerProfit: 30000,
  projectsByStatus: {
    enFinancement: {
      count: 2,
      area: 4.0,
      funding: 50000,
      profit: 20000,
      ownerProfit: 8000,
      cultures: [], // No cultures for simplicity
    },
    enCours: {
      count: 2,
      area: 5.5,
      funding: 70000,
      profit: 40000,
      ownerProfit: 16000,
      cultures: [],
    },
    termine: {
      count: 1,
      area: 1.0,
      funding: 30000,
      profit: 15000,
      ownerProfit: 6000,
      cultures: [],
    },
  },
  projectsByCulture: [], // No overall culture data for simplicity
};

export default function Home() {
  return (
    <>
      <Stack.Screen options={{ title: 'Projets' }} />
      <View className='flex-1'>
        <ProjectsSummary {...simpleProjectsSummaryData}  />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
});
