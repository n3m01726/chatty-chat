// components/JoinScreen.jsx
import React, { useState } from 'react';
import { MAX_USERNAME_LENGTH } from '../../utils/constants';

/**
 * Écran de connexion au chat
 */
export const LoginScreen = ({onLogin}) => {
  const [username, setUsername] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedUsername = username.trim();
    
    if (trimmedUsername) {
      onLogin(trimmedUsername);
    }
  };

  return (
    <div className="login-screen">
      
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
    </div>
  );
};