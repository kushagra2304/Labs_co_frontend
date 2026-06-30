import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface ChatSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const ChatSocketContext = createContext<ChatSocketContextType>({
  socket: null,
  isConnected: false,
});

export const useChatSocket = () => useContext(ChatSocketContext);

export const ChatSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

    const token = localStorage.getItem('token') || '';
    const params = new URLSearchParams(window.location.search);
    const storedUser = localStorage.getItem("user");
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
    const userId = params.get('userId') || parsedUser?.id || '11111111-1111-1111-1111-111111111111';

    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      query: { userId, token },
      auth: { userId, token },
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('⚡ Socket connected:', newSocket.id);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('🔌 Socket disconnected');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <ChatSocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </ChatSocketContext.Provider>
  );
};
