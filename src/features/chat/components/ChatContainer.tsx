import React, { useState, useEffect } from 'react';
import { ChatSocketProvider } from '../context/ChatSocketContext';
import { EmployeeListSidebar } from './EmployeeListSidebar';
import { ConversationWindow } from './ConversationWindow';
import { Conversation } from '../types/chat.types';
import { usePresence } from '../hooks/usePresence';
import { chatApiService } from '../services/chat.api.service';
import './chat.css';

const getUserId = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('userId') || '11111111-1111-1111-1111-111111111111';
};

const ChatContent: React.FC = () => {
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const { onlineUsers, setInitialPresence } = usePresence();

  useEffect(() => {
    const initPresence = async () => {
      try {
        const employees = await chatApiService.getEmployees();
        // Remove current user dynamically
        const currentId = getUserId();
        setInitialPresence(employees.filter(e => e.id !== currentId));
      } catch (err) {
        console.error('Failed to load initial presence mapping:', err);
      }
    };
    initPresence();
  }, [setInitialPresence]);

  return (
    <div className="chat-module-container">
      <div className="chat-glow-orb-1" />
      <div className="chat-glow-orb-2" />

      <EmployeeListSidebar
        onSelectConversation={setActiveConversation}
        activeConversationId={activeConversation?.id || null}
        onlineUsersMap={onlineUsers}
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
