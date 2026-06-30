import React, { useState, useEffect } from 'react';
import { User, Conversation } from '../types/chat.types';
import { chatApiService } from '../services/chat.api.service';
import { EmployeeListItem } from './EmployeeListItem';
import { Search, Plus, Check } from 'lucide-react';

interface EmployeeListSidebarProps {
  onSelectConversation: (conversation: Conversation) => void;
  activeConversationId: string | null;
  onlineUsersMap: { [userId: string]: boolean };
}

export const EmployeeListSidebar: React.FC<EmployeeListSidebarProps> = ({
  onSelectConversation,
  onlineUsersMap,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [groupTitle, setGroupTitle] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const list = await chatApiService.getEmployees();
        const filtered = list.filter((u) => u.id !== '11111111-1111-1111-1111-111111111111');
        setUsers(filtered);
      } catch (err) {
        console.error('Failed to load users:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleSelectUser = async (targetUser: User) => {
    try {
      const conversation = await chatApiService.createDirectConversation(targetUser.id);
      onSelectConversation(conversation);
    } catch (err) {
      console.error('Failed to start direct conversation:', err);
    }
  };

  const handleToggleUserSelection = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupTitle.trim() || selectedUserIds.length === 0) return;

    try {
      const conversation = await chatApiService.createGroupConversation(
        groupTitle.trim(),
        selectedUserIds
      );
      onSelectConversation(conversation);
      setGroupTitle('');
      setSelectedUserIds([]);
      setIsCreatingGroup(false);
    } catch (err) {
      console.error('Failed to create group conversation:', err);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="chat-sidebar">
      <div className="chat-sidebar-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="chat-sidebar-title">Team Hub</h2>
          <button
            className="chat-input-btn"
            onClick={() => setIsCreatingGroup(!isCreatingGroup)}
            title="New Group"
          >
            {isCreatingGroup ? <Search size={18} /> : <Plus size={18} />}
          </button>
        </div>

        {isCreatingGroup ? (
          <form onSubmit={handleCreateGroup} style={{ marginTop: '10px' }}>
            <input
              type="text"
              placeholder="Group Title..."
              className="chat-search-input"
              value={groupTitle}
              onChange={(e) => setGroupTitle(e.target.value)}
              required
              style={{ marginBottom: '10px' }}
            />
            <button
              type="submit"
              className="chat-input-send-btn"
              style={{ width: '100%', padding: '8px', fontSize: '13px' }}
              disabled={selectedUserIds.length === 0 || !groupTitle.trim()}
            >
              Create Group ({selectedUserIds.length})
            </button>
          </form>
        ) : (
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search team members..."
              className="chat-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="chat-employee-list">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--chat-text-secondary)' }}>
            Loading team...
          </div>
        ) : isCreatingGroup ? (
          users.map((u) => {
            const isSelected = selectedUserIds.includes(u.id);
            return (
              <div
                key={u.id}
                className={`chat-employee-item ${isSelected ? 'active' : ''}`}
                onClick={() => handleToggleUserSelection(u.id)}
              >
                <div className="chat-avatar-wrapper">
                  <div className="chat-avatar">{u.name.charAt(0).toUpperCase()}</div>
                  {isSelected && (
                    <div
                      className="chat-status-indicator online"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Check size={8} color="#fff" />
                    </div>
                  )}
                </div>
                <div className="chat-user-details">
                  <div className="chat-user-name">{u.name}</div>
                  <div className="chat-user-email">{u.email}</div>
                </div>
              </div>
            );
          })
        ) : filteredUsers.length > 0 ? (
          filteredUsers.map((u) => (
            <EmployeeListItem
              key={u.id}
              user={u}
              isOnline={!!onlineUsersMap[u.id] || u.isActive}
              isActiveConversation={false}
              onClick={() => handleSelectUser(u)}
            />
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--chat-text-secondary)' }}>
            No members found
          </div>
        )}
      </div>
    </div>
  );
};
