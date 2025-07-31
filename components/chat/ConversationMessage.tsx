"use client";
import React, {
    useCallback,
    useEffect, 
    useState, 
} from 'react';
import { useAuth } from '~/contexts/AuthContext';
import { 
    View ,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { getAllUsers, getConversation, setNewConversation, subscribeToConversations } from '~/services/conversation-message-service';
import { 
    Conversation,
    Utilisateur, 
} from '~/type/messageInterface';
import RenderConversation from './RenderItem';
import { router } from 'expo-router';
import RenderUsers from './RenderUsers';
import Modal from 'react-native-modal';
import { LucideX } from 'lucide-react-native';
import { supabase } from '~/lib/data';
import SearchBar from './SearchBar';
import FloatingActionButton from './FloatingActionButton';

const { height: screenHeight } = Dimensions.get('window');

const ConversationMessage = () => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [everyone, setEveryone] = useState<Utilisateur[]>([]);
    const [search, setSearch] = useState('');
    const [searchUsers, setSearchUsers] = useState('');
    const [filteredUsers, setFilteredUsers] = useState<Utilisateur[]>([]);
    const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
    const [isUserModalVisible, setUserModalVisible] = useState(false);

    // États de loading
    const [isLoadingConversations, setIsLoadingConversations] = useState(true);
    const [isLoadingUsers, setIsLoadingUsers] = useState(true);

    const { user } = useAuth();
    const userId: string = user?.id || '';

    const fetchConversations = useCallback(async () => {
        if (!userId) return;
        setIsLoadingConversations(true);
        try {
            const conversations = await getConversation({ id_user: userId });
            setConversations(conversations);
        } catch (error) {
            console.error("Error fetching conversations:", error);
        } finally {
            setIsLoadingConversations(false);
        }
    }, [userId]);

    const fetchEveryOne = useCallback(async () => {
        if (!userId) return;
        setIsLoadingUsers(true);
        try {
            const allUsers = await getAllUsers({currentUserId: userId});
            setEveryone(allUsers);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setIsLoadingUsers(false);
        }
    }, [userId]);

    // Initialisation des données
    useEffect(() => {
        fetchConversations();
        fetchEveryOne();
    }, [fetchConversations, fetchEveryOne]);
    
    // Mise à jour des listes filtrées - séparée de l'effet précédent
    useEffect(() => {
        setFilteredConversations(conversations);
    }, [conversations]);

    useEffect(() => {
        setFilteredUsers(everyone);
    }, [everyone]);
    
    const handleSearch = useCallback((text: string) => {
        setSearch(text);
    
        if (!text.trim()) {
            setFilteredConversations(conversations);
            return;
        }
    
        const lowerText = text.toLowerCase();
        const filtered = conversations.filter((conv) => {
            const otherUserId = conv.id_utilisateur1 === userId
                ? conv.id_utilisateur2
                : conv.id_utilisateur1;
    
            const user = everyone.find(u => u.id_utilisateur === otherUserId);
            if (!user) return false;
    
            return (
                user.nom?.toLowerCase().includes(lowerText) ||
                user.prenoms?.toLowerCase().includes(lowerText) ||
                user.email?.toLowerCase().includes(lowerText)
            );
        });
    
        setFilteredConversations(filtered);
    }, [conversations, everyone, userId]);

    const handleSearchUsers = useCallback((text: string) => {
        setSearchUsers(text);
        if (!text.trim()) {
            setFilteredUsers(everyone);
            return;
        }
        const lowerText = text.toLowerCase();
        const filtered = everyone.filter((user) => {
            return (
                user.nom?.toLowerCase().includes(lowerText) ||
                user.prenoms?.toLowerCase().includes(lowerText) ||
                user.email?.toLowerCase().includes(lowerText)
            );
        });
        setFilteredUsers(filtered);
    }, [everyone]);

    // Subscription aux nouvelles conversations
    useEffect(() => {
        if (!userId) return;
      
        const subscription = subscribeToConversations(userId, (newConv) => {
            setConversations((prev) => [newConv, ...prev]);
        });
      
        return () => {
            supabase.removeChannel(subscription);
        };
    }, [userId]);

    const createConversation = async (otherUserId: string, currentUserId: string) => {
        try {
            const new_id_conversation = await setNewConversation({ currentUserId, otherUserId });
            if (!new_id_conversation) {
                console.warn("No conversation ID returned.");
                return;
            }
            console.log("Creating conversation with otherUserId:", otherUserId, "and currentUserId:", currentUserId);
            router.push(`/messages/chat/${new_id_conversation}`);
        } catch (error) {
            console.error("Error fetching conversation:", error);
        }
    };

    const navigateToChat = (conversation: Conversation) => {
        console.log("Navigating to chat with conversation:", conversation);
        router.push(`/messages/chat/${conversation.id_conversation}`);
    };

    // Composant de chargement
    const LoadingComponent = () => (
        <View className="flex-1 justify-center items-center py-20">
            <ActivityIndicator size="large" color="#25D366" />
            <Text className="text-gray-500 mt-4 text-base">
                Chargement des conversations...
            </Text>
        </View>
    );

    // Composant pour état vide
    const EmptyComponent = () => (
        <View className="flex-1 justify-center items-center py-20">
            <Text className="text-gray-500 text-lg font-medium mb-2">
                Aucune conversation
            </Text>
            <Text className="text-gray-400 text-center px-8">
                Commencez une nouvelle conversation en appuyant sur le bouton +
            </Text>
        </View>
    );
      
    return (
        <View style={{ flex: 1, minHeight: screenHeight - 200 }}>
            {/* Section Search */}
            <View className="mb-4">
                <SearchBar search={search} handleSearch={handleSearch} />
            </View>

            {/* Modal pour sélectionner un utilisateur */}
            <Modal
                isVisible={isUserModalVisible}
                onBackdropPress={() => setUserModalVisible(false)}
                onBackButtonPress={() => setUserModalVisible(false)}
                style={{ justifyContent: 'flex-end', margin: 0 }}
            >
                <View className="bg-white rounded-t-2xl p-4 max-h-[70%]">
                    {/* Header avec titre et bouton fermer alignés */}
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-lg font-semibold text-gray-900">
                            Nouveau message
                        </Text>
                        <TouchableOpacity 
                            onPress={() => setUserModalVisible(false)}
                            className="p-2 -mr-2"
                        >
                            <LucideX size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    {/* Barre de recherche */}
                    <View className="mb-4">
                       <TextInput
                           className="bg-gray-100 rounded-xl px-4 py-3 text-base"
                           placeholder="Rechercher un contact..."
                           value={searchUsers}
                           onChangeText={handleSearchUsers}
                       />
                    </View>

                    {/* Liste des utilisateurs */}
                    {isLoadingUsers ? (
                        <View className="flex-1 justify-center items-center py-10">
                            <ActivityIndicator size="large" color="#25D366" />
                            <Text className="text-gray-500 mt-2">Chargement des utilisateurs...</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={filteredUsers}
                            keyExtractor={(item) => item.id_utilisateur}
                            renderItem={({ item }) => (
                                <RenderUsers 
                                    item={item} 
                                    onPress={async (user) => {
                                        setUserModalVisible(false);
                                        await createConversation(user.id_utilisateur, userId);
                                    }}
                                />
                            )}
                            ListEmptyComponent={() => (
                                <View className="py-10 items-center">
                                    <Text className="text-gray-500">Aucun utilisateur trouvé</Text>
                                </View>
                            )}
                            showsVerticalScrollIndicator={false}
                        />
                    )}
                </View>
            </Modal>

            {/* Section Conversations */}
            <View className="flex-1">
                {isLoadingConversations ? (
                    <LoadingComponent />
                ) : (
                    <FlatList
                        data={filteredConversations}
                        keyExtractor={(item) => item.id_conversation.toString()}
                        renderItem={({ item }) => (
                            <RenderConversation 
                                item={item} 
                                onPress={(conv) => navigateToChat(conv)}
                            />
                        )}
                        ListEmptyComponent={<EmptyComponent />}
                        contentContainerStyle={{ 
                            flexGrow: 1,
                        }}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>

            {/* Bouton flottant */}
            <FloatingActionButton 
                onPress={() => setUserModalVisible(true)}
            />
        </View>
    );
};

export default ConversationMessage;