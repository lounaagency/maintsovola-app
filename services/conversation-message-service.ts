import { supabase } from "~/lib/data";
import { Conversation, Message, Utilisateur } from "~/type/messageInterface";
import { decode } from 'base64-arraybuffer';

export async function getConversation({ id_user }: { id_user: string }): Promise<Conversation[]> {
    try {
        const { data, error } = await supabase
        .from("conversation")
        .select("*")
        .or(`id_utilisateur1.eq.${id_user}, id_utilisateur2.eq.${id_user}`)
        .order("derniere_activite", { ascending: false });
        
        if (error) {
            throw new Error(`Failed to get conversation: ${error.message}`);
        }
        
        // Retourner un tableau vide au lieu de lancer une erreur si aucune conversation
        if (!data || data.length === 0) {
            return [];
        }

        const conversations: Conversation[] = data.map((item: any) => ({
            id_conversation: item.id_conversation,
            id_utilisateur1: item.id_utilisateur1,
            id_utilisateur2: item.id_utilisateur2,
            derniere_activite: item.derniere_activite,
            created_at: item.created_at,
        }));

        return conversations;
    } catch (error) {
        console.error("Error fetching conversation:", error);
        throw error;
    }
}

export async function getMessages({ id_conversation }: { id_conversation: number }): Promise<Message[]> {
    try {
        const { data, error } = await supabase
        .from("message")
        .select("*")
        .eq("id_conversation", id_conversation)
        .order("created_at", { ascending: false });
        
        if (error) {
            throw new Error(`Failed to get messages: ${error.message}`);
        }
        
        // Retourner un tableau vide au lieu de lancer une erreur si aucun message
        if (!data || data.length === 0) {
            return [];
        }
        
        const messages: Message[] = data.map((item: any) => ({
            id_message: item.id_message,
            id_conversation: item.id_conversation,
            id_expediteur: item.id_expediteur,
            id_destinataire: item.id_destinataire,
            contenu: item.contenu,
            date_envoi: item.date_envoi,
            lu: item.lu,
            created_at: item.created_at,
            modified_at: item.modified_at,
            pieces_jointes: item.pieces_jointes || [],
        }));

        console.log("Fetched messages:", JSON.stringify(messages,null,2));

        return messages;

    } catch (error) {
        console.error("Error fetching messages:", error);
        throw error;
    }
}

// Fonction corrigée pour récupérer le dernier message
export async function getLastMessage(conversationId: number): Promise<string> {
  try {
    const messages = await getMessages({ id_conversation: conversationId });
    
    // Vérifier s'il y a des messages et retourner le premier (le plus récent)
    if (messages.length > 0) {
      return messages[0].contenu; // Index [0] pour le premier élément
    }
    
    return '';
  } catch (error) {
    console.error("Error getting last message:", error);
    return 'Erreur de chargement';
  }
}


export async function getUsername({ id }: { id: string }): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('utilisateur')
      .select('nom, prenoms')
      .eq('id_utilisateur', id)
      .single();

    if (error) {
      console.error(`❌ Supabase error in getUsername():`, error.message);
      throw new Error(`Failed to get username: ${error.message}`);
    }

    if (!data) {
      console.warn(`⚠️ No user found for id_utilisateur: ${id}`);
      throw new Error('No user found.');
    }

    return `${data.nom} ${data.prenoms}`;
  } catch (err) {
    console.error('❌ getUsername failed:', err);
    throw err;
  }
}

export async function getUser({ id }: { id: string }): Promise<{username: string, photo_profil: string}> {
  try {
    const { data, error } = await supabase
      .from('utilisateur')
      .select('nom, prenoms, email, photo_profil')
      .eq('id_utilisateur', id)
      .single();

    if (error) {
      console.error(`❌ Supabase error in getUsername():`, error.message);
      throw new Error(`Failed to get username: ${error.message}`);
    }

    if (!data) {
      console.warn(`⚠️ No user found for id_utilisateur: ${id}`);
      throw new Error('No user found.');
    }

    return {
      username:`${data.nom} ${data.prenoms}`,
      photo_profil: `${data?.photo_profil || ""}` 
    };
  } catch (err) {
    console.error('❌ getUsername failed:', err);
    throw err;
  }
}

export async function getConversationById({ id_conversation }: { id_conversation: number }): Promise<Conversation | null> {
  try {
    const { data, error } = await supabase
      .from('conversation')
      .select('*')
      .eq('id_conversation', id_conversation)
      .single();

    if (error) {
      console.error(`❌ Supabase error in getConversationById():`, error.message);
      throw new Error(`Failed to get conversation: ${error.message}`);
    }

    if (!data) {
      console.warn(`⚠️ No conversation found for id_conversation: ${id_conversation}`);
      return null;
    }

    return {
      id_conversation: data.id_conversation,
      id_utilisateur1: data.id_utilisateur1,
      id_utilisateur2: data.id_utilisateur2,
      derniere_activite: data.derniere_activite,
      created_at: data.created_at,
    };
  } catch (err) {
    console.error('❌ getConversationById failed:', err);
    throw err;
  }
}

export async function getAllUsers({currentUserId}: {currentUserId: string}): Promise<Utilisateur[]> {
    try {
        const { data, error } = await supabase
        .from("utilisateur")
        .select("id_utilisateur, nom, prenoms, photo_profil")
        .neq("id_utilisateur", currentUserId)
        .order("nom", { ascending: true });
        
        if (error) {
            throw new Error(`Failed to get users: ${error.message}`);
        }

        if (!data || data.length === 0) {
            return []; // Retourner un tableau vide au lieu de lancer une erreur
        }

        const utilisateurs: Utilisateur[] = data.map((item: any) => ({
            id_utilisateur: item.id_utilisateur,
            nom: item.nom,
            prenoms: item.prenoms,
            photo_profil: item.photo_profil,
        }));
        
        return utilisateurs;
    } catch (error) {
        console.error("Error fetching users:", error);
        throw error;
    }
}

export async function setNewConversation({
    currentUserId,
    otherUserId
}: {
    currentUserId: string;
    otherUserId: string;
}): Promise<number> {
    try {
        // Vérifier si une conversation existe déjà entre ces deux utilisateurs
        const { data: existingConv, error: checkError } = await supabase
        .from("conversation")
        .select("id_conversation")
        .or(`and(id_utilisateur1.eq.${currentUserId},id_utilisateur2.eq.${otherUserId}),and(id_utilisateur1.eq.${otherUserId},id_utilisateur2.eq.${currentUserId})`)
        .maybeSingle();

        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = pas de résultat trouvé
            throw new Error(`Failed to check existing conversation: ${checkError.message}`);
        }

        // Si une conversation existe déjà, retourner son ID
        if (existingConv) {
            console.log("Conversation exists, returning ID:", existingConv.id_conversation);
            return existingConv.id_conversation;
        }

        // Créer une nouvelle conversation
        const currentTime = new Date().toISOString();
        const { data, error } = await supabase
        .from("conversation")
        .insert({ 
            id_utilisateur1: currentUserId, 
            id_utilisateur2: otherUserId,
            derniere_activite: currentTime,
            created_at: currentTime,
        })
        .select("id_conversation")
        .single();
        
        if (error) {
            throw new Error(`Failed to create conversation: ${error.message}`);
        }

        if (!data) {
            throw new Error("No conversation data returned.");
        }
        
        console.log("New conversation created with ID:", data.id_conversation);
        return data.id_conversation;
        
    } catch (error) {
        console.error("Error creating/finding conversation:", error);
        throw error;
    }
}

// 🔁 S'abonner aux nouveaux messages d'une conversation
export function subscribeToMessages(
    id_conversation: number,
    callback: (message: Message) => void
  ) {
    return supabase
      .channel('messages-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'message',
          filter: `id_conversation=eq.${id_conversation}`,
        },
        (payload) => {
          const message = payload.new as Message;
          callback(message);
        }
      )
      .subscribe();
  }
  
  // 🔁 S'abonner aux nouvelles conversations de l'utilisateur
  export function subscribeToConversations(
    userId: string,
    callback: (conversation: Conversation) => void
  ) {
    return supabase
      .channel('conversations-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversation',
        },
        (payload) => {
          const conv = payload.new as Conversation;
          if (conv.id_utilisateur1 === userId || conv.id_utilisateur2 === userId) {
            callback(conv);
          }
        }
      )
      .subscribe();
  }
  

export async function uploadFile(uri: string, fileName: string, contentType: string) {
  const response = await fetch(uri);
  const blob = await response.blob();

  const { data, error } = await supabase.storage
    .from('pieces_jointes')
    .upload(fileName, blob, {
      contentType,
      upsert: true,
    });

  if (error) throw error;

  const { data: publicUrlData } = supabase.storage
    .from('pieces_jointes')
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
}

export async function sendMessage({
  id_conversation,
  id_expediteur,
  id_destinataire,
  contenu,
  files = []
}: {
  id_conversation: number;
  id_expediteur: string;
  id_destinataire: string;
  contenu: string;
  files?: string[];
}): Promise<Message> {
  const { data, error } = await supabase
    .from('message')
    .insert({
      id_conversation,
      id_expediteur,
      id_destinataire,
      contenu,
      date_envoi: new Date().toISOString(),
      lu: false,
      pieces_jointes: files,
    })
    .select('*')
    .single();

  if (error) throw new Error(error.message);

  return data as Message;
}
