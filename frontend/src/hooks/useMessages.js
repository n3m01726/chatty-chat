import { useState, useEffect, useCallback } from 'react';

/**
 * Hook pour gérer les messages
 * @param {Object} socket - Instance socket.io
 * @returns {{ messages, sendMessage, editMessage, deleteMessage }}
 */
export function useMessages(socket) {
  const [messages, setMessages] = useState([]);
  
  useEffect(() => {
    if (!socket) return;
    
    // Réception de l'historique
    const handleHistory = (history) => {
      setMessages(history);
    };
    
    // Nouveau message
    const handleNewMessage = (message) => {
      setMessages(prev => [...prev, message]);
    };
    
    // Message édité
    const handleEditMessage = ({ messageId, content }) => {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, content, edited: true, editedAt: new Date().toISOString() }
          : msg
      ));
    };
    
    // Message supprimé
    const handleDeleteMessage = ({ messageId, deletedBy }) => {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { 
              ...msg, 
              deleted: true, 
              deletedBy,
              deletedAt: new Date().toISOString() 
            }
          : msg
      ));
    };
    
    socket.on('message:history', handleHistory);
    socket.on('message:new', handleNewMessage);
    socket.on('message:edited', handleEditMessage);
    socket.on('message:deleted', handleDeleteMessage);
    
    return () => {
      socket.off('message:history', handleHistory);
      socket.off('message:new', handleNewMessage);
      socket.off('message:edited', handleEditMessage);
      socket.off('message:deleted', handleDeleteMessage);
    };
  }, [socket]);
  
  // Envoyer un message
  const sendMessage = useCallback((data) => {
    if (!socket) return;
    socket.emit('message:send', data);
  }, [socket]);
  
  // Éditer un message
  const editMessage = useCallback((messageId, newContent) => {
    if (!socket) return;
    socket.emit('message:edit', { messageId, content: newContent });
  }, [socket]);
  
  // Supprimer un message
  const deleteMessage = useCallback((messageId) => {
    if (!socket) return;
    socket.emit('message:delete', { messageId });
  }, [socket]);
  
  return {
    messages,
    sendMessage,
    editMessage,
    deleteMessage
  };
}