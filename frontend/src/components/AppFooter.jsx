// components/AppFooter.jsx
import React from 'react';
import { Settings, Moon, Sun } from 'lucide-react';
import { Avatar } from './Avatar';
import { SOCKET_URL } from '../utils/constants';

/**
 * Footer global de l'application (bottom bar)
 */
export const AppFooter = ({ 
  username, 
  userProfile, 
  darkMode, 
  onProfileClick, 
  onSettingsClick,
  onToggleDarkMode 
}) => {
  const apiUrl = SOCKET_URL.replace(/:\d+$/, ':3001');
  const avatarUrl = userProfile?.avatar_url ? `${apiUrl}${userProfile.avatar_url}` : null;
  const displayName = userProfile?.display_name || username;

  return (
    <footer className="app-footer">
      <div className="app-footer__left">
        <div 
          className="app-footer__user"
          onClick={onProfileClick}
          title="Voir mon profil"
        >
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={displayName} 
              className="avatar avatar--small"
            />
          ) : (
            <Avatar username={username} size="small" />
          )}
          <span className="app-footer__username">{displayName}</span>
        </div>
        
        <div className="app-footer__actions">
          <button
            className="app-footer__btn"
            onClick={onSettingsClick}
            title="Paramètres"
          >
            <Settings size={20} />
          </button>
          
          <button
            className="app-footer__btn"
            onClick={onToggleDarkMode}
            title={darkMode ? 'Mode clair' : 'Mode sombre'}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>
      
      <div className="app-footer__right">
        {/* Espace pour futures fonctionnalités (notifications, etc.) */}
      </div>
    </footer>
  );
};