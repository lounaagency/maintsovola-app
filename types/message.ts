
export interface Conversation {
  id_conversation: number;
  id_utilisateur1: string;
  id_utilisateur2: string;
  derniere_activite: string;
  other_user?: {
    id_utilisateur: string;
    nom: string;
    prenoms: string | null;
    photo_profil: string | null;
  };
}

export interface Message {
  id_message: number;
  id_conversation: number;
  id_expediteur: string;
  id_destinataire: string;
  contenu: string;
  date_envoi: string;
  lu: boolean;
  pieces_jointes?: string[]; // Array of file paths
}

export interface ConversationMessage extends Message {
  sender?: {
    id_utilisateur: string;
    nom: string;
    prenoms: string | null;
    photo_profil: string | null;
  };
  // UI display properties
  id?: string;
  user?: {
    id: string;
    name: string;
    photo_profil?: string;
    status?: "online" | "offline" | "away" | "busy" | "none";
  };
  other_user?: {
    id_utilisateur: string;
    nom: string;
    prenoms: string | null;
    photo_profil: string | null;
  };
  lastMessage?: {
    text: string;
    timestamp: string;
  };
  timestamp?: string;
  unread?: number;
}

export interface Recipient {
  id: string;
  name: string;
  photo_profil?: string;
}
