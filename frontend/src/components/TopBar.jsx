// components/TopBar.jsx
import React from 'react';
import { Avatar } from './Avatar';
import { DarkModeToggle } from './DarkModeToggle';
import { SOCKET_URL } from '../utils/constants';
import { Settings } from 'lucide-react';

/**
 * Barre supérieure avec titre du canal et contrôles utilisateur
 */
export const TopBar = ({ 
  channelName = 'Général',
  username, 
  userProfile, 
  darkMode,
  onToggleDarkMode,
  onAvatarClick, 
  onSettingsClick 
}) => {



  return (
    <div className="navbar top">
      {/* Gauche: Info du canal */}
      <div className="top-bar-left">
        <h2 className="channel-name">
          <span className="channel-icon">#</span>
          {channelName}
        </h2>
        <span className="channel-description">Canal principal</span>
      </div> </div>
  );
}