import { useState, useEffect, useCallback } from 'react';

/**
 * Hook pour gérer les profils utilisateurs
 * @param {Object} socket - Instance socket.io
 * @returns {{ getProfile, updateProfile, profileCache }}
 */
export function useProfile(socket) {
  const [profileCache, setProfileCache] = useState(new Map());

  useEffect(() => {
    if (!socket) return;

    // Écouter les mises à jour de profil
    const handleProfileUpdated = (userData) => {
      setProfileCache(prev => {
        const newCache = new Map(prev);
        newCache.set(userData.id, userData);
        return newCache;
      });
    };

    // Écouter les données de profil reçues
    const handleProfileData = (userData) => {
      setProfileCache(prev => {
        const newCache = new Map(prev);
        newCache.set(userData.id, userData);
        return newCache;
      });
    };

    socket.on('user:profile:updated', handleProfileUpdated);
    socket.on('user:profile:data', handleProfileData);

    return () => {
      socket.off('user:profile:updated', handleProfileUpdated);
      socket.off('user:profile:data', handleProfileData);
    };
  }, [socket]);

  // Récupérer un profil
  const getProfile = useCallback((userId) => {
    if (!socket) return null;

    // Si déjà en cache, retourner
    if (profileCache.has(userId)) {
      return profileCache.get(userId);
    }

    // Sinon, demander au serveur
    socket.emit('user:profile:get', { userId });
    return null;
  }, [socket, profileCache]);

  // Mettre à jour le profil
  const updateProfile = useCallback((profileData) => {
    if (!socket) return;

    socket.emit('user:profile:update', profileData);
  }, [socket]);

  return {
    getProfile,
    updateProfile,
    profileCache
  };
}