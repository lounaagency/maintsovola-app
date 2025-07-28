
import { AssignedParcel, WeeklyTask, InterventionReport } from './technicien';

export interface ProjectOverview {
  id_projet: number;
  titre: string;
  statut: string;
  avancement_pourcentage: number;
  technicien_assigne: {
    id_utilisateur: string;
    nom: string;
    prenoms: string;
  };
  alertes: ProjectAlert[];
  retards: number;
  derniere_activite: string;
}

export interface ProjectAlert {
  id_alerte: number;
  type: 'retard' | 'blocage' | 'anomalie' | 'materiel';
  gravite: 'faible' | 'moyenne' | 'haute' | 'critique';
  message: string;
  date_creation: string;
  statut: 'ouverte' | 'en_cours' | 'resolue';
  id_projet: number;
  id_technicien?: string;
}

export interface TechnicianPerformance {
  id_technicien: string;
  nom: string;
  prenoms: string;
  projets_assignes: number;
  taches_completees: number;
  taches_en_retard: number;
  taux_completion: number;
  qualite_rapports: number;
  derniere_activite: string;
  presences_semaine: number;
}

export interface LogisticsRequest {
  id_demande: number;
  id_superviseur: string;
  type_materiel: 'semences' | 'engrais' | 'outils' | 'equipement' | 'autre';
  description: string;
  quantite: number;
  urgence: 'normale' | 'urgente' | 'critique';
  date_demande: string;
  date_livraison_souhaitee: string;
  statut: 'en_attente' | 'approuvee' | 'en_cours' | 'livree' | 'refusee';
  projet_concerne?: number;
}

export interface PerformanceKPI {
  periode: string;
  projets_total: number;
  projets_en_cours: number;
  projets_en_retard: number;
  taux_reussite: number;
  productivite_moyenne: number;
  incidents_resolus: number;
  satisfaction_agriculteurs: number;
}

export interface MapParcel {
  id_projet: number;
  titre: string;
  latitude: number;
  longitude: number;
  statut_couleur: 'green' | 'orange' | 'red';
  technicien_nom: string;
  surface_ha: number;
  derniere_visite: string;
}
