import React, { useState, useRef } from 'react';
import { Send, Paperclip, X } from 'lucide-react';
import { Message } from '../types/chat.types';
import { chatApiService } from '../services/chat.api.service';
import { MediaAttachmentPreview } from './MediaAttachmentPreview';

interface MessageInputProps {
  onSendMessage: (content?: string, type?: any, replyToId?: string | null, attachments?: any[]) => void;
  onTyping: () => void;
  onStoppedTyping: () => void;
  replyToMessage: Message | null;
  onCancelReply: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onTyping,
  onStoppedTyping,
  replyToMessage,
  onCancelReply,
}) => {
  const [text, setText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    if (e.target.value.trim() !== '') {
      onTyping();
    } else {
      onStoppedTyping();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !selectedFile) return;

    let attachments: any[] = [];

    if (selectedFile) {
      setUploading(true);
      try {
        const uploaded = await chatApiService.uploadMedia(selectedFile);
        attachments = [uploaded];
      } catch (err: any) {
        alert(err.response?.data?.error || 'Failed to upload attachment');
        setUploading(false);
        return;
      }
    }

    const messageType = selectedFile
      ? selectedFile.type.startsWith('image')
        ? 'IMAGE'
        : selectedFile.type.startsWith('video')
        ? 'VIDEO'
        : selectedFile.type.startsWith('audio')
        ? 'AUDIO'
        : 'DOCUMENT'
      : 'TEXT';

    onSendMessage(
      text.trim() ? text.trim() : undefined,
      messageType,
      replyToMessage?.id,
      attachments.length > 0 ? attachments : undefined
    );

    setText('');
    handleRemoveFile();
    onCancelReply();
    onStoppedTyping();
    setUploading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {replyToMessage && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px',
          background: 'rgba(139, 92, 246, 0.1)',
          borderLeft: '4px solid var(--chat-accent-purple)',
          fontSize: '13px',
        }}>
          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Replying to <span style={{ fontWeight: 600 }}>{replyToMessage.sender?.name || 'User'}</span>:{' '}
            {replyToMessage.content || 'Media/Attachment'}
          </div>
          <button onClick={onCancelReply} className="chat-input-btn">
            <X size={14} />
          </button>
        </div>
      )}

      {selectedFile && (
        <div style={{ padding: '0 16px' }}>
          <MediaAttachmentPreview file={selectedFile} onRemove={handleRemoveFile} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="chat-input-bar">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <button
          type="button"
          className="chat-input-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <Paperclip size={20} />
        </button>

        <div className="chat-input-wrapper">
          <input
            type="text"
            placeholder={uploading ? 'Uploading attachment...' : 'Type a message...'}
            className="chat-input-field"
            value={text}
            onChange={handleTextChange}
            disabled={uploading}
          />
        </div>

        <button
          type="submit"
          className="chat-input-send-btn"
          disabled={uploading || (!text.trim() && !selectedFile)}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};
