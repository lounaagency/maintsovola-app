// hooks/useProjects.ts
import { useEffect, useState } from 'react';
import { supabase } from '~/utils/supabase';
import type { ProjectData } from '~/type/projectInterface';

export function useProjects() {
  const [data, setData] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('projet')
        .select(`
          *,
          tantsaha:id_tantsaha(nom, prenoms),
          terrain(id_terrain, nom_terrain),
          region:id_region(nom_region),
          district:id_district(nom_district),
          commune:id_commune(nom_commune),
          projet_culture(
            id_projet_culture,
            id_culture,
            cout_exploitation_previsionnel,
            culture(id_culture, nom_culture)
          ),
          investissements:investissement(montant)
        `);

      if (!error) setData(data ?? []);
      setLoading(false);
    })();
  }, []);

  return { projects: data, loading };
}