import axios from 'axios';
import { User, Conversation, Message, MessageReaction } from '../types/chat.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1/chat';

const params = new URLSearchParams(window.location.search);
const userId = params.get('userId') || '11111111-1111-1111-1111-111111111111';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-User-Id': userId,
  },
});

export const chatApiService = {
  getEmployees: async (): Promise<User[]> => {
    const response = await apiClient.get<{ success: boolean; data: User[] }>('/employees');
    return response.data.data;
  },

  getConversations: async (page = 1, limit = 20): Promise<Conversation[]> => {
    const response = await apiClient.get<{ success: boolean; data: Conversation[] }>('/conversations', {
      params: { page, limit },
    });
    return response.data.data;
  },

  createDirectConversation: async (targetUserId: string): Promise<Conversation> => {
    const response = await apiClient.post<{ success: boolean; data: Conversation }>('/conversations', {
      type: 'DIRECT',
      targetUserId,
    });
    return response.data.data;
  },

  createGroupConversation: async (title: string, memberUserIds: string[]): Promise<Conversation> => {
    const response = await apiClient.post<{ success: boolean; data: Conversation }>('/conversations', {
      type: 'GROUP',
      title,
      memberUserIds,
    });
    return response.data.data;
  },

  getConversationMessages: async (conversationId: string, page = 1, limit = 50): Promise<Message[]> => {
    const response = await apiClient.get<{ success: boolean; data: Message[] }>(
      `/conversations/${conversationId}/messages`,
      { params: { page, limit } }
    );
    return response.data.data;
  },

  editMessage: async (messageId: string, content: string): Promise<Message> => {
    const response = await apiClient.patch<{ success: boolean; data: Message }>(`/messages/${messageId}`, {
      content,
    });
    return response.data.data;
  },

  deleteMessage: async (messageId: string): Promise<Message> => {
    const response = await apiClient.delete<{ success: boolean; data: Message }>(`/messages/${messageId}`);
    return response.data.data;
  },

  addReaction: async (messageId: string, emoji: string): Promise<MessageReaction> => {
    const response = await apiClient.post<{ success: boolean; data: MessageReaction }>(
      `/messages/${messageId}/reactions`,
      { emoji }
    );
    return response.data.data;
  },

  deleteReaction: async (messageId: string, reactionId: string): Promise<MessageReaction> => {
    const response = await apiClient.delete<{ success: boolean; data: MessageReaction }>(
      `/messages/${messageId}/reactions/${reactionId}`
    );
    return response.data.data;
  },

  uploadMedia: async (file: File): Promise<{
    fileName: string;
    fileType: string;
    fileSizeBytes: string;
    r2ObjectKey: string;
    cdnUrl: string;
  }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<{
      success: boolean;
      data: {
        fileName: string;
        fileType: string;
        fileSizeBytes: string;
        r2ObjectKey: string;
        cdnUrl: string;
      };
    }>('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },
};
