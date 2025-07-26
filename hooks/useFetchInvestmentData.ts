// hooks/useFetchInvestmentData.ts
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

interface InvestmentData {
  totalInvested: number;
  totalProfit: number;
  averageROI: number;
  ongoingProjects: number;
  completedProjects: number;
  projectsByStatusData: { name: string; value: number; color: string }[];
}

interface UseFetchInvestmentDataResult {
  data: InvestmentData | null;
  loading: boolean;
  error: string | null;
}

export function useFetchInvestmentData(): UseFetchInvestmentDataResult {
  const [data, setData] = useState<InvestmentData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchInvestmentData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: investments, error: fetchError } = await supabase
        .from('investissement')
        .select(`
          *,
          projet!inner(
            *,
            tantsaha:id_tantsaha(id_utilisateur, nom, prenoms, photo_profil)
          )
        `)
        .eq('id_investisseur', 1);

        if (fetchError) {
          throw fetchError;
        }

        let calculatedTotalInvested = 0;
        let calculatedTotalProfit = 0;
        let calculatedOngoingProjects = 0;
        let calculatedCompletedProjects = 0;

        investments.forEach((item) => {
          calculatedTotalInvested += item.amount_invested;
          calculatedTotalProfit += item.profit_loss;
          if (item.status === 'ongoing') { // Assurez-vous que 'ongoing' correspond à vos statuts
            calculatedOngoingProjects += 1;
          } else if (item.status === 'completed') { // Assurez-vous que 'completed' correspond à vos statuts
            calculatedCompletedProjects += 1;
          }
        });

        const calculatedAverageROI =
          calculatedTotalInvested > 0
            ? (calculatedTotalProfit / calculatedTotalInvested) * 100
            : 0;

        // --- Préparation des données pour projectsByStatusData (graphique circulaire) ---
        const projectsByStatusData = [
          { name: 'En cours', value: calculatedOngoingProjects, color: '#3b82f6' },
          { name: 'Terminé', value: calculatedCompletedProjects, color: '#10b981' },
        ];

        setData({
          totalInvested: calculatedTotalInvested,
          totalProfit: calculatedTotalProfit,
          averageROI: calculatedAverageROI,
          ongoingProjects: calculatedOngoingProjects,
          completedProjects: calculatedCompletedProjects,
          projectsByStatusData: projectsByStatusData,
        });
      } catch (err: any) {
        console.error('Erreur lors de la récupération des données d\'investissement:', err);
        setError(err.message || 'Échec du chargement des données d\'investissement.');
      } finally {
        setLoading(false);
      }
    };

    fetchInvestmentData();
  }, []); // Le tableau de dépendances vide signifie que cela ne s'exécute qu'une fois au montage du composant

  return { data, loading, error };
}
