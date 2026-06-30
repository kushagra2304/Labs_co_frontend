import React, { useRef } from 'react';
import { Message, MessageReaction } from '../types/chat.types';
import { MessageBubble } from './MessageBubble';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  onReply: (message: Message) => void;
  onEdit: (messageId: string, newContent: string) => void;
  onDelete: (messageId: string) => void;
  onReactionAdded: (messageId: string, reaction: MessageReaction) => void;
  onReactionRemoved: (messageId: string, reactionId: string) => void;
  onViewMedia: (url: string, type: string) => void;
  onLoadMore: () => void;
  loadingMore: boolean;
  hasMore: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  onReactionAdded,
  onReactionRemoved,
  onViewMedia,
  onLoadMore,
  loadingMore,
  hasMore,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container || loadingMore || !hasMore) return;

    const scrollFromBottom = Math.abs(container.scrollTop);
    const totalScrollableHeight = container.scrollHeight - container.clientHeight;

    if (totalScrollableHeight - scrollFromBottom < 50) {
      onLoadMore();
    }
  };

  return (
    <div
      ref={containerRef}
      className="chat-message-list"
      onScroll={handleScroll}
    >
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          currentUserId={currentUserId}
          onReply={onReply}
          onEdit={onEdit}
          onDelete={onDelete}
          onReactionAdded={onReactionAdded}
          onReactionRemoved={onReactionRemoved}
          onViewMedia={onViewMedia}
        />
      ))}
      {loadingMore && (
        <div style={{ textAlign: 'center', padding: '10px', color: 'var(--chat-text-secondary)', fontSize: '13px' }}>
          Loading older messages...
        </div>
      )}
    </div>
  );
};
