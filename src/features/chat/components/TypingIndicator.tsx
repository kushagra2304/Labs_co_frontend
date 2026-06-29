import React from 'react';

interface TypingIndicatorProps {
  typingUserNames: string[];
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ typingUserNames }) => {
  if (typingUserNames.length === 0) return null;

  const text =
    typingUserNames.length === 1
      ? `${typingUserNames[0]} is typing`
      : typingUserNames.length === 2
      ? `${typingUserNames[0]} and ${typingUserNames[1]} are typing`
      : `${typingUserNames.slice(0, 2).join(', ')} and ${typingUserNames.length - 2} others are typing`;

  return (
    <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px', color: 'var(--chat-accent-purple)', padding: '4px 8px' }}>
      <span>{text}</span>
      <span style={{ display: 'flex', marginLeft: '6px', gap: '3px' }}>
        <span className="typing-dot" style={{ width: '4px', height: '4px', background: 'var(--chat-accent-purple)', borderRadius: '50%', animation: 'typingDot 1.4s infinite' }} />
        <span className="typing-dot" style={{ width: '4px', height: '4px', background: 'var(--chat-accent-purple)', borderRadius: '50%', animation: 'typingDot 1.4s infinite 0.2s' }} />
        <span className="typing-dot" style={{ width: '4px', height: '4px', background: 'var(--chat-accent-purple)', borderRadius: '50%', animation: 'typingDot 1.4s infinite 0.4s' }} />
      </span>
      <style>{`
        @keyframes typingDot {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
};
