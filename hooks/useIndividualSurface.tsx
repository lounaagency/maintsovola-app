import { useState, useEffect } from 'react';
import { supabase } from '~/utils/supabase'; // Adjust this path to your supabase client initialization

// Define interfaces for type safety
interface TerrainData {
  id: string;
  surface_validee: number;
}

interface ProjectWithTerrain {
  id: string;
  id_tantsaha: string;
  terrain: TerrainData;
  // Add other project fields if you are selecting them with '*' in the actual query
}

interface UseTotalSurfaceResult {
  totalSurface: number | null;
  loading: boolean;
  error: string | null;
}

/**
 * A custom React Hook to fetch and calculate the total validated surface area
 * for a specific 'tantsaha' (farmer/owner) client-side.
 *
 * @param tantsahaId The UUID string of the 'tantsaha' to query.
 * @returns An object containing:
 * - totalSurface: The calculated total surface area (number) or null.
 * - loading: A boolean indicating if the data is currently being fetched.
 * - error: A string with an error message, or null if no error.
 */
export const useTotalSurfaceForTantsaha = (tantsahaId: string | null): UseTotalSurfaceResult => {
  const [totalSurface, setTotalSurface] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch if tantsahaId is provided and not null
    if (!tantsahaId) {
      setTotalSurface(null);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchSurfaceData = async () => {
      setLoading(true);
      setError(null); // Clear previous errors
      try {
        const { data: projects, error: supabaseError } = await supabase
          .from('projet')
          .select(
            `
              id,
              id_tantsaha,
              terrain:terrain!id_terrain (
                id,
                surface_validee
              )
            `
          )
          .eq('id_tantsaha', tantsahaId);

        if (supabaseError) {
          console.error('Supabase Error fetching projects with terrain data:', supabaseError.message);
          setError(supabaseError.message);
          setTotalSurface(null);
          return;
        }

        if (!projects || projects.length === 0) {
          setTotalSurface(0); // No projects found, so total surface is 0
          return;
        }

        // Calculate the sum client-side
        const calculatedTotal = projects.reduce((sum: number, project: any) => {
          // terrain may be an array due to the join, so sum all surface_validee in terrain array
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
            // fallback if terrain is a single object
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
  }, [tantsahaId]); // Re-run effect if tantsahaId changes

  return { totalSurface, loading, error };
};