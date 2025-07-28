"use client"
import { 
    View, 
    Text, 
    Button, 
    TextInput,
} from "react-native"
import { supabase } from "~/lib/data"
import { useAuth } from "~/contexts/AuthContext"
import { User } from "@supabase/supabase-js";

interface Utilisateur {
    id_utilisateur: string;
    email: string;
    nom: string;
    prenom: string;
}

interface Conversation {
    id_conversation: string;
    id_utilisateur1: string;
    id_utilisateur2: string;
    derniere_activite: string;
    created_at: Date;
}

interface Message {
    id_message: string;
    id_conversation: string;
    id_expediteur: string;
    id_destinateur: string;
    date_envoi: string;
    contenu: string;
    created_at: Date;
    created_by: Date;
    modified_at: Date;
    pirces_jointes: string[] | null;
    lu: boolean;
}

// VERSION CORRIGÉE - Récupération des conversations
const getConversation = async (user: User | null): Promise<Conversation[]> => {
    if (!user) {
        console.warn("Utilisateur non connecté");
        return [];
    }

    try {
        const { data, error } = await supabase
            .from('conversation')
            .select('*')
            .or(`id_utilisateur1.eq.${user.id},id_utilisateur2.eq.${user.id}`)
            .order('derniere_activite', { ascending: false });
        
        if (error) {
            console.error('Erreur lors de la récupération des conversations:', error);
            throw error;
        }

        // Formatage des données au format Conversation
        const convData: Conversation[] = data?.map((conv) => ({
            id_conversation: conv.id_conversation,
            id_utilisateur1: conv.id_utilisateur1,
            id_utilisateur2: conv.id_utilisateur2,
            derniere_activite: conv.derniere_activite,
            created_at: new Date(conv.created_at) // Conversion en Date
        })) || [];

        return convData;

    } catch (error) {
        console.error("Erreur inattendue:", error);
        return [];
    }
};

// VERSION CORRIGÉE - Récupération des messages
const getMessages = async (conversationId: string): Promise<Message[]> => {
    try {
        const { data, error } = await supabase
            .from('message')
            .select('*')
            .eq('id_conversation', conversationId)
            .order('date_envoi', { ascending: true });

        if (error) {
            console.error('Erreur lors de la récupération des messages:', error);
            throw error;
        }

        // Formatage des données au format Message
        const messages: Message[] = data?.map((msg) => ({
            id_message: msg.id_message,
            id_conversation: msg.id_conversation,
            id_expediteur: msg.id_expediteur,
            id_destinateur: msg.id_destinateur,
            date_envoi: msg.date_envoi,
            contenu: msg.contenu,
            created_at: new Date(msg.created_at),
            created_by: new Date(msg.created_by),
            modified_at: new Date(msg.modified_at),
            pirces_jointes: msg.pirces_jointes,
            lu: msg.lu || false
        })) || [];

        return messages;

    } catch (error) {
        console.error("Erreur inattendue:", error);
        return [];
    }
};

// VERSION CORRIGÉE - Envoi de message
const sendMessage = async (
    selectedConversation: Conversation, 
    user: { id: string, email: string }, 
    newMessage: string
): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('message')
            .insert({
                id_conversation: selectedConversation.id_conversation,
                id_expediteur: user.id,
                id_destinateur: selectedConversation.id_utilisateur1 === user.id 
                    ? selectedConversation.id_utilisateur2 
                    : selectedConversation.id_utilisateur1,
                contenu: newMessage,
                date_envoi: new Date().toISOString(),
                lu: false
            });

        if (error) {
            console.error("Erreur lors de l'envoi du message:", error);
            throw error;
        }

        // Mettre à jour la dernière activité de la conversation
        await updateConversationActivity(selectedConversation.id_conversation);
        
        return true;

    } catch (error) {
        console.error("Erreur inattendue lors de l'envoi:", error);
        return false;
    }
};

// FONCTION BONUS - Mise à jour de l'activité de conversation
const updateConversationActivity = async (conversationId: string): Promise<void> => {
    try {
        const { error } = await supabase
            .from('conversation')
            .update({ 
                derniere_activite: new Date().toISOString() 
            })
            .eq('id_conversation', conversationId);

        if (error) {
            console.error("Erreur lors de la mise à jour de l'activité:", error);
        }
    } catch (error) {
        console.error("Erreur inattendue:", error);
    }
};

// FONCTION BONUS - Récupération d'un utilisateur par ID
const getUtilisateur = async (userId: string): Promise<Utilisateur | null> => {
    try {
        const { data, error } = await supabase
            .from('utilisateur')
            .select('*')
            .eq('id_utilisateur', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return null; // Utilisateur non trouvé
            }
            console.error("Erreur lors de la récupération de l'utilisateur:", error);
            throw error;
        }

        // Formatage au format Utilisateur
        const utilisateur: Utilisateur = {
            id_utilisateur: data.id_utilisateur,
            email: data.email,
            nom: data.nom,
            prenom: data.prenom
        };

        return utilisateur;

    } catch (error) {
        console.error("Erreur inattendue:", error);
        return null;
    }
};

// FONCTION BONUS - Marquer les messages comme lus
const markMessagesAsRead = async (conversationId: string, userId: string): Promise<void> => {
    try {
        const { error } = await supabase
            .from('message')
            .update({ lu: true })
            .eq('id_conversation', conversationId)
            .eq('id_destinateur', userId)
            .eq('lu', false);

        if (error) {
            console.error("Erreur lors du marquage comme lu:", error);
            throw error;
        }
    } catch (error) {
        console.error("Erreur inattendue:", error);
    }
};

// EXEMPLE D'UTILISATION DANS UN COMPOSANT
const MessengerComponent = () => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [newMessage, setNewMessage] = useState("");
    const { user } = useAuth();

    // Charger les conversations
    const loadConversations = async () => {
        try {
            const convs = await getConversation(user);
            setConversations(convs);
            console.log("Conversations chargées:", convs);
        } catch (error) {
            console.error("Erreur lors du chargement des conversations:", error);
        }
    };

    // Charger les messages d'une conversation
    const loadMessages = async (conversationId: string) => {
        try {
            const msgs = await getMessages(conversationId);
            setMessages(msgs);
            console.log("Messages chargés:", msgs);
            
            // Marquer les messages comme lus
            if (user) {
                await markMessagesAsRead(conversationId, user.id);
            }
        } catch (error) {
            console.error("Erreur lors du chargement des messages:", error);
        }
    };

    // Envoyer un message
    const handleSendMessage = async () => {
        if (!selectedConversation || !user || !newMessage.trim()) return;

        try {
            const success = await sendMessage(selectedConversation, user, newMessage);
            if (success) {
                setNewMessage("");
                // Recharger les messages
                await loadMessages(selectedConversation.id_conversation);
                // Recharger les conversations pour mettre à jour l'ordre
                await loadConversations();
            }
        } catch (error) {
            console.error("Erreur lors de l'envoi:", error);
        }
    };

    return (
      <></>
    );
};

export { 
    getConversation, 
    getMessages, 
    sendMessage, 
    getUtilisateur, 
    markMessagesAsRead, 
    updateConversationActivity 
};