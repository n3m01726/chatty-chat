// components/ChatContainer.jsx
import React from 'react';
import { MessageList } from './MessageList';
import { TypingIndicator } from './TypingIndicator';
import { MessageInput } from './MessageInput';

/**
 * Container principal du chat (composition des composants)
 */
export const ChatContainer = ({
  username,
  userCount,
  messages,
  typingUsers,
  darkMode,
  onToggleDarkMode,
  onSendMessage,
  onTyping,
  onStopTyping,
  onUsernameClick,
  userProfile,
  onDeleteMessage
}) => {
  return (
    <div className="chat-container">
      <MessageList 
        messages={messages}
        currentUsername={username}
        onUsernameClick={onUsernameClick}
        userTimezone={userProfile?.timezone}
        onDeleteMessage={onDeleteMessage}
      />

      <TypingIndicator typingUsers={typingUsers} />

      <MessageInput 
        onSendMessage={onSendMessage}
        onTyping={onTyping}
        onStopTyping={onStopTyping}
      />
    </div>
  );
};