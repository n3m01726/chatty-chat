// components/DarkModeToggle.jsx
import React from 'react';
import { Moon, Sun } from 'lucide-react';
/**
 * Bouton pour toggle le dark mode
 */
export const DarkModeToggle = ({ darkMode, onToggle }) => {
  return (
    <button 
      className="dark-mode-toggle"
      onClick={onToggle}
      aria-label="Toggle dark mode"
    >
      {darkMode ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
};