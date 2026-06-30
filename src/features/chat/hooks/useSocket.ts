import { useEffect } from 'react';
import { useChatSocket } from '../context/ChatSocketContext';

export const useSocket = () => {
  const { socket, isConnected } = useChatSocket();
  return { socket, isConnected };
};

export const useSocketEvent = <T>(event: string, callback: (data: T) => void) => {
  const { socket } = useChatSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on(event, callback);

    return () => {
      socket.off(event, callback);
    };
  }, [socket, event, callback]);
};
