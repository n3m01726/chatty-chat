import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook pour gérer les typing indicators
 * @param {Object} socket - Instance socket.io
 * @param {number} timeout - Timeout en ms avant d'arrêter le typing (défaut: 3000ms)
 * @returns {{ typingUsers, startTyping, stopTyping }}
 */
export function useTyping(socket, timeout = 3000) {
  const [typingUsers, setTypingUsers] = useState(new Map());
  const typingTimerRef = useRef(null);
  const isTypingRef = useRef(false);

  // Écouter les événements typing des autres users
  useEffect(() => {
    if (!socket) return;

    const handleUserTyping = ({ userId, username, isTyping }) => {
      setTypingUsers(prev => {
        const newMap = new Map(prev);
        
        if (isTyping) {
          // Ajouter l'utilisateur qui tape
          newMap.set(userId, { username, timestamp: Date.now() });
        } else {
          // Retirer l'utilisateur
          newMap.delete(userId);
        }
        
        return newMap;
      });
    };

    socket.on('user:typing', handleUserTyping);

    return () => {
      socket.off('user:typing', handleUserTyping);
    };
  }, [socket]);

  // Nettoyer automatiquement les typing users après timeout
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      
      setTypingUsers(prev => {
        const newMap = new Map(prev);
        let changed = false;

        for (const [userId, data] of newMap.entries()) {
          if (now - data.timestamp > timeout) {
            newMap.delete(userId);
            changed = true;
          }
        }

        return changed ? newMap : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeout]);

  // Commencer à taper
  const startTyping = useCallback(() => {
    if (!socket || isTypingRef.current) return;

    // Émettre l'événement
    socket.emit('user:typing:start');
    isTypingRef.current = true;

    // Reset le timer d'auto-stop
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }

    // Auto-stop après le timeout
    typingTimerRef.current = setTimeout(() => {
      stopTyping();
    }, timeout);
  }, [socket, timeout]);

  // Arrêter de taper
  const stopTyping = useCallback(() => {
    if (!socket || !isTypingRef.current) return;

    socket.emit('user:typing:stop');
    isTypingRef.current = false;

    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
  }, [socket]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
      stopTyping();
    };
  }, [stopTyping]);

  return {
    typingUsers: Array.from(typingUsers.values()),
    startTyping,
    stopTyping
  };
}