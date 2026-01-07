// components/Message.jsx
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { formatTime, stringToColor } from '../../utils/formatters';
import { Avatar } from '../../components/Avatar';
import { SOCKET_URL } from '../../utils/constants';

/**
 * Composant pour afficher un message (normal ou système)
 */
export const Message = ({ message, isOwn, onUsernameClick, userTimezone, onDelete }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Message système (connexion/déconnexion)
  if (message.system) {
    return (
      <div className="message system-message">
        <p className="system-text">{message.text}</p>
      </div>
    );
  }

  const handleDelete = () => {
    onDelete(message.id);
    setShowDeleteConfirm(false);
  };

  // Utiliser couleur custom ou générer depuis le username
  const userColor = message.custom_color || stringToColor(message.username);
  const displayName = message.display_name || message.username;
  
  // Construire l'URL complète de l'avatar
  const apiUrl = SOCKET_URL.replace(/:\d+$/, ':3001');
  const avatarUrl = message.avatar_url ? `${apiUrl}${message.avatar_url}` : null;

  // Vérifier si le message a expiré
  const isExpired = message.attachment_expires_at && new Date(message.attachment_expires_at) < new Date();
  const attachmentUrl = message.attachment_url && !isExpired ? `${apiUrl}${message.attachment_url}` : null;

  // Message normal
  return (
    <div className={`message ${isOwn ? 'own-message' : ''}`}>
      <div className="message-content">
        <div 
          className="avatar avatar-clickable" 
          onClick={() => onUsernameClick && onUsernameClick(message.username)}
        >
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={displayName} 
              className="avatar avatar-medium"
            />
          ) : (
            <Avatar username={message.username} size="small" />
          )}
        </div>
        <div className="message-bubble">
          <div className="message-header">
            <span 
              className="message-username clickable" 
              style={{ color: userColor }}
              onClick={() => onUsernameClick && onUsernameClick(message.username)}
            >
              {displayName}
            </span>
            <span className="message-time">
              {formatTime(message.timestamp, userTimezone)}
            </span>
          </div>
          
          {/* Texte avec markdown si activé */}
          {message.text && (
            message.has_markdown ? (
              <div className="message-text message-markdown">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm, remarkBreaks]}
                  components={{
                    a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />
                  }}
                >
                  {message.text}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="message-text">{message.text}</p>
            )
          )}

          {/* GIF */}
          {message.gif_url && (
            <div className="message-gif">
              <img src={message.gif_url} alt="GIF" />
            </div>
          )}

          {/* Attachment (image/vidéo) */}
          {attachmentUrl && (
            <div className="message-attachment">
              {message.attachment_type === 'image' ? (
                <img src={attachmentUrl} alt="Attachment" />
              ) : (
                <video src={attachmentUrl} controls />
              )}
              {message.attachment_expires_at && (
                <small className="attachment-expires">
                  ⏱️ Expire le {new Date(message.attachment_expires_at).toLocaleString('fr-FR')}
                </small>
              )}
            </div>
          )}

          {/* Message d'expiration */}
          {isExpired && message.attachment_url && (
            <div className="message-attachment-expired">
              📎 Fichier expiré et supprimé
            </div>
          )}

          {/* Bouton supprimer (seulement pour ses propres messages) */}
          {isOwn && (
            <div className="message-actions">
              {!showDeleteConfirm ? (
                <button
                  className="btn-delete-message"
                  onClick={() => setShowDeleteConfirm(true)}
                  title="Supprimer ce message"
                >
                  🗑️
                </button>
              ) : (
                <div className="delete-confirm">
                  <span>Supprimer ?</span>
                  <button
                    className="btn-confirm-delete"
                    onClick={handleDelete}
                  >
                    ✓
                  </button>
                  <button
                    className="btn-cancel-delete"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};