import { useState, useCallback } from 'react';
import { useSocketEvent } from './useSocket';

export const usePresence = () => {
  const [onlineUsers, setOnlineUsers] = useState<{ [userId: string]: boolean }>({});

  const handleUserOnline = useCallback((data: { userId: string }) => {
    setOnlineUsers((prev) => ({ ...prev, [data.userId]: true }));
  }, []);

  const handleUserOffline = useCallback((data: { userId: string }) => {
    setOnlineUsers((prev) => ({ ...prev, [data.userId]: false }));
  }, []);

  useSocketEvent<{ userId: string }>('user_online', handleUserOnline);
  useSocketEvent<{ userId: string }>('user_offline', handleUserOffline);

  const setInitialPresence = useCallback((users: { id: string; isActive: boolean }[]) => {
    const map: { [userId: string]: boolean } = {};
    users.forEach((u) => {
      map[u.id] = u.isActive;
    });
    setOnlineUsers(map);
  }, []);

  const isOnline = useCallback(
    (userId: string) => {
      return !!onlineUsers[userId];
    },
    [onlineUsers]
  );

  return {
    onlineUsers,
    setInitialPresence,
    isOnline,
  };
};
