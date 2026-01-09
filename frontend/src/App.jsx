// App.jsx
import React, { useState, useEffect } from 'react';
import { LoginScreen } from './features/auth/LoginScreen';
import { ChatContainer } from './features/chat/ChatContainer';
import { UserProfile } from './features/profile/UserProfile';
import { AppHeader } from './components/AppHeader';
import { AppFooter } from './components/AppFooter';
import { useSocket } from './hooks/useSocket';
import { useDarkMode } from './hooks/useDarkMode';
import { SOCKET_URL } from './utils/constants';
import './styles/index.scss';

console.log('🎯 App.jsx chargé');

/**
 * Composant principal de l'application
 * Gère l'état de connexion et orchestre les composants
 */
function App() {
  console.log('🎯 App component render');
  
  const [username, setUsername] = useState('');
  const [isLogged, setIsLogged] = useState(false);
  const [profileUser, setProfileUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  
  // Hooks custom
  const { darkMode, toggleDarkMode, setDarkModeValue } = useDarkMode();
  const {
    messages,
    userCount,
    typingUsers,
    joinChat,
    sendMessage,
    emitTyping,
    emitStopTyping,
    deleteMessage
  } = useSocket();

  // Charger le profil de l'utilisateur au démarrage
  useEffect(() => {
    if (isLogged && username) {
      loadUserProfile(username);
    }
  }, [isLogged, username]);

  const loadUserProfile = async (user) => {
    try {
      const apiUrl = SOCKET_URL.replace(/:\d+$/, ':3001');
      const response = await fetch(`${apiUrl}/api/users/${user}`);
      const data = await response.json();
      
      if (data.success) {
        setUserProfile(data.profile);
        // Appliquer le dark mode du profil
        if (data.profile.dark_mode !== undefined) {
          setDarkModeValue(data.profile.dark_mode === 1);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    }
  };

  // Rejoindre le chat
  const handleLogin = (newUsername) => {
    setUsername(newUsername);
    joinChat(newUsername);
    setIsLogged(true);
    
    // Mettre le pseudo dans le titre de l'onglet
    document.title = `💬 ${newUsername} - Chat`;
  };

  // Ouvrir le profil d'un utilisateur
  const handleUsernameClick = (clickedUsername) => {
    setProfileUser(clickedUsername);
  };

  // Fermer le profil
  const handleCloseProfile = () => {
    setProfileUser(null);
  };

  // Callback quand le profil est mis à jour
  const handleProfileUpdate = (updatedProfile) => {
    if (updatedProfile.username === username) {
      setUserProfile(updatedProfile);
      
      // Mettre à jour le dark mode
      if (updatedProfile.dark_mode !== undefined) {
        setDarkModeValue(updatedProfile.dark_mode === 1);
      }
    }
  };

  // Handler pour le bouton membres (TODO: implémenter sidebar)
  const handleMembersClick = () => {
    console.log('TODO: Ouvrir la sidebar des membres');
  };

  // Handler pour le bouton settings (TODO: implémenter page settings)
  const handleSettingsClick = () => {
    console.log('TODO: Ouvrir les paramètres');
  };

  // Afficher l'écran de connexion si pas encore connecté
  if (!isLogged) {
    return (
      <div className="app app--login">
        <LoginScreen 
          onLogin={handleLogin}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
        />
      </div>
    );
  }

  // Afficher le chat avec nouvelle structure
  return (
    <div className="app app--logged">
      <AppHeader 
        channelName="#general"
        channelDescription="Discussion générale"
        userCount={userCount}
        onMembersClick={handleMembersClick}
      />
      
      <ChatContainer 
        username={username}
        userCount={userCount}
        messages={messages}
        typingUsers={typingUsers}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        onSendMessage={sendMessage}
        onTyping={emitTyping}
        onStopTyping={emitStopTyping}
        onUsernameClick={handleUsernameClick}
        userProfile={userProfile}
        onDeleteMessage={deleteMessage}
      />
      
      <AppFooter 
        username={username}
        userProfile={userProfile}
        darkMode={darkMode}
        onProfileClick={() => handleUsernameClick(username)}
        onSettingsClick={handleSettingsClick}
        onToggleDarkMode={toggleDarkMode}
      />
      
      {profileUser && (
        <UserProfile
          username={profileUser}
          isOwn={profileUser === username}
          onClose={handleCloseProfile}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
          onProfileUpdate={handleProfileUpdate}
        />
      )}
    </div>
  );
}

export default App;