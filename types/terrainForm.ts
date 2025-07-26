
import { TerrainData } from './terrain';

export interface TerrainFormData {
  id_terrain?: number;
  nom_terrain?: string;
  surface_proposee?: number;
  surface_validee?: number;
  id_region?: string; // Form will use string for select inputs
  id_district?: string; // Form will use string for select inputs
  id_commune?: string; // Form will use string for select inputs
  acces_eau?: boolean;
  acces_route?: boolean;
  id_tantsaha?: string;
  geom?: number[][]; // Coordonnées du polygone [[lng, lat], [lng, lat], ...]
  photos?: string | string[]; // Can be string (comma-separated) or array of strings
  // Champs pour le rapport de validation
  date_validation?: string;
  rapport_validation?: string;
  photos_validation?: string | string[];
  validation_decision?: 'valider' | 'rejetter' | string;
}

// Convert from form data (strings) to API data (numbers)
export const convertFormDataToTerrainData = (formData: TerrainFormData): TerrainData => {
  const terrainData: TerrainData = {
    ...formData,
    id_region: formData.id_region ? Number(formData.id_region) : null,
    id_district: formData.id_district ? Number(formData.id_district) : null,
    id_commune: formData.id_commune ? Number(formData.id_commune) : null,
    surface_proposee: parseFloat((formData.surface_proposee || 0).toFixed(2)) || 0,
    nom_terrain: formData.nom_terrain || ""
  };
  
  // Add surface_validee if provided
  if (formData.surface_validee) {
    terrainData.surface_validee = parseFloat(formData.surface_validee.toFixed(2));
  }
  
  // Si des coordonnées de polygone ont été définies, créer un objet geom au format GeoJSON
  if (formData.geom && formData.geom.length >= 3) {
    // La propriété geom attend un objet GeoJSON Polygon
    terrainData.geom = {
      type: 'Polygon',
      coordinates: [formData.geom],
    };
  } else {
    // If no valid polygon is drawn, set geom to null
    terrainData.geom = null;
  }
  
  // Make sure photos is always a string for the API
  if (Array.isArray(formData.photos)) {
    terrainData.photos = formData.photos.join(',');
  }
  
  // Ajout des champs de validation si présents
  if (formData.date_validation) {
    terrainData.date_validation = formData.date_validation;
  }
  
  if (formData.rapport_validation) {
    terrainData.rapport_validation = formData.rapport_validation;
  }
  
  if (formData.photos_validation) {
    terrainData.photos_validation = Array.isArray(formData.photos_validation) 
      ? formData.photos_validation.join(',') 
      : formData.photos_validation;
  }

  if (formData.validation_decision) {
    terrainData.validation_decision = formData.validation_decision;
  }
  
  return terrainData;
};

// Convert from API data (numbers) to form data (strings)
export const convertTerrainDataToFormData = (terrainData: TerrainData): TerrainFormData => {
  const formData: TerrainFormData = {
    ...terrainData,
    nom_terrain: terrainData.nom_terrain || '',
    surface_proposee: terrainData.surface_proposee,
    id_region: terrainData.id_region?.toString() || '',
    id_district: terrainData.id_district?.toString() || '',
    id_commune: terrainData.id_commune?.toString() || '',
    acces_eau: Boolean(terrainData.acces_eau),
    acces_route: Boolean(terrainData.acces_route),
  };
  
  // Add surface_validee if present
  if (terrainData.surface_validee) {
    formData.surface_validee = terrainData.surface_validee;
  }
  
  // Convert photos string to array if needed
  if (typeof terrainData.photos === 'string') {
    formData.photos = terrainData.photos.split(',').filter(p => p.trim() !== '');
  } else if (Array.isArray(terrainData.photos)) {
    formData.photos = terrainData.photos;
  }
  
  // Extraire les coordonnées du polygone si elles existent
  if (terrainData.geom && terrainData.geom.type === 'Polygon' && 
      terrainData.geom.coordinates && terrainData.geom.coordinates[0]) {
    formData.geom = terrainData.geom.coordinates[0];
  }
  
  // Conversion des champs de validation
  if (terrainData.date_validation) {
    formData.date_validation = terrainData.date_validation;
  }
  
  if (terrainData.rapport_validation) {
    formData.rapport_validation = terrainData.rapport_validation;
  }
  
  if (terrainData.photos_validation) {
    formData.photos_validation = typeof terrainData.photos_validation === 'string' 
      ? terrainData.photos_validation.split(',').filter(p => p.trim() !== '')
      : terrainData.photos_validation;
  }

  if (terrainData.validation_decision) {
    formData.validation_decision = terrainData.validation_decision;
  }
  
  return formData;
};
