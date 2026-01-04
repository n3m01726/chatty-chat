// components/BottomBar.jsx
import React, { useState } from 'react';
import { Avatar } from './Avatar';
import { SOCKET_URL } from '../utils/constants';

/**
 * Barre du bas ultra minimaliste
 * Gauche: Avatar (avec badges)
 * Droite: ⚙️ Settings
 */
export const BottomBar = ({ username, userProfile, onAvatarClick, onSettingsClick }) => {
  const apiUrl = SOCKET_URL.replace(/:\d+$/, ':3001');
  const avatarUrl = userProfile?.avatar_url ? `${apiUrl}${userProfile.avatar_url}` : null;
  const displayName = userProfile?.display_name || username;

  return (
    <div className="bottom-bar">
      {/* Avatar avec badges */}
      <div 
        className="bottom-bar-avatar clickable" 
        onClick={onAvatarClick}
        title={`${displayName} - Cliquer pour voir le profil`}
      >
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt={displayName} 
            className="bottom-bar-avatar-img"
          />
        ) : (
          <Avatar username={username} size="small" />
        )}
        
        {/* Badge statut */}
        <span className={`status-badge status-${userProfile?.status || 'online'}`} />
      </div>

      {/* Settings */}
      <button 
        className="bottom-bar-settings"
        onClick={onSettingsClick}
        title="Paramètres"
      >
        ⚙️
      </button>
    </div>
  );
};