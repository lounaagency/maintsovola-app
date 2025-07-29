
import { PAYMENT_TYPES, PaymentType } from './paymentTypes';

export interface BudgetMensuel {
  id_budget_mensuel: number;
  annee: number;
  mois: number;
  montant_total: number;
  montant_engage: number;
  montant_utilise: number;
  created_at: string;
  modified_at: string;
  created_by: string;
}

export interface ResumeFinancier {
  annee: number;
  mois: number;
  budget_total: number;
  montant_engage: number;
  montant_utilise: number;
  solde_disponible: number;
  jalons_en_attente: number;
}

export interface JalonFinancement {
  id_jalon_projet: number;
  id_projet: number;
  date_previsionnelle: string;
  statut: string;
  nom_jalon: string;
  nom_projet: string;
  id_technicien: string;
  technicien_nom: string;
  technicien_prenoms: string;
  montant_demande: number;
  surface_ha: number;
}

export interface PaiementTechnicien {
  id_jalon_projet: number;
  montant: number;
  reference_paiement: string;
  observation?: string;
  date_previsionnelle?: string;
  type_paiement: PaymentType;
  numero_cheque?: string;
  numero_mobile_banking?: string;
}

export interface TechnicienMobileBanking {
  id_telephone: number;
  numero: string;
  type: string;
}

export interface ReceiptData {
  montant: number;
  technicien_nom: string;
  nom_projet: string;
  reference_paiement: string;
  date_paiement: string;
}

export interface HistoriquePaiementFinancier {
  id_historique_paiement: number;
  id_projet: number;
  montant: number;
  date_paiement: string;
  reference_paiement: string;
  type_paiement: string;
  justificatif_url?: string;
  statut_justificatif: string;
  observation?: string;
  technicien_nom?: string;
  nom_projet?: string;
}

export interface PrevisionFinanciere {
  periode: string;
  montant_prevu: number;
  montant_engage: number;
  ecart: number;
}
