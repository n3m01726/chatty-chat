// components/ChatHeader.jsx
import React from 'react';
import { DarkModeToggle } from './DarkModeToggle';
import { Avatar } from './Avatar';
import { SOCKET_URL } from '../utils/constants';

/**
 * Header du chat avec infos utilisateur
 */
export const ChatHeader = ({ username, userCount, darkMode, onToggleDarkMode, onUsernameClick, userProfile }) => {
  // Construire l'URL complète de l'avatar
  const apiUrl = SOCKET_URL.replace(/:\d+$/, ':3001');
  const avatarUrl = userProfile?.avatar_url ? `${apiUrl}${userProfile.avatar_url}` : null;
  const displayName = userProfile?.display_name || username;

  return (
    <header className="chat-header">
      <h2>#general-chat</h2>
      <div className="user-info">
        <DarkModeToggle darkMode={darkMode} onToggle={onToggleDarkMode} />
        <div 
          className="current-user clickable" 
          onClick={() => onUsernameClick && onUsernameClick(username)}
        >
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={displayName} 
              className="avatar avatar-small"
            />
          ) : (
            <Avatar username={username} size="small" />
          )}
          <span className="username-badge">{displayName}</span>
        </div>
        <span className="user-count">👥 {userCount} en ligne</span>
      </div>
    </header>
  );
};