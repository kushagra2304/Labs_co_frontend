import React from 'react';
import { X } from 'lucide-react';

interface MediaViewerProps {
  url: string;
  type: string;
  onClose: () => void;
}

export const MediaViewer: React.FC<MediaViewerProps> = ({ url, type, onClose }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      animation: 'fadeInBubble 0.2s ease',
    }}>
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'rgba(255, 255, 255, 0.1)',
          border: 'none',
          cursor: 'pointer',
          color: '#fff',
          padding: '10px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.2s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
      >
        <X size={24} />
      </button>
      <div style={{ maxWidth: '90%', maxHeight: '90%', display: 'flex', justifyContent: 'center' }}>
        {type.startsWith('video') ? (
          <video src={url} controls autoPlay style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '8px' }} />
        ) : (
          <img src={url} alt="Attachment View" style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: '8px' }} />
        )}
      </div>
    </div>
  );
};
