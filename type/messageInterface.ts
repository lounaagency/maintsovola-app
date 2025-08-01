export interface Conversation {
    id_conversation: number;
    id_utilisateur1: string;
    id_utilisateur2: string;
    derniere_activite: string;
    created_at: string;
}

export interface Message {
    id_message: string;
    id_conversation: number;
    id_expediteur: string;
    id_destinataire: string;
    contenu: string;
    date_envoi: string;
    lu: boolean;
    created_at: string;
    modified_at: string;
    pieces_jointes?: string[]; // Optional field for attachments
}

export interface Utilisateur {
    id_utilisateur: string;
    nom: string;
    prenoms: string;
    photo_profil?: string;
    email?: string;
}