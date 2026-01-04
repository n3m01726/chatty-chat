// components/SettingsPanel.jsx
import React from 'react';

/**
 * Panneau de paramètres - Le dark mode est maintenant dans la TopBar
 */
export const SettingsPanel = ({ 
  onClose,
  onProfileClick 
}) => {
  return (
    <div className="settings-panel">
      <div className="settings-header">
        <h3>⚙️ Paramètres</h3>
        <button className="modal-close" onClick={onClose}>✕</button>
      </div>

      <div className="settings-body">
        {/* Section Compte */}
        <div className="settings-section">
          <h4>Compte</h4>
          
          <button 
            className="settings-button"
            onClick={onProfileClick}
          >
            <span className="settings-button-content">
              <span className="settings-icon">👤</span>
              <div className="settings-button-text">
                <span className="settings-button-label">Mon profil</span>
                <small className="settings-button-desc">Personnalise ton profil</small>
              </div>
            </span>
            <span className="settings-arrow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </span>
          </button>

          <button className="settings-button">
            <span className="settings-button-content">
              <span className="settings-icon">🔔</span>
              <div className="settings-button-text">
                <span className="settings-button-label">Notifications</span>
                <small className="settings-button-desc">Gérer les alertes</small>
              </div>
            </span>
            <span className="settings-arrow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </span>
          </button>
        </div>

        {/* Section Confidentialité */}
        <div className="settings-section">
          <h4>Confidentialité & Sécurité</h4>
          
          <button className="settings-button">
            <span className="settings-button-content">
              <span className="settings-icon">🔒</span>
              <div className="settings-button-text">
                <span className="settings-button-label">Confidentialité</span>
                <small className="settings-button-desc">Contrôle tes données</small>
              </div>
            </span>
            <span className="settings-arrow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </span>
          </button>

          <button className="settings-button">
            <span className="settings-button-content">
              <span className="settings-icon">🔐</span>
              <div className="settings-button-text">
                <span className="settings-button-label">Sécurité</span>
                <small className="settings-button-desc">Authentification</small>
              </div>
            </span>
            <span className="settings-arrow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </span>
          </button>
        </div>

        {/* Section Messages */}
        <div className="settings-section">
          <h4>Messages</h4>
          
          <button className="settings-button">
            <span className="settings-button-content">
              <span className="settings-icon">💬</span>
              <div className="settings-button-text">
                <span className="settings-button-label">Préférences de chat</span>
                <small className="settings-button-desc">Apparence des messages</small>
              </div>
            </span>
            <span className="settings-arrow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </span>
          </button>
        </div>

        {/* Section Avancé */}
        <div className="settings-section">
          <h4>Avancé</h4>
          
          <button className="settings-button">
            <span className="settings-button-content">
              <span className="settings-icon">📊</span>
              <div className="settings-button-text">
                <span className="settings-button-label">Statistiques</span>
                <small className="settings-button-desc">Ton activité</small>
              </div>
            </span>
            <span className="settings-arrow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </span>
          </button>

          <button className="settings-button danger">
            <span className="settings-button-content">
              <span className="settings-icon">🧹</span>
              <div className="settings-button-text">
                <span className="settings-button-label">Effacer les données</span>
                <small className="settings-button-desc">Supprimer l'historique</small>
              </div>
            </span>
            <span className="settings-arrow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </span>
          </button>
        </div>

        {/* Footer */}
        <div className="settings-footer">
          <div className="settings-footer-info">
            <small>Version 1.0.0</small>
            <small>© 2026 Chatty-Chat</small>
          </div>
          <div className="settings-footer-links">
            <a href="#" className="settings-link">Aide</a>
            <span>•</span>
            <a href="#" className="settings-link">Conditions</a>
            <span>•</span>
            <a href="#" className="settings-link">Confidentialité</a>
          </div>
        </div>
      </div>
    </div>
  );
};