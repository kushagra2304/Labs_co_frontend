export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: string;
  isActive: boolean;
  lastSeen: string;
}

export interface ConversationMember {
  id: string;
  conversationId: string;
  userId: string;
  lastReadAt: string;
  joinedAt: string;
  user?: User;
}

export type ConversationType = 'DIRECT' | 'GROUP';
export type ConversationStatus = 'ACTIVE' | 'ARCHIVED' | 'CLOSED';

export interface Conversation {
  id: string;
  type: ConversationType;
  title: string | null;
  status: ConversationStatus;
  lastMessageAt: string;
  members: ConversationMember[];
}

export type MessageType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'AUDIO';
export type MessageStatus = 'SENT' | 'DELIVERED' | 'READ';

export interface MessageAttachment {
  id: string;
  messageId: string;
  fileName: string;
  fileType: string;
  fileSizeBytes: string;
  r2ObjectKey: string;
  cdnUrl: string;
  r2HardDeleted: boolean;
  r2DeletedAt: string | null;
}

export interface MessageReaction {
  id: string;
  messageId: string;
  userId: string;
  emoji: string;
  user?: User;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string | null;
  messageType: MessageType;
  status: MessageStatus;
  replyToId: string | null;
  createdAt: string;
  sender?: User;
  attachments?: MessageAttachment[];
  reactions?: MessageReaction[];
  replyTo?: Message | null;
}
