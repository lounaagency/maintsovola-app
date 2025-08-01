// Types unifiés pour la messagerie


export interface Participant {
  id: string;
  name: string;
  avatar: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  isDelivered: boolean;
  type: MessageType;
  attachments?: { id: string; type: 'file'; url: string; name: string; size: number; mimeType: string }[];
  reactions?: any[];
}


export interface Conversation {
  id: string;
  participants: Participant[];
  lastMessage: Message;
  unreadCount: number;
  isArchived: boolean;
  isMuted: boolean;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

export interface DatabaseUser {
  id_utilisateur: string;
  nom: string;
  prenoms: string;
  photo_profil?: string;
  email?: string;
}
// 

export interface User {
  id: string;
  email: string;
  nom?: string;
  prenom?: string;
  name?: string; // Nom complet pour l'affichage
  avatar?: string;
}

export interface Participant {
  id: string;
  name: string;
  avatar: string;
  isOnline?: boolean;
}

export interface MessageAttachment {
  id: string;
  type: 'image' | 'file' | 'audio' | 'video';
  url: string;
  name: string;
  size: number;
  mimeType: string;
  thumbnailUrl?: string;
}

export interface MessageReaction {
  id: string;
  userId: string;
  emoji: string;
  timestamp: string;
}

// export interface Message {
//   id: string;
//   conversationId: string;
//   senderId: string;
//   receiverId?: string;
//   content: string;
//   timestamp: string;
//   type: MessageType;
//   attachments?: MessageAttachment[];
//   reactions?: MessageReaction[];
//   isRead: boolean;
//   isDelivered: boolean;
//   isEdited?: boolean;
//   editedAt?: string;
//   replyTo?: string; // ID du message auquel on répond
// }

export interface Conversation {
  id: string;
  participants: Participant[];
  lastMessage: Message;
  unreadCount: number;
  isArchived: boolean;
  isMuted: boolean;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

export interface ComposerState {
  text: string;
  attachments: MessageAttachment[];
  isRecording: boolean;
  recordingDuration: number;
  replyTo?: Message;
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
  FILE = 'file',
  SYSTEM = 'system',
  EMOJI = 'emoji'
}

// Emojis populaires pour les réactions
export const popularEmojis = ['👍', '❤️', '😂', '😮', '😢', '😡', '👏', '🔥', '💯', '🎉'];