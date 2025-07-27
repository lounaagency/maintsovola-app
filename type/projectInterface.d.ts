export interface ProjectData {
  id_projet: number;
  titre?: string;
  statut: string;
  surface_ha: number;
  description?: string;
  created_at?: string;
  id_tantsaha?: string;
  id_technicien?: string;
  id_superviseur?: string;
  id_terrain: number;
  tantsaha?: {
    nom: string;
    prenoms?: string;
    photo_profil?:string;
  } | null;
  terrain?: {
    nom_terrain?: string;
  };
  region?: {
    nom_region?: string;
  };
  district?: {
    nom_district?: string;
  };
  commune?: {
    nom_commune?: string;
  };
  projet_culture?: {
    id_projet_culture: number;
    id_culture: number;
    culture?: {
      nom_culture?: string;
    };
    cout_exploitation_previsionnel?: number;
  }[];
  photos?: string;
  id_region?: number;
  id_district?: number;
  id_commune?: number;
  fundingGoal?: number;
  currentFunding?: number;
  investissements?: {
    montant: number;
  }[];
}