// components/MessageInput.jsx
import React, { useState, useRef } from 'react';
import { GifPicker } from './GifPicker';
import { AttachmentUploader } from './AttachmentUploader';
import { TYPING_TIMEOUT, MAX_MESSAGE_LENGTH } from '../utils/constants';

/**
 * Formulaire d'envoi de message avec options enrichies
 */
export const MessageInput = ({ onSendMessage, onTyping, onStopTyping }) => {
  const [inputMessage, setInputMessage] = useState('');
  const [useMarkdown, setUseMarkdown] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [showAttachmentUploader, setShowAttachmentUploader] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [gifUrl, setGifUrl] = useState(null);
  const typingTimeoutRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Au moins un contenu requis
    if (!inputMessage.trim() && !attachment && !gifUrl) return;

    // Construire les données du message
    const messageData = {
      text: inputMessage.trim() || '',
      has_markdown: useMarkdown
    };

    // Ajouter attachment si présent
    if (attachment) {
      messageData.attachment_type = attachment.type;
      messageData.attachment_url = attachment.url;
      if (attachment.expiresIn) {
        messageData.expires_in = attachment.expiresIn;
      }
    }

    // Ajouter GIF si présent
    if (gifUrl) {
      messageData.gif_url = gifUrl;
    }

    onSendMessage(messageData);
    
    // Réinitialiser
    setInputMessage('');
    setAttachment(null);
    setGifUrl(null);
    onStopTyping();
    clearTimeout(typingTimeoutRef.current);
  };

  const handleChange = (e) => {
    setInputMessage(e.target.value);

    // Émettre "typing" seulement si pas déjà en cours
    if (!typingTimeoutRef.current) {
      onTyping();
    }

    // Réinitialiser le timer
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      onStopTyping();
      typingTimeoutRef.current = null;
    }, TYPING_TIMEOUT);
  };

  const handleGifSelect = (url) => {
    setGifUrl(url);
    setShowGifPicker(false);
  };

  const handleAttachmentReady = (attachmentData) => {
    setAttachment(attachmentData);
    setShowAttachmentUploader(false);
  };

  // Permettre Ctrl+Enter pour envoyer
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit(e);
    }
  };

  return (
    <>
      <form className="message-input-form" onSubmit={handleSubmit}>
        {/* Preview des attachments/gifs */}
        {(attachment || gifUrl) && (
          <div className="message-preview">
            {attachment && (
              <div className="preview-item">
                <span>📎 Fichier attaché</span>
                {attachment.expiresIn && (
                  <small>⏱️ Expire dans {attachment.expiresIn}h</small>
                )}
                <button
                  type="button"
                  onClick={() => setAttachment(null)}
                  className="preview-remove"
                >
                  ✕
                </button>
              </div>
            )}
            {gifUrl && (
              <div className="preview-item preview-gif">
                <img src={gifUrl} alt="GIF" />
                <button
                  type="button"
                  onClick={() => setGifUrl(null)}
                  className="preview-remove"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        )}

        <div className="input-toolbar">
          <button
            type="button"
            className={`toolbar-btn ${useMarkdown ? 'active' : ''}`}
            onClick={() => setUseMarkdown(!useMarkdown)}
            title="Markdown (gras, italique, liens...)"
          >
            {useMarkdown ? '📝' : 'Md'}
          </button>
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => setShowGifPicker(true)}
            title="Ajouter un GIF"
          >
            🎬
          </button>
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => setShowAttachmentUploader(true)}
            title="Ajouter une image/vidéo"
          >
            📎
          </button>
        </div>

        
          <textarea
          id="message-input"
            placeholder={useMarkdown ? "Message (Markdown activé)..." : "Écris ton message..."}
            value={inputMessage}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            maxLength={MAX_MESSAGE_LENGTH}
            rows={1}
            style={{
              resize: 'none',
              minHeight: '40px',
              maxHeight: '120px',
              overflow: 'auto'
            }}
          />
          <button type="submit" disabled={!inputMessage.trim() && !attachment && !gifUrl}>
            Envoyer
          </button>

        {useMarkdown && (
          <div className="markdown-hint">
            <small>
              **gras** | *italique* | [lien](url) | `code` | Ctrl+Enter pour envoyer
            </small>
          </div>
        )}
      </form>

      {/* Modals */}
      {showGifPicker && (
        <GifPicker
          onSelect={handleGifSelect}
          onClose={() => setShowGifPicker(false)}
        />
      )}

      {showAttachmentUploader && (
        <AttachmentUploader
          onAttachmentReady={handleAttachmentReady}
          onClose={() => setShowAttachmentUploader(false)}
        />
      )}
    </>
  );
};