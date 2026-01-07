import { useState } from 'react';
import { formatTime } from '../../utils/formatTime';
import { parseMarkdown } from '../../utils/markdown';

/**
 * Composant Message - Affiche un message avec toutes ses fonctionnalités
 * @param {Object} message - Données du message
 * @param {boolean} canEdit - Si l'utilisateur peut éditer ce message
 * @param {boolean} canDelete - Si l'utilisateur peut supprimer ce message
 * @param {Function} onEdit - Callback d'édition
 * @param {Function} onDelete - Callback de suppression
 * @param {Function} onAvatarClick - Callback clic sur avatar
 */
export default function Message({ 
  message, 
  canEdit = false, 
  canDelete = false,
  onEdit,
  onDelete,
  onAvatarClick
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showActions, setShowActions] = useState(false);
  
  // Message supprimé
  if (message.deleted) {
    return (
      <div className="message message--deleted">
        <div className="message__deleted-notice">
          🗑️ {message.deletedBy} a supprimé un message ici
        </div>
      </div>
    );
  }
  
  // Gestion de l'édition
  const handleSaveEdit = () => {
    if (editContent.trim() && editContent !== message.content) {
      onEdit(message.id, editContent);
    }
    setIsEditing(false);
  };
  
  const handleCancelEdit = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    }
    if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };
  
  return (
    <div 
      className="message"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <img 
        src={message.avatar} 
        alt={message.username}
        className="message__avatar"
      />
      
      <div className="message__content">
        <div className="message__header">
          <span className="message__username">{message.username}</span>
          <span className="message__timestamp">
            {formatTime(message.timestamp)}
            {message.edited && <span className="message__edited"> (édité)</span>}
          </span>
        </div>
        
        {isEditing ? (
          <div className="message__edit">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="message__edit-input"
              autoFocus
            />
            <div className="message__edit-actions">
              <button 
                onClick={handleCancelEdit}
                className="message__edit-button message__edit-button--cancel"
              >
                Annuler
              </button>
              <button 
                onClick={handleSaveEdit}
                className="message__edit-button message__edit-button--save"
                disabled={!editContent.trim()}
              >
                Enregistrer
              </button>
            </div>
            <div className="message__edit-hint">
              Échap pour <span className="message__edit-hint-action">annuler</span> • 
              Entrée pour <span className="message__edit-hint-action">enregistrer</span>
            </div>
          </div>
        ) : (
          <>
            <div 
              className="message__text"
              dangerouslySetInnerHTML={{ __html: parseMarkdown(message.content) }}
            />
            
            {/* Pièces jointes images/vidéos */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="message__attachments">
                {message.attachments.map((attachment, index) => (
                  <div key={index} className="message__attachment">
                    {attachment.type === 'image' && (
                      <img 
                        src={attachment.url} 
                        alt="Pièce jointe"
                        className="message__attachment-image"
                        loading="lazy"
                      />
                    )}
                    {attachment.type === 'video' && (
                      <video 
                        src={attachment.url}
                        controls
                        className="message__attachment-video"
                      />
                    )}
                    {attachment.type === 'gif' && (
                      <img 
                        src={attachment.url} 
                        alt="GIF"
                        className="message__attachment-gif"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        
        {/* Actions (éditer/supprimer) */}
        {showActions && !isEditing && (canEdit || canDelete) && (
          <div className="message__actions">
            {canEdit && (
              <button 
                className="message__action-button"
                onClick={() => setIsEditing(true)}
                title="Éditer"
              >
                ✏️
              </button>
            )}
            {canDelete && (
              <button 
                className="message__action-button"
                onClick={() => {
                  if (window.confirm('Supprimer ce message ?')) {
                    onDelete(message.id);
                  }
                }}
                title="Supprimer"
              >
                🗑️
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}