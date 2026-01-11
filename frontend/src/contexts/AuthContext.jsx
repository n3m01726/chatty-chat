// contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { SOCKET_URL } from '../utils/constants';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastEmail, setLastEmail] = useState('');

  const apiUrl = SOCKET_URL.replace(/:\d+$/, ':3001');

  // Charger le dernier email depuis les cookies au démarrage
  useEffect(() => {
    const cookies = document.cookie.split(';');
    const lastEmailCookie = cookies.find(c => c.trim().startsWith('lastEmail='));
    if (lastEmailCookie) {
      const email = lastEmailCookie.split('=')[1];
      setLastEmail(decodeURIComponent(email));
    }
    
    // Vérifier si déjà authentifié
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/auth/me`, {
        credentials: 'include' // Important pour envoyer les cookies
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUser(data.user);
        }
      } else {
        // Essayer de refresh le token
        await refreshToken();
      }
    } catch (error) {
      console.error('Erreur vérification auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        await checkAuth();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erreur refresh token:', error);
      return false;
    }
  };

  const register = async (email, username, password) => {
    try {
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password }),
        credentials: 'include'
      });

      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.error || data.errors };
      }

      return { success: true, user: data.user };
    } catch (error) {
      console.error('Erreur inscription:', error);
      return { success: false, error: 'Erreur serveur' };
    }
  };

  const login = async (email, password, rememberMe = false) => {
    try {
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
        credentials: 'include'
      });

      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.error };
      }

      setUser(data.user);
      setLastEmail(email);
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Erreur connexion:', error);
      return { success: false, error: 'Erreur serveur' };
    }
  };

  const logout = async () => {
    try {
      await fetch(`${apiUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    lastEmail,
    register,
    login,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};