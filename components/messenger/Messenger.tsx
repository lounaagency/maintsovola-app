"use client"
import { 
    View, 
    Text, 
    Button, 
    TextInput,
} from "react-native"
import { supabase } from "~/lib/data"
import { useAuth } from "~/contexts/AuthContext"
import { useEffect, useState } from "react";

interface User {
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

const MessengerScreen = () => {
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState<string>("")

    const { user } = useAuth()

    // Fonction pour récupérer les conversations de l'utilisateur connecté
    const fetchConversations = async () => {
        if (!user) {
            console.warn("Utilisateur non connecté.");
            return;
        }

        try {
            const { data, error } = await supabase
                .from('conversation')
                .select('*')
                .or(`id_utilisateur1.eq.${user.id},id_utilisateur2.eq.${user.id}`)
                .order('derniere_activite', { ascending: false });

            if (error) {
                console.error('Erreur lors de la récupération des conversations:', error);
            } else {
                console.log('Conversations récupérées:', data);
                setConversations(data || []);
            }
        } catch (err) {
            console.error("Erreur inattendue lors de la récupération des conversations:", err);
        }
    };

    // Fonction pour récupérer les messages d'une conversation sélectionnée
    const fetchMessages = async (conversationId: string) => {
        try {
            const { data, error } = await supabase
                .from('message')
                .select('*')
                .eq('id_conversation', conversationId)
                .order('date_envoi', { ascending: true });

            if (error) {
                console.error('Erreur lors de la récupération des messages:', error);
            } else {
                console.log('Messages récupérés:', data);
                setMessages(data || []);
            }
        } catch (err) {
            console.error("Erreur inattendue lors de la récupération des messages:", err);
        }
    };

    // Fonction pour récupérer tous les messages
    const fetchAllMessages = async () => {
        try {
            const { data, error } = await supabase
                .from('message')
                .select('*')
                .order('date_envoi', { ascending: true });

            if (error) {
                console.error('Erreur lors de la récupération de tous les messages:', error);
            } else {
                console.log('Tous les messages récupérés:', data);
                setMessages(data || []); // Mettre à jour l'état avec tous les messages
            }
        } catch (err) {
            console.error("Erreur inattendue lors de la récupération de tous les messages:", err);
        }
    };
    // Fonction pour envoyer un message
    const sendMessage = async () => {
        if (!user || !selectedConversation) {
            console.warn("Utilisateur ou conversation non sélectionnée.");
            return;
        }

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
                });

            if (error) {
                console.error("Erreur lors de l'envoi du message:", error);
            } else {
                console.log("Message envoyé avec succès.");
                setNewMessage(""); // Réinitialiser le champ de saisie
                fetchMessages(selectedConversation.id_conversation); // Recharger les messages
            }
        } catch (err) {
            console.error("Erreur inattendue lors de l'envoi du message:", err);
        }
    };

    // Charger les conversations et écouter les changements en temps réel
    useEffect(() => {
        if (user) {
            console.log("Utilisateur connecté:", user);
            fetchConversations();
        } else {
            console.warn("Aucun utilisateur connecté.");
        }
    }, [user]);

    // Charger les messages lorsque la conversation sélectionnée change
    useEffect(() => {
        fetchAllMessages()
        if (selectedConversation) {
            fetchMessages(selectedConversation.id_conversation);
        }
    }, [selectedConversation]);

    return (
        <View>
            <Text>
                {user ? `Welcome, ${user.email}` : "Please log in to continue"}
            </Text>
            <View>
  
            </View>
            <Text>Conversations:</Text>
            {conversations.map((conv: Conversation) => (
                <View key={conv.id_conversation} style={{ marginBottom: 10 }}>
                    <Button 
                        title={`ID: ${conv.id_conversation} User 1: ${conv.id_utilisateur1} User 2: ${conv.id_utilisateur2}`} 
                        onPress={() => setSelectedConversation(conv)} 
                    />
                </View>
            ))}

            <Text>Selected Conversation:</Text>
            {selectedConversation ? (
                <View>
                    <Text>ID: {selectedConversation.id_conversation}</Text>
                    <Text>Dernière activité: {selectedConversation.derniere_activite}</Text>
                    <Text>User 1: {selectedConversation.id_utilisateur1}</Text>
                    <Text>User 2: {selectedConversation.id_utilisateur2}</Text>

                    <Text>Messages:</Text>
                    {messages.map((msg: Message) => (
                        <View key={msg.id_message} style={{ marginBottom: 5 }}>
                            <Text>{msg.id_expediteur === user?.id ? "Vous" : "Autre"}: {msg.contenu}</Text>
                            <Text style={{ fontSize: 10, color: "#888" }}>{msg.date_envoi}</Text>
                        </View>
                    ))}

                    {/* Champ de saisie pour le message */}
                    <TextInput
                        placeholder="Écrire un message..."
                        value={newMessage}
                        onChangeText={setNewMessage}
                        style={{
                            borderWidth: 1,
                            borderColor: "#ccc",
                            padding: 10,
                            marginVertical: 10,
                        }}
                    />
                    <Button title="Envoyer" onPress={sendMessage} />
                </View>
            ) : (
                <Text>Aucune conversation sélectionnée.</Text>
            )}
        </View>
    );
};

export default MessengerScreen;