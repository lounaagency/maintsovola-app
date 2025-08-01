export interface User {
    id_utilisateur: string
    email: string
    nom: string
    prenom: string
  }
  
  export interface Conversation {
    id_conversation: string
    id_utilisateur1: string
    id_utilisateur2: string
    derniere_activite: string
    created_at: Date
  }
  
  export interface Message {
    id_message: string
    id_conversation: string
    id_expediteur: string
    id_destinateur: string
    date_envoi: string
    contenu: string
    created_at: Date
    created_by: Date
    modified_at: Date
    pieces_jointes: string[] | null
    lu: boolean
  }
  
  export interface ConversationWithUser extends Conversation {
    other_user: User
    last_message?: Message
  }
  