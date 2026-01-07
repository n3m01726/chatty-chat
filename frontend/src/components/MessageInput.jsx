import { useState, useRef } from 'react';
import GifPicker from './GifPicker';

/**
 * Composant MessageInput - Zone d'envoi de message avec attachements et GIF
 */
export default function MessageInput({ onSendMessage, onTypingStart, onTypingStop, disabled = false }) {
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    
    // Déclencher typing indicator
    if (newContent.trim() && onTypingStart) {
      onTypingStart();
      
      // Reset le timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Arrêter le typing après 3 secondes d'inactivité
      typingTimeoutRef.current = setTimeout(() => {
        if (onTypingStop) {
          onTypingStop();
        }
      }, 3000);
    } else if (!newContent.trim() && onTypingStop) {
      onTypingStop();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Arrêter le typing indicator
    if (onTypingStop) {
      onTypingStop();
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Au moins du contenu ou des attachements
    if (!content.trim() && attachments.length === 0) return;
    
    onSendMessage({
      content: content.trim(),
      attachments: attachments.length > 0 ? attachments : undefined
    });
    
    // Reset
    setContent('');
    setAttachments([]);
  };
  
  const handleKeyDown = (e) => {
    // Envoyer avec Entrée (Shift+Entrée pour nouvelle ligne)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  // Gérer l'upload de fichiers
  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    
    for (const file of files) {
      // Vérifier le type
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        alert('Seules les images et vidéos sont acceptées');
        continue;
      }
      
      // Limite de taille : 10MB
      if (file.size > 10 * 1024 * 1024) {
        alert('Fichier trop volumineux (max 10MB)');
        continue;
      }
      
      // Convertir en base64 ou URL object
      const reader = new FileReader();
      reader.onload = () => {
        const attachment = {
          type: file.type.startsWith('image/') ? 'image' : 'video',
          url: reader.result,
          name: file.name
        };
        
        setAttachments(prev => [...prev, attachment]);
      };
      reader.readAsDataURL(file);
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Supprimer un attachement
  const handleRemoveAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };
  
  // Sélectionner un GIF
  const handleSelectGif = (gif) => {
    const gifAttachment = {
      type: 'gif',
      url: gif.url,
      name: gif.title
    };
    
    setAttachments(prev => [...prev, gifAttachment]);
    setShowGifPicker(false);
  };
  
  return (
    <div className="message-input">
      {/* Preview des attachements */}
      {attachments.length > 0 && (
        <div className="message-input__attachments">
          {attachments.map((attachment, index) => (
            <div key={index} className="message-input__attachment">
              {attachment.type === 'image' && (
                <img 
                  src={attachment.url} 
                  alt={attachment.name}
                  className="message-input__attachment-preview"
                />
              )}
              {attachment.type === 'video' && (
                <video 
                  src={attachment.url}
                  className="message-input__attachment-preview"
                />
              )}
              {attachment.type === 'gif' && (
                <img 
                  src={attachment.url} 
                  alt={attachment.name}
                  className="message-input__attachment-preview"
                />
              )}
              <button
                className="message-input__attachment-remove"
                onClick={() => handleRemoveAttachment(index)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="message-input__form">
        <div className="message-input__buttons">
          {/* Bouton upload fichier */}
          <button
            type="button"
            className="message-input__button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            title="Ajouter une image ou vidéo"
          >
            📎
          </button>
          
          {/* Bouton GIF */}
          <button
            type="button"
            className="message-input__button"
            onClick={() => setShowGifPicker(true)}
            disabled={disabled}
            title="Ajouter un GIF"
          >
            GIF
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>
        
        <textarea
          value={content}
          onChange={handleContentChange}
          onKeyDown={handleKeyDown}
          placeholder="Envoie un message dans #général"
          className="message-input__textarea"
          disabled={disabled}
          rows={1}
        />
        
        <button
          type="submit"
          className="message-input__send"
          disabled={disabled || (!content.trim() && attachments.length === 0)}
          title="Envoyer"
        >
          ➤
        </button>
      </form>
      
      <div className="message-input__hint">
        <strong>**gras**</strong> • <em>*italique*</em> • <code>`code`</code> • 
        Shift+Entrée pour nouvelle ligne
      </div>
      
      {/* GIF Picker modal */}
      {showGifPicker && (
        <GifPicker
          onSelectGif={handleSelectGif}
          onClose={() => setShowGifPicker(false)}
        />
      )}
    </div>
  );
}