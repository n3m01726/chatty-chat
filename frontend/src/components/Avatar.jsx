// components/Avatar.jsx
import React from 'react';
import { getInitials, stringToColor } from '../utils/formatters';

/**
 * Composant Avatar avec initiales et couleur unique
 */
export const Avatar = ({ username, size = 'medium' }) => {
  const initials = getInitials(username);
  const color = stringToColor(username);

  const sizeClasses = {
    small: 'avatar-small',
    medium: 'avatar-medium',
    large: 'avatar-large'
  };

  return (
    <div 
      className={`avatar ${sizeClasses[size]}`}
      style={{ backgroundColor: color }}
      title={username}
    >
      {initials}
    </div>
  );
};