// components/TopBar.jsx
import React from 'react';
import { Avatar } from './Avatar';
import { DarkModeToggle } from './DarkModeToggle';
import { SOCKET_URL } from '../utils/constants';
import { Settings } from 'lucide-react';

/**
 * Barre supérieure avec titre du canal et contrôles utilisateur
 */
export const BottomBar = ({ 
  channelName = 'Général',
  username, 
  userProfile, 
  darkMode,
  onToggleDarkMode,
  onAvatarClick, 
  onSettingsClick 
}) => {
  const apiUrl = SOCKET_URL.replace(/:\d+$/, ':3001');
  const avatarUrl = userProfile?.avatar_url ? `${apiUrl}${userProfile.avatar_url}` : null;
  const displayName = userProfile?.display_name || username;

  return (
    <div className="navbar bottom">
      {/* Gauche: Info du canal */}
      <div className="top-bar-left">
  {/* Avatar utilisateur */}
               <div 
          className="top-bar-avatar clickable" 
          onClick={onAvatarClick}
          title={`${displayName} - Voir le profil`}
        >
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={displayName} 
              className="top-bar-avatar-img"
            />
          ) : (
            <Avatar username={username} size="small" />
          )}
          <span className={`status-badge status-${userProfile?.status || 'online'}`} />
        </div>
        {/* Dark mode toggle */}
        <div className="top-bar-control" title="Mode sombre">
          <DarkModeToggle darkMode={darkMode} onToggle={onToggleDarkMode} />
        </div>

 

        {/* Settings */}
        <button 
          className="top-bar-settings"
          onClick={onSettingsClick}
          title="Paramètres"
        >
        <Settings size={20} />
        </button>
      </div>
    </div>
  );
};