import { useState } from 'react';

/**
 * Écran de login - Choix du pseudo
 */
export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (username.trim()) {
      onLogin(username.trim());
    }
  };
  
  return (
    <div className="login-wrapper">
      <div className="login">
        <div className="login__logo">💬</div>
        <h1 className="login__title">Bienvenue sur Discord Clone</h1>
        <p className="login__subtitle">Choisis un pseudo pour commencer</p>
        
        <form onSubmit={handleSubmit} className="login__form">
          <input
            type="text"
            placeholder="Entre ton pseudo..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="login__input"
            maxLength={32}
            autoFocus
          />
          
          <button 
            type="submit" 
            className="login__button"
            disabled={!username.trim()}
          >
            Rejoindre le chat →
          </button>
        </form>
        
        <div className="login__hint">
          Un simple pseudo suffit pour commencer
        </div>
      </div>
    </div>
  );
}