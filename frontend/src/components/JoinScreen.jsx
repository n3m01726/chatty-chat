// components/JoinScreen.jsx
import React, { useState, useEffect } from 'react';
import { DarkModeToggle } from './DarkModeToggle';
import { Avatar } from './Avatar';
import { MAX_USERNAME_LENGTH, SOCKET_URL } from '../utils/constants';

/**
 * Écran de connexion au chat avec mémoire du dernier utilisateur
 */
export const JoinScreen = ({ onJoin, darkMode, onToggleDarkMode }) => {
  const [username, setUsername] = useState('');
  const [lastUser, setLastUser] = useState(null);
  const [showNewUser, setShowNewUser] = useState(false);

  const apiUrl = SOCKET_URL.replace(/:\d+$/, ':3001');

  useEffect(() => {
    // Charger le dernier utilisateur depuis localStorage
    const lastUsername = localStorage.getItem('lastUsername');
    if (lastUsername) {
      loadLastUser(lastUsername);
    } else {
      setShowNewUser(true);
    }
  }, []);

  const loadLastUser = async (username) => {
    try {
      const response = await fetch(`${apiUrl}/api/users/${username}`);
      const data = await response.json();
      
      if (data.success) {
        setLastUser(data.profile);
      } else {
        setShowNewUser(true);
      }
    } catch (error) {
      console.error('Erreur chargement dernier utilisateur:', error);
      setShowNewUser(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedUsername = username.trim();
    
    if (trimmedUsername) {
      localStorage.setItem('lastUsername', trimmedUsername);
      onJoin(trimmedUsername);
    }
  };

  const handleResumeWithLastUser = () => {
    if (lastUser) {
      localStorage.setItem('lastUsername', lastUser.username);
      onJoin(lastUser.username);
    }
  };

  const formatLastSeen = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return date.toLocaleDateString('fr-FR');
  };

  if (lastUser && !showNewUser) {
    const avatarUrl = lastUser.avatar_url ? `${apiUrl}${lastUser.avatar_url}` : null;
    const displayName = lastUser.display_name || lastUser.username;

    return (
      <div className="join-screen">
        <DarkModeToggle darkMode={darkMode} onToggle={onToggleDarkMode} />
        
        <h1>💬 Bon retour !</h1>
        
        <div className="last-user-card">
        <div className="usercard">
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className="avatar-large" />
          ) : (
            <Avatar username={lastUser.username} size="large" />
          )}
          
          <div className="last-user-info" style={{ marginLeft: '15px' }}>
            <h2>{displayName}</h2>
            <p className="last-user-username">known as @{lastUser.username}</p>
            <p className="last-user-seen">
              Dernière connexion : {formatLastSeen(lastUser.last_seen)}
            </p>
          </div>
        </div>
</div>
        <button 
          onClick={handleResumeWithLastUser}
          className="btn-primary btn-resume"
        >
          Reprendre avec ce pseudo
        </button>

        <button 
          onClick={() => setShowNewUser(true)}
          className="btn-text"
        >
          Utiliser un autre pseudo
        </button>
      </div>
    );
  }

  return (
    <div className="join-screen">
      <DarkModeToggle darkMode={darkMode} onToggle={onToggleDarkMode} />
      
      <h1>💬 Chat en Temps Réel</h1>
      
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Entre ton pseudo..."
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          maxLength={MAX_USERNAME_LENGTH}
          autoFocus
        />
        <button type="submit">Rejoindre</button>
      </form>

      {lastUser && (
        <button 
          onClick={() => setShowNewUser(false)}
          className="btn-text"
        >
          ← Retour
        </button>
      )}
    </div>
  );
};