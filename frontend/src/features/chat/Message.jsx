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
      <div className="message message--system">
        <p className="message__text">{message.text}</p>
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
    <div className={`message ${isOwn ? 'message--own' : ''}`}>
      <div className="message__content">
        <div 
          className="avatar avatar--clickable" 
          onClick={() => onUsernameClick && onUsernameClick(message.username)}
        >
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={displayName} 
              className="avatar avatar--medium"
            />
          ) : (
            <Avatar username={message.username} size="small" clickable />
          )}
        </div>
        <div className="message__bubble">
          <div className="message__header">
            <span 
              className="message__username message__username--clickable" 
              style={{ color: userColor }}
              onClick={() => onUsernameClick && onUsernameClick(message.username)}
            >
              {displayName}
            </span>
            <span className="message__time">
              {formatTime(message.timestamp, userTimezone)}
            </span>
          </div>
          
          {/* Texte avec markdown si activé */}
          {message.text && (
            message.has_markdown ? (
              <div className="message__text message__markdown">
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
              <p className="message__text">{message.text}</p>
            )
          )}

          {/* GIF */}
          {message.gif_url && (
            <div className="message__gif">
              <img src={message.gif_url} alt="GIF" />
            </div>
          )}

          {/* Attachment (image/vidéo) */}
          {attachmentUrl && (
            <div className="message__attachment">
              {message.attachment_type === 'image' ? (
                <img src={attachmentUrl} alt="Attachment" />
              ) : (
                <video src={attachmentUrl} controls />
              )}
              {message.attachment_expires_at && (
                <small className="message__attachment-expires">
                  ⏱️ Expire le {new Date(message.attachment_expires_at).toLocaleString('fr-FR')}
                </small>
              )}
            </div>
          )}

          {/* Message d'expiration */}
          {isExpired && message.attachment_url && (
            <div className="message__attachment-expired">
              📎 Fichier expiré et supprimé
            </div>
          )}

          {/* Bouton supprimer (seulement pour ses propres messages) */}
          {isOwn && (
            <div className="message__actions">
              {!showDeleteConfirm ? (
                <button
                  className="message-actions__delete"
                  onClick={() => setShowDeleteConfirm(true)}
                  title="Supprimer ce message"
                >
                  🗑️
                </button>
              ) : (
                <div className="message-actions__delete-confirm">
                  <span>Supprimer ?</span>
                  <button
                    className="message-actions__confirm"
                    onClick={handleDelete}
                  >
                    ✓
                  </button>
                  <button
                    className="message-actions__cancel"
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