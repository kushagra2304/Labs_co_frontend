import { useState, useEffect, useCallback } from 'react';
import { Message, MessageReaction } from '../types/chat.types';
import { chatApiService } from '../services/chat.api.service';
import { useSocket, useSocketEvent } from './useSocket';

export const useConversation = (conversationId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const { socket } = useSocket();

  const currentUserId = (() => {
    const params = new URLSearchParams(window.location.search);
    const storedUser = localStorage.getItem("user");
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
    return params.get('userId') || parsedUser?.id || '11111111-1111-1111-1111-111111111111';
  })();

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

  // When a conversation is opened: load messages AND tell the server to mark
  // all unread messages as READ so the senders' tick icons update in real time.
  useEffect(() => {
    setMessages([]);
    setPage(1);
    setHasMore(true);
    if (conversationId) {
      loadMessages(conversationId, 1);
    }
  }, [conversationId, loadMessages]);

  // Emit conversation_read after messages are loaded so the backend can
  // bulk-mark them READ and notify each sender via read_receipt.
  useEffect(() => {
    if (!conversationId || !socket) return;
    socket.emit('conversation_read', { conversationId });
  }, [conversationId, socket]);

  // Join the conversation socket room when opened, and leave when closed/changed
  useEffect(() => {
    if (!conversationId || !socket) return;

    socket.emit('join_room', { conversationId });

    return () => {
      socket.emit('leave_room', { conversationId });
    };
  }, [conversationId, socket]);


  const loadMore = useCallback(() => {
    if (!loading && hasMore && conversationId) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadMessages(conversationId, nextPage);
    }
  }, [loading, hasMore, conversationId, page, loadMessages]);

  // ─── Incoming message from another user ─────────────────────────────────────
  const handleNewMessage = useCallback(
    (data: { message: Message; conversationId: string; tempId?: string }) => {
      if (data.conversationId === conversationId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.message.id)) return prev;

          if (data.tempId && prev.some((m) => m.id === data.tempId)) {
            return prev.map((m) => (m.id === data.tempId ? data.message : m));
          }

          return [data.message, ...prev];
        });

        // Tell the server we received and are reading this message
        // ONLY if the message was sent by another user!
        if (socket && data.message.senderId !== currentUserId) {
          socket.emit('message_read', {
            messageId: data.message.id,
            conversationId,
          });
        }
      }
    },

    [conversationId, socket]
  );

  // ─── Sender's own message was delivered (recipient is online) ───────────────
  const handleMessageDelivered = useCallback(
    (data: { messageId: string; conversationId: string }) => {
      if (data.conversationId !== conversationId) return;
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === data.messageId && msg.status === 'SENT') {
            return { ...msg, status: 'DELIVERED' };
          }
          return msg;
        })
      );
    },
    [conversationId]
  );

  // ─── A single message was read by a recipient ────────────────────────────────
  const handleReadReceipt = useCallback(
    (data: { messageId: string; userId: string; conversationId: string }) => {
      if (data.conversationId && data.conversationId !== conversationId) return;
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === data.messageId) {
            return { ...msg, status: 'READ' };
          }
          return msg;
        })
      );
    },
    [conversationId]
  );

  // ─── Multiple messages were bulk-read when recipient opened the conversation ─
  const handleMessagesReadBulk = useCallback(
    (data: { messageIds: string[]; conversationId: string; readByUserId: string }) => {
      if (data.conversationId !== conversationId) return;
      const idSet = new Set(data.messageIds);
      setMessages((prev) =>
        prev.map((msg) => {
          if (idSet.has(msg.id)) {
            return { ...msg, status: 'READ' };
          }
          return msg;
        })
      );
    },
    [conversationId]
  );

  const handleReactionAddedSocket = useCallback(
    (data: { messageId: string; reaction: MessageReaction; conversationId: string }) => {
      if (data.conversationId !== conversationId) return;
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === data.messageId) {
            const currentReactions = msg.reactions || [];
            if (currentReactions.some((r) => r.id === data.reaction.id || (r.userId === data.reaction.userId && r.emoji === data.reaction.emoji))) return msg;
            return { ...msg, reactions: [...currentReactions, data.reaction] };
          }
          return msg;
        })
      );
    },
    [conversationId]
  );

  const handleReactionRemovedSocket = useCallback(
    (data: { messageId: string; reactionId: string; conversationId: string }) => {
      if (data.conversationId !== conversationId) return;
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === data.messageId) {
            const currentReactions = msg.reactions || [];
            return { ...msg, reactions: currentReactions.filter((r) => r.id !== data.reactionId) };
          }
          return msg;
        })
      );
    },
    [conversationId]
  );

  useSocketEvent<{ message: Message; conversationId: string; tempId?: string }>('new_message', handleNewMessage);
  useSocketEvent<{ messageId: string; conversationId: string }>('message_delivered', handleMessageDelivered);
  useSocketEvent<{ messageId: string; userId: string; conversationId: string }>('read_receipt', handleReadReceipt);
  useSocketEvent<{ messageIds: string[]; conversationId: string; readByUserId: string }>('messages_read_bulk', handleMessagesReadBulk);
  useSocketEvent<{ messageId: string; reaction: MessageReaction; conversationId: string }>('reaction_added', handleReactionAddedSocket);
  useSocketEvent<{ messageId: string; reactionId: string; conversationId: string }>('reaction_removed', handleReactionRemovedSocket);


  // ─── Send a new message ──────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (content?: string, type: any = 'TEXT', replyToId?: string | null, attachments?: any[]) => {
      if (!conversationId || !socket) return;

      const tempId = `temp-${Date.now()}`;

      const mockMsg: Message = {
        id: tempId,
        conversationId,
        senderId: (() => {
          const params = new URLSearchParams(window.location.search);
          const storedUser = localStorage.getItem("user");
          const parsedUser = storedUser ? JSON.parse(storedUser) : null;
          return params.get('userId') || parsedUser?.id || '11111111-1111-1111-1111-111111111111';
        })(),
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

  // ─── ACK from server: temp message confirmed with real ID ────────────────────
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
