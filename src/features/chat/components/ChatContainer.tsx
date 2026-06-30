import React, { useState, useEffect, useRef } from 'react';
import { ChatSocketProvider } from '../context/ChatSocketContext';
import { EmployeeListSidebar } from './EmployeeListSidebar';
import { ConversationWindow } from './ConversationWindow';
import { Conversation } from '../types/chat.types';
import { usePresence } from '../hooks/usePresence';
import { chatApiService } from '../services/chat.api.service';
import { useSocket, useSocketEvent } from '../hooks/useSocket';
import './chat.css';

const getUserId = () => {
  const params = new URLSearchParams(window.location.search);
  const storedUser = localStorage.getItem("user");
  const parsedUser = storedUser ? JSON.parse(storedUser) : null;
  return params.get('userId') || parsedUser?.id || '11111111-1111-1111-1111-111111111111';
};

const playNotificationSound = () => {
  try {
    const context = new (window.AudioContext || (window as any).webkitAudioContext)();
    const playTone = (freq: number, startTime: number, duration: number) => {
      const osc = context.createOscillator();
      const gain = context.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      
      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      
      osc.connect(gain);
      gain.connect(context.destination);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = context.currentTime;
    playTone(587.33, now, 0.12); // D5
    playTone(880.00, now + 0.10, 0.20); // A5
  } catch (err) {
    console.error('Failed to play notification sound:', err);
  }
};

const ChatContent: React.FC = () => {
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const { onlineUsers, setInitialPresence } = usePresence();
  const [unreadCounts, setUnreadCounts] = useState<{ [userId: string]: number }>({});
  
  const activeConversationRef = useRef(activeConversation);
  useEffect(() => {
    activeConversationRef.current = activeConversation;
  }, [activeConversation]);

  useEffect(() => {
    const initPresence = async () => {
      try {
        const employees = await chatApiService.getChatUsers();
        // Remove current user dynamically
        const currentId = getUserId();
        setInitialPresence(employees.filter(e => e.id !== currentId));
      } catch (err) {
        console.error('Failed to load initial presence mapping:', err);
      }
    };
    initPresence();
  }, [setInitialPresence]);

  useSocketEvent<{ message: any; conversationId: string }>('new_message', (data) => {
    const currentId = getUserId();
    // Only trigger unread counts and sound notifications if message is from another user
    if (data.message.senderId !== currentId) {
      const activeConv = activeConversationRef.current;
      const isChattingWithSender = activeConv?.members.some(m => m.userId === data.message.senderId);
      
      if (!isChattingWithSender) {
        setUnreadCounts((prev) => ({
          ...prev,
          [data.message.senderId]: (prev[data.message.senderId] || 0) + 1,
        }));
      }
      playNotificationSound();
    }
  });

  const handleSelectConversation = (conversation: Conversation) => {
    setActiveConversation(conversation);
    const currentId = getUserId();
    const otherMember = conversation.members.find(m => m.userId !== currentId);
    if (otherMember) {
      setUnreadCounts((prev) => ({
        ...prev,
        [otherMember.userId]: 0,
      }));
    }
  };

  const activeUserId = activeConversation?.members.find(m => m.userId !== getUserId())?.userId || null;

  return (
    <div className="chat-module-container">
      <div className="chat-glow-orb-1" />
      <div className="chat-glow-orb-2" />

      <EmployeeListSidebar
        onSelectConversation={handleSelectConversation}
        activeConversationId={activeConversation?.id || null}
        activeUserId={activeUserId}
        onlineUsersMap={onlineUsers}
        unreadCounts={unreadCounts}
      />

      <ConversationWindow
        conversation={activeConversation}
        currentUserId={getUserId()}
      />
    </div>
  );
};

export const ChatContainer: React.FC = () => {
  return (
    <ChatSocketProvider>
      <ChatContent />
    </ChatSocketProvider>
  );
};
