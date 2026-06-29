import React, { useState } from 'react';
import { Message, MessageReaction } from '../types/chat.types';
import { Edit2, Trash, Reply, Smile, Check, CheckCheck, FileText, Download } from 'lucide-react';
import { chatApiService } from '../services/chat.api.service';

interface MessageBubbleProps {
  message: Message;
  currentUserId: string;
  onReply: (message: Message) => void;
  onEdit: (messageId: string, newContent: string) => void;
  onDelete: (messageId: string) => void;
  onReactionAdded: (messageId: string, reaction: MessageReaction) => void;
  onReactionRemoved: (messageId: string, reactionId: string) => void;
  onViewMedia: (url: string, type: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  onReactionAdded,
  onReactionRemoved,
  onViewMedia,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content || '');
  const [showReactionsMenu, setShowReactionsMenu] = useState(false);

  const isSelf = message.senderId === currentUserId;

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editContent.trim()) return;
    try {
      await chatApiService.editMessage(message.id, editContent);
      onEdit(message.id, editContent);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await chatApiService.deleteMessage(message.id);
        onDelete(message.id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleReact = async (emoji: string) => {
    try {
      const existing = message.reactions?.find(
        (r) => r.userId === currentUserId && r.emoji === emoji
      );
      if (existing) {
        await chatApiService.deleteReaction(message.id, existing.id);
        onReactionRemoved(message.id, existing.id);
      } else {
        const res = await chatApiService.addReaction(message.id, emoji);
        onReactionAdded(message.id, res);
      }
    } catch (err) {
      console.error(err);
    }
    setShowReactionsMenu(false);
  };

  const formattedTime = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`chat-message-item ${isSelf ? 'self' : 'other'}`}>
      <div className="chat-message-bubble-wrapper">
        {message.replyTo && (
          <div style={{
            padding: '6px 10px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderLeft: '3px solid var(--chat-accent-purple)',
            borderRadius: '4px',
            fontSize: '11px',
            color: 'var(--chat-text-secondary)',
            marginBottom: '4px',
            cursor: 'pointer',
            maxWidth: '100%',
          }}>
            <span style={{ fontWeight: 600 }}>{message.replyTo.sender?.name || 'Reply to'}: </span>
            {message.replyTo.content || 'Media/Attachment'}
          </div>
        )}

        <div className="chat-message-bubble">
          <div className="bubble-actions" style={{
            position: 'absolute',
            top: '-24px',
            [isSelf ? 'left' : 'right']: '0',
            display: 'flex',
            gap: '6px',
            background: 'var(--chat-bg)',
            border: '1px solid var(--chat-panel-border)',
            borderRadius: '8px',
            padding: '2px 6px',
            zIndex: 5,
            opacity: 0,
            transition: 'opacity 0.2s ease',
          }}>
            <button onClick={() => onReply(message)} title="Reply" className="chat-input-btn" style={{ padding: '3px' }}><Reply size={12} /></button>
            <button onClick={() => setShowReactionsMenu(!showReactionsMenu)} title="React" className="chat-input-btn" style={{ padding: '3px' }}><Smile size={12} /></button>
            {isSelf && (
              <>
                <button onClick={() => setIsEditing(true)} title="Edit" className="chat-input-btn" style={{ padding: '3px' }}><Edit2 size={12} /></button>
                <button onClick={handleDelete} title="Delete" className="chat-input-btn" style={{ padding: '3px', color: 'red' }}><Trash size={12} /></button>
              </>
            )}
          </div>

          {showReactionsMenu && (
            <div style={{
              position: 'absolute',
              top: '-36px',
              [isSelf ? 'left' : 'right']: '0',
              display: 'flex',
              gap: '6px',
              background: '#161622',
              border: '1px solid var(--chat-panel-border)',
              borderRadius: '20px',
              padding: '4px 8px',
              zIndex: 10,
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            }}>
              {['👍', '❤️', '😂', '😮', '😢', '🙏'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleReact(emoji)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '0 2px' }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="text"
                className="chat-search-input"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                style={{ padding: '4px 8px', fontSize: '13px' }}
              />
              <button type="submit" className="chat-input-send-btn" style={{ padding: '6px 10px', fontSize: '12px' }}>Save</button>
              <button type="button" className="chat-input-btn" onClick={() => setIsEditing(false)} style={{ fontSize: '12px' }}>Cancel</button>
            </form>
          ) : (
            <div>
              {message.content && <div>{message.content}</div>}

              {message.attachments && message.attachments.length > 0 && (
                <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {message.attachments.map((att) => {
                    const isImg = att.fileType.startsWith('image');
                    const isVid = att.fileType.startsWith('video');

                    if (isImg || isVid) {
                      return (
                        <div
                          key={att.id}
                          onClick={() => onViewMedia(att.cdnUrl, att.fileType)}
                          style={{ cursor: 'pointer', borderRadius: '8px', overflow: 'hidden', position: 'relative', border: '1px solid rgba(255,255,255,0.1)' }}
                        >
                          {isImg ? (
                            <img src={att.cdnUrl} alt={att.fileName} style={{ maxWidth: '200px', maxHeight: '150px', objectFit: 'cover' }} />
                          ) : (
                            <video src={att.cdnUrl} style={{ maxWidth: '200px', maxHeight: '150px', objectFit: 'cover' }} />
                          )}
                        </div>
                      );
                    }

                    return (
                      <a
                        key={att.id}
                        href={att.cdnUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '6px 10px',
                          background: 'rgba(255,255,255,0.05)',
                          borderRadius: '6px',
                          textDecoration: 'none',
                          color: 'var(--chat-text-primary)',
                          fontSize: '12px',
                          border: '1px solid rgba(255,255,255,0.05)',
                          gap: '6px',
                        }}
                      >
                        <FileText size={14} />
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{att.fileName}</span>
                        <Download size={12} />
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {message.reactions && message.reactions.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
              {Object.entries(
                message.reactions.reduce((acc, r) => {
                  acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                  return acc;
                }, {} as { [emoji: string]: number })
              ).map(([emoji, count]) => {
                const hasReacted = message.reactions?.some(
                  (r) => r.userId === currentUserId && r.emoji === emoji
                );
                return (
                  <button
                    key={emoji}
                    onClick={() => handleReact(emoji)}
                    style={{
                      background: hasReacted ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.08)',
                      border: '1px solid',
                      borderColor: hasReacted ? 'var(--chat-accent-purple)' : 'transparent',
                      borderRadius: '12px',
                      padding: '2px 6px',
                      fontSize: '11px',
                      color: 'var(--chat-text-primary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                    }}
                  >
                    <span>{emoji}</span>
                    <span>{count}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="chat-message-time" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>{formattedTime}</span>
          {isSelf && (
            <span>
              {message.status === 'READ' ? (
                <CheckCheck size={12} color="var(--chat-accent-blue)" />
              ) : message.status === 'DELIVERED' ? (
                <CheckCheck size={12} />
              ) : (
                <Check size={12} />
              )}
            </span>
          )}
        </div>
      </div>

      <style>{`
        .chat-message-item:hover .bubble-actions {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
};
