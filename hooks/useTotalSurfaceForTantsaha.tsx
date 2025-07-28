import { useState, useEffect } from 'react';
import { supabase } from '~/lib/data';

interface UseTotalSurfaceResult {
  totalSurface: number | null;
  loading: boolean;
  error: string | null;
}

export const useTotalSurfaceForTantsaha = (tantsahaId: string | null): UseTotalSurfaceResult => {
  const [totalSurface, setTotalSurface] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tantsahaId) {
      setTotalSurface(null);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchSurfaceData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: projects, error: supabaseError } = await supabase
          .from('projet')
          .select(
            `
              id_projet,
              id_tantsaha,
              terrain:terrain!id_terrain (
                id_terrain,
                surface_validee
              )
            `
          )
          .eq('id_tantsaha', tantsahaId);

          console.log(projects)

        if (supabaseError) {
          console.error('Supabase Error fetching projects with terrain data:', supabaseError.message);
          setError(supabaseError.message);
          setTotalSurface(null);
          return;
        }

        if (!projects || projects.length === 0) {
          setTotalSurface(0);
          return;
        }

        // Calculate the sum client-side
        const calculatedTotal = projects.reduce((sum: number, project: any) => {
          if (Array.isArray(project.terrain)) {
            return (
              sum +
              project.terrain.reduce(
                (terrainSum: number, t: any) =>
                  typeof t.surface_validee === 'number' ? terrainSum + t.surface_validee : terrainSum,
                0
              )
            );
          } else if (project.terrain && typeof project.terrain.surface_validee === 'number') {
            return sum + project.terrain.surface_validee;
          }
          return sum;
        }, 0);

        setTotalSurface(calculatedTotal);

      } catch (err: any) {
        console.error('An unexpected error occurred in useTotalSurfaceForTantsaha:', err);
        setError(err.message || 'An unknown error occurred while fetching surface data.');
        setTotalSurface(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSurfaceData();
  }, [tantsahaId]);

  return { totalSurface, loading, error };
};