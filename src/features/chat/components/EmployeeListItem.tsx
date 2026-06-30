import React from 'react';
import { User } from '../types/chat.types';

interface EmployeeListItemProps {
  user: User;
  isOnline: boolean;
  isActiveConversation: boolean;
  unreadCount?: number;
  onClick: () => void;
}

export const EmployeeListItem: React.FC<EmployeeListItemProps> = ({
  user,
  isOnline,
  isActiveConversation,
  unreadCount = 0,
  onClick,
}) => {
  const initial = user.name ? user.name.charAt(0).toUpperCase() : '?';

  return (
    <div
      className={`chat-employee-item ${isActiveConversation ? 'active' : ''}`}
      onClick={onClick}
      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', boxSizing: 'border-box' }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
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
      {unreadCount > 0 && (
        <div style={{
          background: 'var(--chat-accent-purple)',
          color: '#fff',
          borderRadius: '50%',
          width: '20px',
          height: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '11px',
          fontWeight: 'bold',
          boxShadow: '0 0 8px var(--chat-glow-purple)',
          flexShrink: 0,
          marginLeft: '8px',
        }}>
          {unreadCount}
        </div>
      )}
    </div>
  );
};
