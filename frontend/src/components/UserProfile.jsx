import { useState, useEffect } from 'react';
import { formatRelativeTime } from '../../utils/formatTime';

/**
 * Composant UserProfile - Modal de profil utilisateur
 */
export default function UserProfile({ 
  userId, 
  userData,
  isOwnProfile = false,
  onClose,
  onUpdate 
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    display_name: '',
    pronouns: '',
    bio: '',
    status_message: '',
    custom_color: '#5865f2',
    timezone: '',
    avatar: '',
    cover: ''
  });

  useEffect(() => {
    if (userData) {
      setFormData({
        display_name: userData.display_name || userData.username || '',
        pronouns: userData.pronouns || '',
        bio: userData.bio || '',
        status_message: userData.status_message || '',
        custom_color: userData.custom_color || '#5865f2',
        timezone: userData.timezone || '',
        avatar: userData.avatar || '',
        cover: userData.cover || ''
      });
    }
  }, [userData]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onUpdate(formData);
    setIsEditing(false);
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Seules les images sont acceptées');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image trop volumineuse (max 5MB)');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      handleChange('avatar', reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCoverUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Seules les images sont acceptées');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      alert('Image trop volumineuse (max 8MB)');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      handleChange('cover', reader.result);
    };
    reader.readAsDataURL(file);
  };

  if (!userData) {
    return (
      <div className="user-profile-overlay">
        <div className="user-profile">
          <div className="user-profile__loading">Chargement...</div>
        </div>
      </div>
    );
  }

  const statusEmojis = {
    online: '🟢',
    busy: '🔴',
    away: '🟡',
    offline: '⚫',
    appear_offline: '⚫'
  };

  return (
    <div className="user-profile-overlay" onClick={onClose}>
      <div className="user-profile" onClick={(e) => e.stopPropagation()}>
        {/* Cover Image */}
        <div 
          className="user-profile__cover"
          style={{ 
            backgroundColor: formData.cover ? 'transparent' : formData.custom_color,
            backgroundImage: formData.cover ? `url(${formData.cover})` : 'none'
          }}
        >
          {isEditing && isOwnProfile && (
            <label className="user-profile__cover-upload">
              📷 Changer cover
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleCoverUpload}
                style={{ display: 'none' }}
              />
            </label>
          )}
        </div>

        {/* Avatar Section */}
        <div className="user-profile__avatar-section">
          <div className="user-profile__avatar-wrapper">
            <img 
              src={formData.avatar || userData.avatar} 
              alt={userData.username}
              className="user-profile__avatar"
            />
            {isEditing && isOwnProfile && (
              <label className="user-profile__avatar-upload">
                📷
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleAvatarUpload}
                  style={{ display: 'none' }}
                />
              </label>
            )}
            <div className={`user-profile__status user-profile__status--${userData.status || 'offline'}`}>
              {statusEmojis[userData.status] || '⚫'}
            </div>
          </div>

          {isOwnProfile && (
            <button 
              className="user-profile__edit-button"
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            >
              {isEditing ? '💾 Enregistrer' : '✏️ Éditer profil'}
            </button>
          )}
        </div>

        {/* Content */}
        <div className="user-profile__content">
          {/* Username / Display Name */}
          {isEditing ? (
            <div className="user-profile__field">
              <label>Nom d'affichage</label>
              <input
                type="text"
                value={formData.display_name}
                onChange={(e) => handleChange('display_name', e.target.value)}
                placeholder={userData.username}
              />
            </div>
          ) : (
            <h2 
              className="user-profile__display-name"
              style={{ color: formData.custom_color }}
            >
              {formData.display_name || userData.username}
            </h2>
          )}

          <p className="user-profile__username">@{userData.username}</p>

          {/* Pronouns */}
          {(isEditing || formData.pronouns) && (
            <div className="user-profile__field">
              {isEditing && <label>Pronoms</label>}
              {isEditing ? (
                <input
                  type="text"
                  value={formData.pronouns}
                  onChange={(e) => handleChange('pronouns', e.target.value)}
                  placeholder="il/lui, elle/elle, iel/iel..."
                />
              ) : (
                <span className="user-profile__pronouns">{formData.pronouns}</span>
              )}
            </div>
          )}

          {/* Status Message */}
          {(isEditing || formData.status_message) && (
            <div className="user-profile__field">
              {isEditing && <label>Message de statut</label>}
              {isEditing ? (
                <input
                  type="text"
                  value={formData.status_message}
                  onChange={(e) => handleChange('status_message', e.target.value)}
                  placeholder="Que fais-tu actuellement ?"
                  maxLength={128}
                />
              ) : (
                <p className="user-profile__status-message">"{formData.status_message}"</p>
              )}
            </div>
          )}

          <div className="user-profile__divider" />

          {/* Bio */}
          {(isEditing || formData.bio) && (
            <div className="user-profile__field">
              <label>À propos de moi</label>
              {isEditing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  placeholder="Dis-nous en plus sur toi..."
                  rows={4}
                  maxLength={500}
                />
              ) : (
                <p className="user-profile__bio">{formData.bio}</p>
              )}
            </div>
          )}

          {/* Custom Color */}
          {isEditing && (
            <div className="user-profile__field">
              <label>Couleur personnalisée</label>
              <div className="user-profile__color-picker">
                <input
                  type="color"
                  value={formData.custom_color}
                  onChange={(e) => handleChange('custom_color', e.target.value)}
                />
                <span style={{ color: formData.custom_color }}>
                  {formData.display_name || userData.username}
                </span>
              </div>
            </div>
          )}

          {/* Timezone */}
          {(isEditing || formData.timezone) && (
            <div className="user-profile__field">
              {isEditing && <label>Fuseau horaire</label>}
              {isEditing ? (
                <input
                  type="text"
                  value={formData.timezone}
                  onChange={(e) => handleChange('timezone', e.target.value)}
                  placeholder="Europe/Paris, America/New_York..."
                />
              ) : (
                <p className="user-profile__timezone">🌍 {formData.timezone}</p>
              )}
            </div>
          )}

          <div className="user-profile__divider" />

          {/* Stats */}
          <div className="user-profile__stats">
            <div className="user-profile__stat">
              <span className="user-profile__stat-value">
                {userData.stats?.messageCount || 0}
              </span>
              <span className="user-profile__stat-label">messages</span>
            </div>
            <div className="user-profile__stat">
              <span className="user-profile__stat-value">
                {userData.stats?.memberSince 
                  ? formatRelativeTime(userData.stats.memberSince)
                  : 'Récent'}
              </span>
              <span className="user-profile__stat-label">membre depuis</span>
            </div>
          </div>
        </div>

        {/* Close button */}
        <button className="user-profile__close" onClick={onClose}>
          ✕
        </button>
      </div>
    </div>
  );
}