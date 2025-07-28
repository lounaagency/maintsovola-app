// Types de base existants
export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  type?: MessageType;
  attachments?: MessageAttachment[];
  reactions?: MessageReaction[];
}

// Nouveaux types pour les fonctionnalités avancées
export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  AUDIO = 'audio',
  VIDEO = 'video'
}

export interface MessageAttachment {
  id: string;
  type: 'image' | 'file' | 'audio' | 'video';
  url: string;
  name: string;
  size?: number;
  mimeType?: string;
  thumbnail?: string;
}

export interface MessageReaction {
  id: string;
  userId: string;
  emoji: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  participants: { id: string; name: string; avatar: string }[];
  lastMessage: Message;
  unreadCount: number;
  messages: Message[];
  isTyping?: boolean;
  lastSeen?: string;
}

// Types pour les fonctionnalités de composition
export interface ComposerState {
  text: string;
  attachments: MessageAttachment[];
  isRecording: boolean;
  recordingDuration: number;
}

// Types pour les paramètres
export interface ChatSettings {
  notifications: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  readReceipts: boolean;
  typingIndicators: boolean;
  theme: 'light' | 'dark' | 'auto';
}

// Données statiques pour les messages
export const staticMessages: Message[] = [
  {
    id: "msg1",
    senderId: "user1",
    senderName: "Jean Dupont",
    content: "Salut, comment vas-tu ?",
    timestamp: "2025-07-28T10:00:00Z",
    isRead: true,
    type: MessageType.TEXT,
  },
  {
    id: "msg2",
    senderId: "user2",
    senderName: "Marie Curie",
    content: "Je vais bien, merci ! Et toi ?",
    timestamp: "2025-07-28T10:05:00Z",
    isRead: true,
    type: MessageType.TEXT,
  },
  {
    id: "msg3",
    senderId: "user1",
    senderName: "Jean Dupont",
    content: "Super ! Je voulais te parler du projet Maintso Vola.",
    timestamp: "2025-07-28T10:10:00Z",
    isRead: false,
    type: MessageType.TEXT,
  },
  {
    id: "msg4",
    senderId: "user3",
    senderName: "Admin",
    content: "Votre terrain a été validé avec succès.",
    timestamp: "2025-07-28T09:30:00Z",
    isRead: false,
    type: MessageType.TEXT,
  },
  {
    id: "msg5",
    senderId: "user4",
    senderName: "Sophie Martin",
    content: "Bonjour, j'ai une question concernant l'application.",
    timestamp: "2025-07-27T15:45:00Z",
    isRead: true,
    type: MessageType.TEXT,
  },
];

// Données statiques pour les conversations
export const staticConversations: Conversation[] = [
  {
    id: "conv1",
    participants: [
      { id: "user1", name: "Jean Dupont", avatar: "https://randomuser.me/api/portraits/men/1.jpg" },
      { id: "user_current", name: "Moi", avatar: "https://randomuser.me/api/portraits/men/9.jpg" },
    ],
    lastMessage: staticMessages[2],
    unreadCount: 1,
    messages: [
      staticMessages[0],
      staticMessages[1],
      staticMessages[2],
    ],
  },
  {
    id: "conv2",
    participants: [
      { id: "user3", name: "Admin", avatar: "https://randomuser.me/api/portraits/men/2.jpg" },
      { id: "user_current", name: "Moi", avatar: "https://randomuser.me/api/portraits/men/9.jpg" },
    ],
    lastMessage: staticMessages[3],
    unreadCount: 1,
    messages: [
      staticMessages[3],
    ],
  },
  {
    id: "conv3",
    participants: [
      { id: "user4", name: "Sophie Martin", avatar: "https://randomuser.me/api/portraits/women/3.jpg" },
      { id: "user_current", name: "Moi", avatar: "https://randomuser.me/api/portraits/men/9.jpg" },
    ],
    lastMessage: staticMessages[4],
    unreadCount: 0,
    messages: [
      staticMessages[4],
    ],
  },
];

// Emojis populaires pour les réactions
export const popularEmojis = ['👍', '❤️', '😂', '😮', '😢', '😡'];

// Paramètres par défaut
export const defaultChatSettings: ChatSettings = {
  notifications: true,
  soundEnabled: true,
  vibrationEnabled: true,
  readReceipts: true,
  typingIndicators: true,
  theme: 'auto',
};

interface Contact {
  id: string;
  name: string;
  avatar: string;
};