// components/MessageInput.jsx
import React, { useState, useRef } from 'react';
import { GifPicker } from './GifPicker';
import { AttachmentUploader } from './AttachmentUploader';
import { TYPING_TIMEOUT, MAX_MESSAGE_LENGTH } from '../utils/constants';

/**
 * Formulaire d'envoi de message avec toolbar moderne style Grok/ChatGPT
 */
export const MessageInput = ({ onSendMessage, onTyping, onStopTyping }) => {
  const [inputMessage, setInputMessage] = useState('');
  const [useMarkdown, setUseMarkdown] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [showAttachmentUploader, setShowAttachmentUploader] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [gifUrl, setGifUrl] = useState(null);
  const [isFocused, setIsFocused] = useState(false);
  const typingTimeoutRef = useRef(null);
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() && !attachment && !gifUrl) return;

    const messageData = {
      text: inputMessage.trim() || '',
      has_markdown: useMarkdown
    };

    if (attachment) {
      messageData.attachment_type = attachment.type;
      messageData.attachment_url = attachment.url;
      if (attachment.expiresIn) {
        messageData.expires_in = attachment.expiresIn;
      }
    }

    if (gifUrl) {
      messageData.gif_url = gifUrl;
    }

    onSendMessage(messageData);
    
    setInputMessage('');
    setAttachment(null);
    setGifUrl(null);
    onStopTyping();
    clearTimeout(typingTimeoutRef.current);
    
    textareaRef.current?.focus();
  };

  const handleChange = (e) => {
    setInputMessage(e.target.value);

    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';

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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const charCount = inputMessage.length;
  const charLimit = MAX_MESSAGE_LENGTH;
  const isNearLimit = charCount > charLimit * 0.8;

  return (
    <div className="message-input-container">
      <form className={`message-input-form ${isFocused ? 'focused' : ''}`} onSubmit={handleSubmit}>
        {/* Preview des attachments/gifs */}
        {(attachment || gifUrl) && (
          <div className="message-preview">
            {attachment && (
              <div className="preview-item">
                <div className="preview-content">
                  <span className="preview-icon">📎</span>
                  <div className="preview-info">
                    <span className="preview-text">Fichier attaché</span>
                    {attachment.expiresIn && (
                      <small className="preview-meta">Expire dans {attachment.expiresIn}h</small>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachment(null)}
                  className="preview-remove"
                  title="Supprimer"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            )}
            {gifUrl && (
              <div className="preview-item preview-gif">
                <img src={gifUrl} alt="GIF" className="preview-gif-img" />
                <button
                  type="button"
                  onClick={() => setGifUrl(null)}
                  className="preview-remove"
                  title="Supprimer"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Input principal */}
        <div className="input-wrapper">
          {/* Toolbar à gauche */}
          <div className="input-toolbar">
            <button
              type="button"
              className={`toolbar-btn ${useMarkdown ? 'active' : ''}`}
              onClick={() => setUseMarkdown(!useMarkdown)}
              title={useMarkdown ? "Désactiver Markdown" : "Activer Markdown"}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 7V17H8L12 13L16 17H20V7H16L12 11L8 7H4Z"/>
              </svg>
            </button>

            <button
              type="button"
              className="toolbar-btn"
              onClick={() => setShowGifPicker(true)}
              title="Ajouter un GIF"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="2.18"/>
                <path d="M7 12h3m-3 3h3M7 9h3m4 0h3m-3 3h3m-3 3h3"/>
              </svg>
            </button>

            <button
              type="button"
              className="toolbar-btn"
              onClick={() => setShowAttachmentUploader(true)}
              title="Ajouter une image/vidéo"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
              </svg>
            </button>
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            placeholder="Écris ton message..."
            value={inputMessage}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            maxLength={charLimit}
            rows={1}
            className="message-textarea"
          />

          {/* Bouton envoyer */}
          <button 
            type="submit" 
            className="btn-send"
            disabled={!inputMessage.trim() && !attachment && !gifUrl}
            title="Envoyer (Ctrl+Enter)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Footer avec compteur et hint */}
        <div className="input-footer">
          <div className="input-hints">
            {useMarkdown && (
              <span className="hint-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 7V17H8L12 13L16 17H20V7H16L12 11L8 7H4Z"/>
                </svg>
                Markdown activé
              </span>
            )}
            <span className="hint-item hint-shortcut">
              Ctrl+Enter pour envoyer
            </span>
          </div>
          
          {charCount > 0 && (
            <span className={`char-counter ${isNearLimit ? 'warning' : ''}`}>
              {charCount} / {charLimit}
            </span>
          )}
        </div>
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
    </div>
  );
};