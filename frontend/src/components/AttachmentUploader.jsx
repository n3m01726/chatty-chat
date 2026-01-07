// components/AttachmentUploader.jsx
import React, { useState } from 'react';
import { SOCKET_URL } from '../utils/constants';
import { Image,Folder } from "lucide-react";
/**
 * Composant pour uploader des images/vidéos avec timer d'expiration
 */
export const AttachmentUploader = ({ onAttachmentReady, onClose }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [expiresIn, setExpiresIn] = useState(null); // null = pas d'expiration

  const apiUrl = SOCKET_URL.replace(/:\d+$/, ':3001');

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Vérifier le type
    if (!selectedFile.type.startsWith('image/') && !selectedFile.type.startsWith('video/')) {
      alert('Seuls les images et vidéos sont acceptés');
      return;
    }

    // Vérifier la taille (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      alert('Fichier trop volumineux (max 10MB)');
      return;
    }

    setFile(selectedFile);

    // Créer un preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('attachment', file);

    try {
      const response = await fetch(`${apiUrl}/api/messages/attachment`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        onAttachmentReady({
          type: data.type,
          url: data.attachmentUrl,
          expiresIn: expiresIn
        });
        onClose();
      } else {
        alert('Erreur lors de l\'upload');
      }
    } catch (error) {
      console.error('Erreur upload:', error);
      alert('Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const expirationOptions = [
    { value: null, label: 'Permanent' },
    { value: 1, label: '1 heure' },
    { value: 24, label: '24 heures' },
    { value: 24 * 7, label: '7 jours' },
    { value: 24 * 30, label: '30 jours' }
  ];

  return (
    <div className="attachment-uploader-overlay" onClick={onClose}>
      <div className="attachment-uploader-modal" onClick={(e) => e.stopPropagation()}>
        <div className="attachment-header">
          <h3> <Image size={20} /> Ajouter une image/vidéo</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="attachment-body">
          {!file ? (
            <label className="file-drop-zone">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <div className="drop-zone-content">
                <span className="drop-zone-icon">
                <Folder color="#ffcc00" size={64}/></span>
                <p>Cliquer pour sélectionner</p>
                <small>Images et vidéos (max 10MB)</small>
              </div>
            </label>
          ) : ( 
            <div className="file-preview">
              {file.type.startsWith('image/') ? (
                <img src={preview} alt="Preview" />
              ) : (
                <video src={preview} controls />
              )}
              <button className="btn-remove" onClick={() => { setFile(null); setPreview(null); }}>
                ✕ Supprimer
              </button>
            </div>
          )}

          {file && (
            <>
              <div className="expiration-selector">
                <label>⏱️ Expiration automatique</label>
                <select value={expiresIn || ''} onChange={(e) => setExpiresIn(e.target.value ? parseInt(e.target.value) : null)}>
                  {expirationOptions.map(opt => (
                    <option key={opt.value} value={opt.value || ''}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {expiresIn && (
                  <small className="expiration-notice">
                    ⚠️ Ce fichier sera supprimé après {expirationOptions.find(o => o.value === expiresIn)?.label}
                  </small>
                )}
              </div>

              <div className="attachment-actions">
                <button onClick={onClose} className="btn-secondary">
                  Annuler
                </button>
                <button
                  onClick={handleUpload}
                  className="btn-primary"
                  disabled={uploading}
                >
                  {uploading ? '⏳ Upload...' : '✓ Envoyer'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};