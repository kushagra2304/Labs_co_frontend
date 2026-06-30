import { useState, useEffect, useCallback } from 'react';
import { Message } from '../types/chat.types';
import { chatApiService } from '../services/chat.api.service';
import { useSocket, useSocketEvent } from './useSocket';

export const useConversation = (conversationId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const { socket } = useSocket();

  const loadMessages = useCallback(async (id: string, pageNum: number) => {
    setLoading(true);
    try {
      const data = await chatApiService.getConversationMessages(id, pageNum);
      if (data.length < 50) {
        setHasMore(false);
      }
      setMessages((prev) => (pageNum === 1 ? data : [...prev, ...data]));
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setMessages([]);
    setPage(1);
    setHasMore(true);
    if (conversationId) {
      loadMessages(conversationId, 1);
    }
  }, [conversationId, loadMessages]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore && conversationId) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadMessages(conversationId, nextPage);
    }
  }, [loading, hasMore, conversationId, page, loadMessages]);

  const handleNewMessage = useCallback(
    (data: { message: Message; conversationId: string }) => {
      if (data.conversationId === conversationId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.message.id)) return prev;
          return [data.message, ...prev];
        });

        if (socket) {
          socket.emit('message_read', {
            messageId: data.message.id,
            conversationId,
          });
        }
      }
    },
    [conversationId, socket]
  );

  const handleReadReceipt = useCallback(
    (data: { messageId: string; userId: string }) => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === data.messageId) {
            return { ...msg, status: 'READ' };
          }
          return msg;
        })
      );
    },
    []
  );

  useSocketEvent<{ message: Message; conversationId: string }>('new_message', handleNewMessage);
  useSocketEvent<{ messageId: string; userId: string }>('read_receipt', handleReadReceipt);

  const sendMessage = useCallback(
    async (content?: string, type: any = 'TEXT', replyToId?: string | null, attachments?: any[]) => {
      if (!conversationId || !socket) return;

      const tempId = `temp-${Date.now()}`;

      const mockMsg: Message = {
        id: tempId,
        conversationId,
        senderId: '11111111-1111-1111-1111-111111111111',
        content: content || null,
        messageType: type,
        status: 'SENT',
        replyToId: replyToId || null,
        createdAt: new Date().toISOString(),
        attachments: attachments || [],
      };

      setMessages((prev) => [mockMsg, ...prev]);

      socket.emit('send_message', {
        conversationId,
        content,
        type,
        replyToId,
        tempId,
      });
    },
    [conversationId, socket]
  );

  const handleMessageAck = useCallback(
    (data: { tempId: string; messageId: string; status: string }) => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === data.tempId) {
            return { ...msg, id: data.messageId, status: data.status as any };
          }
          return msg;
        })
      );
    },
    []
  );

  useSocketEvent<{ tempId: string; messageId: string; status: string }>('message_ack', handleMessageAck);

  return {
    messages,
    loading,
    hasMore,
    loadMore,
    sendMessage,
    setMessages,
  };
};
