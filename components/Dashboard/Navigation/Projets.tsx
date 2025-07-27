import { Stack } from 'expo-router';
import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import ProjectsSummary, { ProjectsSummaryProps } from '~/components/ProjectsSummary';
import { useTotalSurfaceForTantsaha } from '~/hooks/useTotalSurfaceForTantsaha';
import { useTotalProjectNumberForTantsaha } from '~/hooks/useTotalProjectNumberForTantsaha'; // Assumed to return 'count'
import { useTotalFundingForTantsaha } from '~/hooks/useTotalFundingForTantsaha';

const defaultProjectsSummaryData: ProjectsSummaryProps = {
  totalProjects: 0,
  totalArea: 0,
  totalFunding: 0,
  totalProfit: 0,
  ownerProfit: 0,
  projectsByStatus: {
    enFinancement: { count: 0, area: 0, funding: 0, profit: 0, ownerProfit: 0, cultures: [] },
    enCours: { count: 0, area: 0, funding: 0, profit: 0, ownerProfit: 0, cultures: [] },
    termine: { count: 0, area: 0, funding: 0, profit: 0, ownerProfit: 0, cultures: [] },
  },
  projectsByCulture: [],
};

const Projets = () => {
  const currentTantsahaId = '28ff57b7-fb92-4593-b239-5c56b0f44560';

  // Hook 1: Total Surface Area
  const { totalSurface, loading: loadingSurface, error: errorSurface } = useTotalSurfaceForTantsaha(currentTantsahaId);

  // Hook 2: Total Project Number
  // FIX: Destructure 'count' and alias it to 'totalProjectCount' for consistency
  const { totalProject: totalProjectCount, loading: loadingProjectCount, error: errorProjectCount } = useTotalProjectNumberForTantsaha(currentTantsahaId);

  // Hook 3: Total Funding
  const { totalFunding, loading: loadingFunding, error: errorFunding } = useTotalFundingForTantsaha(currentTantsahaId);

  const [summaryData, setSummaryData] = useState<ProjectsSummaryProps>(defaultProjectsSummaryData);

  // Combine ALL loading states
  const isLoading = loadingSurface || loadingProjectCount || loadingFunding;

  // Combine ALL error states
  const hasError = errorSurface || errorProjectCount || errorFunding;

  // useEffect to update summaryData once all pieces of data are loaded
  useEffect(() => {
    // Only update if all hooks have finished loading AND their data is not null
    // AND there are no errors from any hook
    if (
      !isLoading && // Use combined isLoading for conciseness
      !hasError &&   // Only update summaryData if there are no errors
      totalSurface !== null &&
      totalProjectCount !== null && // Use totalProjectCount
      totalFunding !== null
    ) {
      setSummaryData(prevData => ({
        ...prevData,
        totalArea: totalSurface,
        totalProjects: totalProjectCount, // FIX: Use totalProjectCount
        totalFunding: totalFunding,
      }));
    }
  }, [
    totalSurface, totalProjectCount, totalFunding, // Data values
    isLoading, // Combined loading state
    hasError // Combined error state (optional, but good for robust reactivity)
  ]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading project summary...</Text>
      </View>
    );
  }

  if (hasError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading data:</Text>
        {errorSurface && <Text style={styles.errorText}>- Surface data: {errorSurface}</Text>}
        {errorProjectCount && <Text style={styles.errorText}>- Project count data: {errorProjectCount}</Text>}
        {errorFunding && <Text style={styles.errorText}>- Funding data: {errorFunding}</Text>}
        <Text style={styles.errorText}>Please try again later.</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Projets' }} />
      <View className='flex-1'>
        <ProjectsSummary {...summaryData} />
      </View>
    </>
  );
}
export default Projets;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  container: {
    flex: 1,
    padding: 24,
  },
});