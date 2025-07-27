import { useState, useEffect } from 'react';
import { supabase } from '~/utils/supabase'; // Adjust this path to your supabase client initialization

// Define the structure of the related projet data
interface FetchedProjetDataForFunding {
  id_tantsaha: string;
}

// Define the structure of the investissement record with nested projet data
interface FetchedInvestissementWithProjet {
  montant: number; // This must be selected!
  projet: FetchedProjetDataForFunding | null;
}

interface UseTotalFundingResult {
  totalFunding: number | null;
  loading: boolean;
  error: string | null;
}

export const useTotalFundingForTantsaha = (tantsahaId: string | null): UseTotalFundingResult => {
  const [totalFunding, setTotalFunding] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tantsahaId) {
      setTotalFunding(null);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchFundingData = async () => {
      setLoading(true);
      setError(null);
      console.log("Starting fetching investments!")
      try {
        const { data: investissements, error: supabaseError } = await (
          supabase
            .from('investissement')
            .select(
              `
                montant,
                projet!id_projet (
                  id_tantsaha
                )
              `
            )
            .eq('projet.id_tantsaha', tantsahaId)
        ) as { data: FetchedInvestissementWithProjet[] | null, error: any };

        console.log("Fetched investissements:", investissements)

        if (supabaseError) {
          console.error('Supabase Error fetching investissement data:', supabaseError.message);
          setError(supabaseError.message);
          setTotalFunding(null);
          return;
        }

        if (!investissements || investissements.length === 0) {
          setTotalFunding(0);
          return;
        }

        const calculatedTotal = investissements.reduce((sum: number, item: FetchedInvestissementWithProjet) => {
          if (typeof item.montant === 'number') {
            return sum + item.montant;
          }
          console.warn('Non-numeric montant found, skipping item:', item);
          return sum;
        }, 0);

        setTotalFunding(calculatedTotal);

      } catch (err: any) {
        console.error('An unexpected error occurred in useTotalFundingForTantsaha:', err);
        setError(err.message || 'An unknown error occurred while fetching funding data.');
        setTotalFunding(null);
      } finally {
        setLoading(false);
      }
    };

    fetchFundingData();
  }, [tantsahaId]);

  return { totalFunding, loading, error };
};