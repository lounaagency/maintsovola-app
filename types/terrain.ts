export interface TerrainData {
  id_terrain?: number;
  id_tantsaha?: string;
  id_region?: number | null;
  id_district?: number | null;
  id_commune?: number | null;
  surface_proposee: number;
  surface_validee?: number;
  acces_eau?: boolean | null;
  acces_route?: boolean | null;
  statut?: boolean;
  archive?: boolean;
  id_technicien?: string | null;
  id_superviseur?: string | null;
  region_name?: string;
  district_name?: string;
  commune_name?: string;
  created_at?: string;
  techniqueNom?: string;
  superviseurNom?: string;
  tantsahaNom?: string;
  nom_terrain: string;
  photos?: string | string[];
  geom?: any;
  date_validation?: string;
  rapport_validation?: string;
  photos_validation?: string | string[];
  validation_decision?: 'valider' | 'rejetter' | string;
  created_by?: string;
  modified_at?: string;
}

export interface TerrainFormData {
  id_terrain?: number;
  id_tantsaha?: string;
  id_technicien?: string | null;
  id_superviseur?: string | null;
  id_region: string;
  id_district: string;
  id_commune: string;
  surface_proposee: number;
  surface_validee?: number;
  acces_eau: boolean;
  acces_route: boolean;
  nom_terrain?: string;
  photos?: string | string[];
  geom?: number[][]; // Coordonnées du polygone [[lng, lat], [lng, lat], ...]
  // Validation fields
  date_validation?: string;
  rapport_validation?: string;
  photos_validation?: string | string[];
  validation_decision?: 'valider' | 'rejetter' | string;
}

export interface ProjetStatus {
  id_terrain: number;
  statut: string;
  has_investisseur: boolean;
}

export interface RegionData {
  id_region: number;
  nom_region: string;
}

export interface DistrictData {
  id_district: number;
  nom_district: string;
  id_region: number;
}

export interface CommuneData {
  id_commune: number;
  nom_commune: string;
  id_district: number;
}
export interface TerrainSortOptions {
  field: keyof TerrainData;
  direction: 'asc' | 'desc';
}

export interface TerrainFilters {
  region?: number;
  district?: number;
  commune?: number;
  hasWater?: boolean;
  hasRoad?: boolean;
}