import { useState, useEffect } from 'react';
import { supabase } from '~/lib/data';

interface UsetTotalProjectNumberResult {
  totalProject: number | null;
  loading: boolean;
  error: string | null;
}

export const useTotalProjectNumberForTantsaha = (tantsahaId: string | null): UsetTotalProjectNumberResult => {
  const [totalProject, setTotalProject] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tantsahaId) {
      setTotalProject(null);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchTotalProject = async () => {
      setLoading(true);
      setError(null);
      try {
        const { count: nb_projet, error: supabaseError } = await supabase
          .from('projet')
          .select('id_projet', { count: 'exact', head: true})
          .eq('id_tantsaha', tantsahaId);

        if (supabaseError) {
          console.error('Supabase Error fetching projects with terrain data:', supabaseError.message);
          setError(supabaseError.message);
          setTotalProject(null);
          return;
        }

        setTotalProject(nb_projet);

      } catch (err: any) {
        console.error('An unexpected error occurred in useTotalSurfaceForTantsaha:', err);
        setError(err.message || 'An unknown error occurred while fetching surface data.');
        setTotalProject(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTotalProject();
  }, [tantsahaId]);

  return { totalProject, loading, error };
};