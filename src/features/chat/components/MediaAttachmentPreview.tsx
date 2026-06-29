import React from 'react';
import { X, Image, Video, Music, FileText } from 'lucide-react';

interface MediaAttachmentPreviewProps {
  file: File;
  onRemove: () => void;
}

export const MediaAttachmentPreview: React.FC<MediaAttachmentPreviewProps> = ({ file, onRemove }) => {
  const getIcon = () => {
    const type = file.type.split('/')[0];
    switch (type) {
      case 'image': return <Image size={18} />;
      case 'video': return <Video size={18} />;
      case 'audio': return <Music size={18} />;
      default: return <FileText size={18} />;
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '8px 12px',
      background: 'rgba(255, 255, 255, 0.08)',
      borderRadius: '8px',
      border: '1px solid var(--chat-panel-border)',
      maxWidth: '300px',
      margin: '8px 0',
      animation: 'fadeInBubble 0.2s ease',
    }}>
      <div style={{ marginRight: '10px', color: 'var(--chat-accent-blue)' }}>
        {getIcon()}
      </div>
      <div style={{ flex: 1, minWidth: 0, marginRight: '10px' }}>
        <div style={{
          fontSize: '13px',
          fontWeight: 500,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          color: 'var(--chat-text-primary)'
        }}>
          {file.name}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--chat-text-secondary)' }}>
          {formatSize(file.size)}
        </div>
      </div>
      <button
        onClick={onRemove}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--chat-text-secondary)',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
};
