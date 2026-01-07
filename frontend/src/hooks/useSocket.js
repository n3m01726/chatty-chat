import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

// Instance socket partagée (singleton)
let socket = null;

/**
 * Hook pour gérer la connexion Socket.io
 * @returns {{ socket, isConnected }}
 */
export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    // Créer la connexion socket une seule fois
    if (!socket) {
      socket = io('http://localhost:3001', {
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      });
    }
    
    // Handlers de connexion
    const handleConnect = () => {
      console.log('✅ Connecté au serveur');
      setIsConnected(true);
    };
    
    const handleDisconnect = () => {
      console.log('❌ Déconnecté du serveur');
      setIsConnected(false);
    };
    
    const handleConnectError = (error) => {
      console.error('❌ Erreur de connexion:', error);
    };
    
    // Écouter les événements
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    
    // Si déjà connecté
    if (socket.connected) {
      setIsConnected(true);
    }
    
    // Cleanup
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
    };
  }, []);
  
  return { socket, isConnected };
}

/**
 * Récupère l'instance socket (à utiliser dans les composants non-React)
 */
export function getSocket() {
  return socket;
}