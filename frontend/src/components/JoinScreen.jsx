// components/JoinScreen.jsx
import React, { useState, useEffect } from 'react';
import { Avatar } from './Avatar';
import { SOCKET_URL } from '../utils/constants';

/**
 * Écran de connexion avec historique
 */
export const JoinScreen = ({ onJoin }) => {
  const [username, setUsername] = useState('');
  const [lastConnection, setLastConnection] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Récupérer la dernière connexion depuis localStorage
    const stored = localStorage.getItem('lastConnection');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setLastConnection(parsed);
      } catch (e) {
        console.error('Erreur parsing lastConnection:', e);
      }
    }
    setIsLoading(false);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim()) return;

    // Sauvegarder la connexion
    const connectionData = {
      username: username.trim(),
      timestamp: Date.now()
    };
    localStorage.setItem('lastConnection', JSON.stringify(connectionData));

    onJoin(username.trim());
  };

  const handleUseLastConnection = () => {
    if (lastConnection?.username) {
      onJoin(lastConnection.username);
    }
  };

  const formatLastSeen = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'il y a quelques instants';
    if (minutes < 60) return `il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
    if (hours < 24) return `il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    return `il y a ${days} jour${days > 1 ? 's' : ''}`;
  };

  if (isLoading) {
    return <div className="join-screen loading">Chargement...</div>;
  }

  return (
    <div className="join-screen">
      <div className="join-container">
        <div className="join-header">
          <h1>💬 Chatty-Chat</h1>
          <p>Rejoins la conversation en temps réel</p>
        </div>

        {/* Dernière connexion */}
        {lastConnection && (
          <div className="last-connection-card">
            <div className="last-connection-info">
              <Avatar username={lastConnection.username} size="medium" />
              <div className="last-connection-text">
                <span className="last-connection-label">Dernière connexion</span>
                <span className="last-connection-username">{lastConnection.username}</span>
                <span className="last-connection-time">
                  {formatLastSeen(lastConnection.timestamp)}
                </span>
              </div>
            </div>
            <button 
              className="btn-reconnect"
              onClick={handleUseLastConnection}
              type="button"
            >
              Reconnecter
            </button>
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="join-form">
          <div className="form-group">
            <label htmlFor="username">
              {lastConnection ? 'Ou choisis un nouveau pseudo' : 'Entre ton pseudo'}
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="MonPseudo123"
              maxLength={20}
              autoFocus={!lastConnection}
              className="input-username"
            />
          </div>

          <button 
            type="submit" 
            className="btn-join"
            disabled={!username.trim()}
          >
            Rejoindre le chat
          </button>
        </form>

        <div className="join-footer">
          <small>En rejoignant, tu acceptes nos conditions d'utilisation</small>
        </div>
      </div>
    </div>
  );
};