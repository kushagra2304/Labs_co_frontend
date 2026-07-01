import React, { useState } from 'react';
import { Conversation, Message, MessageReaction } from '../types/chat.types';
import { useConversation } from '../hooks/useConversation';
import { useTypingIndicator } from '../hooks/useTypingIndicator';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import { MediaViewer } from './MediaViewer';
import { MessageSquare, Video, Info } from 'lucide-react';

interface ConversationWindowProps {
  conversation: Conversation | null;
  currentUserId: string;
}

export const ConversationWindow: React.FC<ConversationWindowProps> = ({
  conversation,
  currentUserId,
}) => {
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [activeMedia, setActiveMedia] = useState<{ url: string; type: string } | null>(null);

  const {
    messages,
    loading,
    hasMore,
    loadMore,
    sendMessage,
    setMessages,
  } = useConversation(conversation?.id || null);

  const {
    typingUsers,
    emitTyping,
    emitStoppedTyping,
  } = useTypingIndicator(conversation?.id || null);

  if (!conversation) {
    return (
      <div className="chat-window-placeholder">
        <div className="chat-placeholder-icon">
          <MessageSquare size={64} />
        </div>
        <h3 style={{ fontSize: '22px', fontWeight: 600, marginBottom: '8px' }}>Your Collaboration Workspace</h3>
        <p style={{ maxWidth: '300px', fontSize: '14px', lineHeight: '1.5' }}>
          Select a team member or create a group from the hub to start collaborating in real-time.
        </p>
      </div>
    );
  }

  const getHeaderDetails = () => {
    if (conversation.type === 'DIRECT') {
      const targetMember = conversation.members.find((m) => m.userId !== currentUserId);
      return {
        title: targetMember?.user?.name || 'Direct Conversation',
        subtitle: targetMember?.user?.isActive ? 'Online' : 'Offline',
      };
    } else {
      return {
        title: conversation.title || 'Group Chat',
        subtitle: `${conversation.members.length} members`,
      };
    }
  };

  const header = getHeaderDetails();

  const typingUserNames = typingUsers
    .map((id) => conversation.members.find((m) => m.userId === id)?.user?.name)
    .filter((name): name is string => !!name);

  const handleEditMessage = (messageId: string, newContent: string) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, content: newContent } : msg))
    );
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
  };

  const handleReactionAdded = (messageId: string, reaction: MessageReaction) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId) {
          const currentReactions = msg.reactions || [];
          if (currentReactions.some((r) => r.id === reaction.id || (r.userId === reaction.userId && r.emoji === reaction.emoji))) {
            return msg;
          }
          return { ...msg, reactions: [...currentReactions, reaction] };
        }
        return msg;
      })
    );
  };

  const handleReactionRemoved = (messageId: string, reactionId: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId) {
          const currentReactions = msg.reactions || [];
          return { ...msg, reactions: currentReactions.filter((r) => r.id !== reactionId) };
        }
        return msg;
      })
    );
  };

  return (
    <div className="chat-window">
      <div className="chat-window-header">
        <div className="chat-header-info">
          <h3 className="chat-header-title">{header.title}</h3>
          <span className="chat-header-subtitle">{header.subtitle}</span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="chat-input-btn"><Video size={20} /></button>
          <button className="chat-input-btn"><Info size={20} /></button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        <MessageList
          messages={messages}
          currentUserId={currentUserId}
          onReply={setReplyTo}
          onEdit={handleEditMessage}
          onDelete={handleDeleteMessage}
          onReactionAdded={handleReactionAdded}
          onReactionRemoved={handleReactionRemoved}
          onViewMedia={(url, type) => setActiveMedia({ url, type })}
          onLoadMore={loadMore}
          loadingMore={loading}
          hasMore={hasMore}
        />

        <div style={{ position: 'absolute', bottom: '8px', left: '24px' }}>
          <TypingIndicator typingUserNames={typingUserNames} />
        </div>
      </div>

      <MessageInput
        onSendMessage={sendMessage}
        onTyping={emitTyping}
        onStoppedTyping={emitStoppedTyping}
        replyToMessage={replyTo}
        onCancelReply={() => setReplyTo(null)}
      />

      {activeMedia && (
        <MediaViewer
          url={activeMedia.url}
          type={activeMedia.type}
          onClose={() => setActiveMedia(null)}
        />
      )}
    </div>
  );
};
