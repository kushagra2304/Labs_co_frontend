import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket, useSocketEvent } from './useSocket';

export const useTypingIndicator = (conversationId: string | null) => {
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const typingTimeoutsRef = useRef<{ [userId: string]: NodeJS.Timeout }>({});
  const lastEmitRef = useRef<number>(0);
  const { socket } = useSocket();

  useEffect(() => {
    const timeouts = typingTimeoutsRef.current;
    return () => {
      Object.values(timeouts).forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    setTypingUsers([]);
    Object.values(typingTimeoutsRef.current).forEach(clearTimeout);
    typingTimeoutsRef.current = {};
  }, [conversationId]);

  const handleUserTyping = useCallback(
    (data: { userId: string; conversationId: string }) => {
      if (data.conversationId !== conversationId) return;

      const { userId } = data;

      setTypingUsers((prev) => {
        if (prev.includes(userId)) return prev;
        return [...prev, userId];
      });

      if (typingTimeoutsRef.current[userId]) {
        clearTimeout(typingTimeoutsRef.current[userId]);
      }

      typingTimeoutsRef.current[userId] = setTimeout(() => {
        setTypingUsers((prev) => prev.filter((id) => id !== userId));
        delete typingTimeoutsRef.current[userId];
      }, 3500);
    },
    [conversationId]
  );

  const handleUserStoppedTyping = useCallback(
    (data: { userId: string; conversationId: string }) => {
      if (data.conversationId !== conversationId) return;

      const { userId } = data;
      setTypingUsers((prev) => prev.filter((id) => id !== userId));

      if (typingTimeoutsRef.current[userId]) {
        clearTimeout(typingTimeoutsRef.current[userId]);
        delete typingTimeoutsRef.current[userId];
      }
    },
    [conversationId]
  );

  useSocketEvent<{ userId: string; conversationId: string }>('user_typing', handleUserTyping);
  useSocketEvent<{ userId: string; conversationId: string }>('user_stopped_typing', handleUserStoppedTyping);

  const emitTyping = useCallback(() => {
    if (!socket || !conversationId) return;

    const now = Date.now();
    if (now - lastEmitRef.current > 2000) {
      socket.emit('typing_start', { conversationId });
      lastEmitRef.current = now;
    }
  }, [conversationId, socket]);

  const emitStoppedTyping = useCallback(() => {
    if (!socket || !conversationId) return;
    socket.emit('typing_stop', { conversationId });
    lastEmitRef.current = 0;
  }, [conversationId, socket]);

  return {
    typingUsers,
    emitTyping,
    emitStoppedTyping,
  };
};
