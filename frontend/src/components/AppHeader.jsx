// components/AppHeader.jsx
import React from 'react';
import { Users } from 'lucide-react';

/**
 * Header global de l'application (top bar)
 */
export const AppHeader = ({ channelName, channelDescription, userCount, onMembersClick }) => {
  return (
    <header className="app-header">
      <div className="app-header__left">
        <div className="app-header__channel-info">
          <h1>{channelName}</h1>
          <p>{channelDescription}</p>
        </div>
      </div>
      
      <div className="app-header__right">
        <div className="app-header__user-count">
          <span>👥</span>
          <span>{userCount} en ligne</span>
        </div>
        
        <button 
          className="app-header__members-btn"
          onClick={onMembersClick}
          title="Voir les membres"
        >
          <Users size={18} />
          <span>Membres</span>
        </button>
      </div>
    </header>
  );
};