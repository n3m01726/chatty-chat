// components/UserProfile.jsx
import React, { useState, useEffect } from 'react';
import { Avatar } from './Avatar';
import { Pen, Plus, Hourglass, Camera } from 'lucide-react';

import { 
  SOCKET_URL, 
  USER_STATUSES, 
  TIMEZONES,
  MAX_BIO_LENGTH,
  MAX_STATUS_LENGTH,
  MAX_DISPLAY_NAME_LENGTH
} from '../utils/constants';

/**
 * Modal de profil utilisateur étendu
 */
export const UserProfile = ({ 
  username, 
  isOwn, 
  onClose, 
  darkMode, 
  onToggleDarkMode,
  onProfileUpdate 
}) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  
  // États pour les champs éditables
  const [bio, setBio] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [customColor, setCustomColor] = useState('');
  const [status, setStatus] = useState('online');
  const [statusText, setStatusText] = useState('');
  const [timezone, setTimezone] = useState('UTC');

  const apiUrl = SOCKET_URL.replace(/:\d+$/, ':3001');

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/users/${username}`);
      const data = await response.json();
      
      if (data.success) {
        setProfile(data.profile);
        // Initialiser les états
        setBio(data.profile.bio || '');
        setDisplayName(data.profile.display_name || '');
        setPronouns(data.profile.pronouns || '');
        setCustomColor(data.profile.custom_color || '');
        setStatus(data.profile.status || 'online');
        setStatusText(data.profile.status_text || '');
        setTimezone(data.profile.timezone || 'UTC');
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${apiUrl}/api/users/${username}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bio,
          display_name: displayName || null,
          pronouns: pronouns || null,
          custom_color: customColor || null,
          status,
          status_text: statusText || null,
          timezone,
          dark_mode: darkMode
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setProfile(data.profile);
        setEditing(false);
        
        // Notifier le parent pour mettre à jour l'affichage
        if (onProfileUpdate) {
          onProfileUpdate(data.profile);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await fetch(`${apiUrl}/api/users/${username}/avatar`, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      if (data.success) {
        setProfile(data.profile);
        if (onProfileUpdate) {
          onProfileUpdate(data.profile);
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload de l\'avatar:', error);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingBanner(true);
    const formData = new FormData();
    formData.append('banner', file);

    try {
      const response = await fetch(`${apiUrl}/api/users/${username}/banner`, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      if (data.success) {
        setProfile(data.profile);
        if (onProfileUpdate) {
          onProfileUpdate(data.profile);
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload du banner:', error);
    } finally {
      setUploadingBanner(false);
    }
  };

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const currentStatus = USER_STATUSES.find(s => s.value === (profile.status || 'online'));
  const displayUsername = profile.display_name || username;
  const avatarUrl = profile.avatar_url ? `${apiUrl}${profile.avatar_url}` : null;
  const bannerUrl = profile.banner_url ? `${apiUrl}${profile.banner_url}` : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content user-profile-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        
        {/* Banner */}
        <div 
          className="profile-banner"
          style={{ 
            backgroundImage: bannerUrl ? `url(${bannerUrl})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}
        >
          {isOwn && editing && (
            <label className="upload-banner-btn icon-text">
              {uploadingBanner ? <Hourglass size={20}/> : <Plus size={20}/>} Upload your cover
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleBannerUpload}
                style={{ display: 'none' }}
              />
            </label>
          )}
        </div>

        {/* Header avec avatar */}
        <div className="profile-header-with-avatar">
          <div className="profile-avatar-container">
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayUsername} className="profile-avatar-img" />
            ) : (
              <Avatar username={username} size="large" />
            )}
            {isOwn && editing && (
              <label className="upload-avatar-btn">
                {uploadingAvatar ? <Hourglass size={20} /> : <Camera size={20} />}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleAvatarUpload}
                  style={{ display: 'none' }}
                />
              </label>
            )}
          </div>
          
          <div className="profile-info">
            <div className="profile-name-row">
              <h2>{displayUsername}</h2>
              {profile.pronouns && <span className="pronouns">({profile.pronouns})</span>}
            </div>
            <p className="profile-username">@{username}</p>
            <div className="profile-status">
              <span className="status-indicator" style={{ color: currentStatus.color }}>
                {currentStatus.icon}
              </span>
              <span className="status-label">{currentStatus.label}</span>
              {profile.status_text && <span className="status-text"> - {profile.status_text}</span>}
            </div>
          </div>
        </div>

        {/* Actions */}
        {isOwn && (
          <div className="profile-actions">
            {!editing ? (
              <button onClick={() => setEditing(true)} className="btn-primary icon-text">
                <Pen size={20}/>  Modifier le profil 
              </button>
            ) : (
              <>

                <button onClick={handleSave} className="btn-primary" disabled={saving}>
                  {saving ? 'Sauvegarde...' : 'Enregistrer'}
                </button>
                <button onClick={() => setEditing(false)} className="btn-secondary">
                  Annuler
                </button>
              </>
            )}
          </div>
        )}

        {/* Statistiques */}
        <div className="profile-stats">
          <div className="stat">
            <span className="stat-value">{profile.messageCount || 0}</span>
            <span className="stat-label">Messages</span>
          </div>
          <div className="stat">
            <span className="stat-value">{formatDate(profile.created_at)}</span>
            <span className="stat-label">Membre depuis</span>
          </div>
        </div>

        {/* Sections éditables */}
        {editing ? (
          <div className="profile-edit-form">
   <div className="status">
            {/* Status */}
            <div className="form-group">
              <label>Statut</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                {USER_STATUSES.map(s => (
                  <option key={s.value} value={s.value}>
                    {s.icon} {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Text */}

            <div className="form-group">
              <label>Message de statut</label>
              <input
                type="text"
                value={statusText}
                onChange={(e) => setStatusText(e.target.value)}
                placeholder="Que fais-tu en ce moment ?"
                maxLength={MAX_STATUS_LENGTH}
              />
              <small>{statusText.length}/{MAX_STATUS_LENGTH}</small>
            </div>
</div>
 
            {/* Display Name */}
            <div className="form-group">
              <label>Nom d'affichage</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={username}
                maxLength={MAX_DISPLAY_NAME_LENGTH}
              />
              <small>{displayName.length}/{MAX_DISPLAY_NAME_LENGTH}</small>
            </div>

            {/* Pronouns */}
            <div className="form-group">
              <label>Pronoms</label>
              <input
                type="text"
                value={pronouns}
                onChange={(e) => setPronouns(e.target.value)}
                placeholder="il/lui, elle/elle, iel/iel..."
                maxLength={30}
              />
            </div>

            {/* Bio */}
            <div className="form-group">
              <label>Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Parle-nous de toi..."
                maxLength={MAX_BIO_LENGTH}
                rows={4}
              />
              <small>{bio.length}/{MAX_BIO_LENGTH}</small>
            </div>



            {/* Custom Color */}
            <div className="form-group">
              <label>Couleur personnalisée</label>
              <div className="color-picker-row">
                <input
                  type="color"
                  value={customColor || '#667eea'}
                  onChange={(e) => setCustomColor(e.target.value)}
                />
                <input
                  type="text"
                  value={customColor || ''}
                  onChange={(e) => setCustomColor(e.target.value)}
                  placeholder="#667eea"
                  maxLength={7}
                />
                {customColor && (
                  <button 
                    onClick={() => setCustomColor('')}
                    className="btn-clear"
                    title="Réinitialiser"
                  >
                    ↺
                  </button>
                )}
              </div>
            </div>

            {/* Timezone */}
            <div className="form-group">
              <label>Fuseau horaire</label>
              <select value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                {TIMEZONES.map(tz => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label} ({tz.offset})
                  </option>
                ))}
              </select>
            </div>

            {/* Dark Mode */}
            <div className="form-group form-group-row">
            </div>
          </div>
        ) : (
          <div className="profile-view">
            {bio && (
              <div className="profile-section">
                <h3>bio</h3>
                <p>{bio}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Modal de profil utilisateur avec possibilité de supprimer avatar/cover
 */
export const ProfileModal = ({ 
  username, 
  userProfile, 
  onClose, 
  onUpdateProfile 
}) => {
  const apiUrl = SOCKET_URL.replace(/:\d+$/, ':3001');
  
  const [displayName, setDisplayName] = useState(userProfile?.display_name || username);
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [status, setStatus] = useState(userProfile?.status || 'online');
  const [avatarPreview, setAvatarPreview] = useState(
    userProfile?.avatar_url ? `${apiUrl}${userProfile.avatar_url}` : null
  );
  const [coverPreview, setCoverPreview] = useState(
    userProfile?.cover_url ? `${apiUrl}${userProfile.cover_url}` : null
  );
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onload = () => setCoverPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    setAvatarFile(null);
    if (avatarInputRef.current) {
      avatarInputRef.current.value = '';
    }
  };

  const handleRemoveCover = () => {
    setCoverPreview(null);
    setCoverFile(null);
    if (coverInputRef.current) {
      coverInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const formData = new FormData();
    formData.append('display_name', displayName);
    formData.append('bio', bio);
    formData.append('status', status);

    if (avatarFile) {
      formData.append('avatar', avatarFile);
    } else if (!avatarPreview && userProfile?.avatar_url) {
      // L'utilisateur veut supprimer son avatar
      formData.append('remove_avatar', 'true');
    }

    if (coverFile) {
      formData.append('cover', coverFile);
    } else if (!coverPreview && userProfile?.cover_url) {
      // L'utilisateur veut supprimer son cover
      formData.append('remove_cover', 'true');
    }

    try {
      const response = await fetch(`${apiUrl}/api/profile`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        onUpdateProfile(updatedProfile);
        onClose();
      } else {
        alert('Erreur lors de la sauvegarde du profil');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur de connexion');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>👤 Mon profil</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body profile-form">
          {/* Cover image */}
          <div className="profile-cover-section">
            <div 
              className="profile-cover"
              style={{
                backgroundImage: coverPreview ? `url(${coverPreview})` : 'none'
              }}
            >
              {!coverPreview && (
                <div className="cover-placeholder">
                  <span>Aucune bannière</span>
                </div>
              )}
              <div className="cover-actions">
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCoverChange}
                  style={{ display: 'none' }}
                  id="cover-input"
                />
                <label htmlFor="cover-input" className="btn-cover-action" title="Changer la bannière">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                </label>
                {coverPreview && (
                  <button
                    type="button"
                    className="btn-cover-action btn-remove"
                    onClick={handleRemoveCover}
                    title="Supprimer la bannière"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Avatar */}
            <div className="profile-avatar-wrapper">
              <div className="profile-avatar">
                {avatarPreview ? (
                  <img src={avatarPreview} alt={displayName} />
                ) : (
                  <Avatar username={username} size="large" />
                )}
                <div className="avatar-overlay">
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    style={{ display: 'none' }}
                    id="avatar-input"
                  />
                  <label htmlFor="avatar-input" className="btn-avatar-action" title="Changer l'avatar">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                  </label>
                  {avatarPreview && (
                    <button
                      type="button"
                      className="btn-avatar-action btn-remove"
                      onClick={handleRemoveAvatar}
                      title="Supprimer l'avatar"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12"/>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire */}
          <div className="profile-form-fields">
            {/* Nom d'affichage */}
            <div className="form-group">
              <label htmlFor="display-name">Nom d'affichage</label>
              <input
                type="text"
                id="display-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={30}
                placeholder={username}
              />
            </div>

            {/* Bio */}
            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={200}
                rows={3}
                placeholder="Parle-nous de toi..."
              />
              <small className="form-hint">{bio.length} / 200</small>
            </div>

            {/* Statut */}
            <div className="form-group">
              <label>Statut</label>
              <div className="status-options">
                {[
                  { value: 'online', label: 'En ligne', emoji: '🟢' },
                  { value: 'away', label: 'Absent', emoji: '🟡' },
                  { value: 'busy', label: 'Occupé', emoji: '🔴' },
                  { value: 'offline', label: 'Hors ligne', emoji: '⚫' }
                ].map((option) => (
                  <label key={option.value} className="status-option">
                    <input
                      type="radio"
                      name="status"
                      value={option.value}
                      checked={status === option.value}
                      onChange={(e) => setStatus(e.target.value)}
                    />
                    <span className="status-option-content">
                      <span>{option.emoji}</span>
                      <span>{option.label}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn-primary" disabled={isSaving}>
              {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};