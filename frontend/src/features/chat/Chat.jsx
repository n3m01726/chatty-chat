import { useEffect, useRef } from 'react';
import Message from '../../components/Message/Message';
import MessageInput from '../../components/MessageInput';
import TypingIndicator from '../../components/TypingIndicator';

/**
 * Composant Chat principal
 */
export default function Chat({ 
  messages, 
  isConnected, 
  currentUser,
  typingUsers,
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
  onTypingStart,
  onTypingStop,
  onUserClick
}) {
  const messagesEndRef = useRef(null);
  
  // Auto-scroll vers le bas
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSendMessage = (data) => {
    onSendMessage({
      ...data,
      username: currentUser.username,
      avatar: currentUser.avatar
    });
  };
  
  return (
    <div className="chat">
      <div className="chat__header">
        <div className="chat__header-left">
          <h2 className="chat__title"># général</h2>
          <span className="chat__description">Salon de discussion principal</span>
        </div>
        
        <div className="chat__header-right">
          <div className={`chat__status ${isConnected ? 'chat__status--online' : 'chat__status--offline'}`}>
            <span className="chat__status-indicator"></span>
            <span className="chat__status-text">
              {isConnected ? 'Connecté' : 'Déconnecté'}
            </span>
          </div>
        </div>
      </div>
      
      <div className="chat__messages">
        {messages.length === 0 ? (
          <div className="chat__empty">
            <div className="chat__empty-icon">💬</div>
            <h3 className="chat__empty-title">Bienvenue dans #général</h3>
            <p className="chat__empty-text">
              C'est le début de l'historique du salon.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <Message
              key={message.id}
              message={message}
              canEdit={message.socketId === currentUser.socketId && !message.deleted}
              canDelete={message.socketId === currentUser.socketId && !message.deleted}
              onEdit={onEditMessage}
              onDelete={onDeleteMessage}
              onAvatarClick={onUserClick}
            />
          ))
        )}
        
        <div ref={messagesEndRef} />
      </div>
    {/* Typing Indicator */}
    <TypingIndicator typingUsers={typingUsers} />     
      <MessageInput
        onSendMessage={handleSendMessage}
        onTypingStart={onTypingStart}
        onTypingStop={onTypingStop}
        disabled={!isConnected}
      />
    </div>
  );
}