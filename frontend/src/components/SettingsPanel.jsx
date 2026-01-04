// components/SettingsPanel.jsx
import React from 'react';
import { DarkModeToggle } from './DarkModeToggle';

/**
 * Panneau de paramètres fixe à droite
 */
export const SettingsPanel = ({ 
  darkMode, 
  onToggleDarkMode, 
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
        {/* Section Apparence */}
        <div className="settings-section">
          <h4>Apparence</h4>
          
          <div className="settings-item">
            <div className="settings-item-info">
              <label>Mode sombre</label>
              <small>Apparence sombre pour protéger vos yeux</small>
            </div>
            <DarkModeToggle darkMode={darkMode} onToggle={onToggleDarkMode} />
          </div>
        </div>

        {/* Section Compte */}
        <div className="settings-section">
          <h4>Compte</h4>
          
          <button 
            className="settings-button"
            onClick={onProfileClick}
          >
            <span>👤 Mon profil</span>
            <span className="settings-arrow">→</span>
          </button>

          <button className="settings-button">
            <span>🔔 Notifications</span>
            <span className="settings-arrow">→</span>
          </button>
        </div>

        {/* Section Confidentialité */}
        <div className="settings-section">
          <h4>Confidentialité</h4>
          
          <button className="settings-button">
            <span>🔒 Confidentialité</span>
            <span className="settings-arrow">→</span>
          </button>
        </div>

        {/* Section Avancé */}
        <div className="settings-section">
          <h4>Avancé</h4>
          
          <button className="settings-button">
            <span>🧹 Effacer les données</span>
            <span className="settings-arrow">→</span>
          </button>

          <button className="settings-button">
            <span>📊 Statistiques</span>
            <span className="settings-arrow">→</span>
          </button>
        </div>

        {/* Footer */}
        <div className="settings-footer">
          <small>Version 1.0.0</small>
          <small>© 2026 Chatty-Chat</small>
        </div>
      </div>
    </div>
  );
};