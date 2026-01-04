// components/MessageInput.jsx
import React, { useState, useRef } from 'react';
import { GifPicker } from './GifPicker';
import { AttachmentUploader } from './AttachmentUploader';
import { TYPING_TIMEOUT, MAX_MESSAGE_LENGTH } from '../utils/constants';

/**
 * Formulaire d'envoi de message avec toolbar moderne
 */
export const MessageInput = ({ onSendMessage, onTyping, onStopTyping }) => {
  const [inputMessage, setInputMessage] = useState('');
  const [useMarkdown, setUseMarkdown] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [showAttachmentUploader, setShowAttachmentUploader] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [gifUrl, setGifUrl] = useState(null);
  const typingTimeoutRef = useRef(null);
  const textareaRef = useRef(null);

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
    
    // Remettre le focus sur l'input
    textareaRef.current?.focus();
  };

  const handleChange = (e) => {
    setInputMessage(e.target.value);

    // Auto-resize du textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';

    // Émettre "typing"
    if (!typingTimeoutRef.current) {
      onTyping();
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      onStopTyping();
      typingTimeoutRef.current = null;
    }, TYPING_TIMEOUT);
  };

  const handleGifSelect = (url) => {
    setGifUrl(url);
    setShowGifPicker(false);
    textareaRef.current?.focus();
  };

  const handleAttachmentReady = (attachmentData) => {
    setAttachment(attachmentData);
    setShowAttachmentUploader(false);
    textareaRef.current?.focus();
  };

  // Ctrl+Enter pour envoyer
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
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
                <span className="preview-icon">📎</span>
                <span className="preview-text">Fichier attaché</span>
                {attachment.expiresIn && (
                  <small>⏱️ {attachment.expiresIn}h</small>
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

        {/* Input principal */}
        <div className="input-wrapper">
          {/* Toolbar à gauche */}
          <div className="input-toolbar-left">
            <button
              type="button"
              className={`toolbar-icon ${useMarkdown ? 'active' : ''}`}
              onClick={() => setUseMarkdown(!useMarkdown)}
              title="Markdown (gras, italique, liens...)"
            >
              {useMarkdown ? '📝' : '📄'}
            </button>
            <button
              type="button"
              className="toolbar-icon"
              onClick={() => setShowGifPicker(true)}
              title="Ajouter un GIF"
            >
              🎬
            </button>
            <button
              type="button"
              className="toolbar-icon"
              onClick={() => setShowAttachmentUploader(true)}
              title="Ajouter une image/vidéo"
            >
              📎
            </button>
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            placeholder={useMarkdown ? "Message (Markdown activé)..." : "Écris ton message..."}
            value={inputMessage}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            maxLength={MAX_MESSAGE_LENGTH}
            rows={1}
          />

          {/* Bouton envoyer */}
          <button 
            type="submit" 
            className="btn-send"
            disabled={!inputMessage.trim() && !attachment && !gifUrl}
            title="Envoyer (Ctrl+Enter)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
            </svg>
          </button>
        </div>

        {/* Hint Markdown */}
        {useMarkdown && (
          <div className="markdown-hint">
            <small>
              **gras** · *italique* · [lien](url) · `code` · Ctrl+Enter pour envoyer
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