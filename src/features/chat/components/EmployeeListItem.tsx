import React from 'react';
import { User } from '../types/chat.types';

interface EmployeeListItemProps {
  user: User;
  isOnline: boolean;
  isActiveConversation: boolean;
  onClick: () => void;
}

export const EmployeeListItem: React.FC<EmployeeListItemProps> = ({
  user,
  isOnline,
  isActiveConversation,
  onClick,
}) => {
  const initial = user.name ? user.name.charAt(0).toUpperCase() : '?';

  return (
    <div
      className={`chat-employee-item ${isActiveConversation ? 'active' : ''}`}
      onClick={onClick}
    >
      <div className="chat-avatar-wrapper">
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt={user.name} className="chat-avatar" />
        ) : (
          <div className="chat-avatar">{initial}</div>
        )}
        <div className={`chat-status-indicator ${isOnline ? 'online' : 'offline'}`} />
      </div>
      <div className="chat-user-details">
        <div className="chat-user-name">{user.name}</div>
        <div className="chat-user-email">{user.email}</div>
      </div>
    </div>
  );
};
