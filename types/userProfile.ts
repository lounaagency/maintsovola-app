
import { PhoneType } from "./paymentTypes";

export interface UserTelephone {
  id_telephone: number;
  id_utilisateur: string;
  numero: string;
  type: PhoneType;
  est_whatsapp: boolean;
  est_mobile_banking: boolean;
  created_at: string;
  modified_at: string;
}

export interface UserProfile {
  id_utilisateur: string;
  id: string;
  nom: string;
  prenoms?: string;
  email: string;
  photo_profil?: string;
  photo_couverture?: string;
  telephone?: string;
  adresse?: string;
  bio?: string;
  id_role?: number;
  nom_role?: string;
  telephones?: UserTelephone[];
}
