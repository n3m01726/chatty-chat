// App.jsx
import React, { useState, useEffect } from 'react';
import { LoginScreen } from './features/auth/LoginScreen';
import { ChatContainer } from './features/chat/ChatContainer';
import { UserProfile } from './features/profile/UserProfile';
import { AppHeader } from './components/AppHeader';
import { AppFooter } from './components/AppFooter';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';
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
  const [members, setMembers] = useState([]);
  
  // Sidebars state
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true); // Open by default
  
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
      loadMembers();
    }
  }, [isLogged, username]);

  // Recharger les membres régulièrement
  useEffect(() => {
    if (!isLogged) return;
    
    const interval = setInterval(() => {
      loadMembers();
    }, 10000); // Toutes les 10 secondes
    
    return () => clearInterval(interval);
  }, [isLogged]);

  const loadUserProfile = async (user) => {
    try {
      const apiUrl = SOCKET_URL.replace(/:\d+$/, ':3001');
      const response = await fetch(`${apiUrl}/api/users/${user}`);
      const data = await response.json();
      
      if (data.success) {
        setUserProfile(data.profile);
        if (data.profile.dark_mode !== undefined) {
          setDarkModeValue(data.profile.dark_mode === 1);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    }
  };

  const loadMembers = async () => {
    try {
      const apiUrl = SOCKET_URL.replace(/:\d+$/, ':3001');
      const response = await fetch(`${apiUrl}/api/members`);
      const data = await response.json();
      
      if (data.success) {
        setMembers(data.members);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des membres:', error);
    }
  };

  const handleLogin = (newUsername) => {
    setUsername(newUsername);
    joinChat(newUsername);
    setIsLogged(true);
    document.title = `💬 ${newUsername} - Chat`;
  };

  const handleUsernameClick = (clickedUsername) => {
    setProfileUser(clickedUsername);
  };

  const handleCloseProfile = () => {
    setProfileUser(null);
  };

  const handleProfileUpdate = (updatedProfile) => {
    if (updatedProfile.username === username) {
      setUserProfile(updatedProfile);
      
      if (updatedProfile.dark_mode !== undefined) {
        setDarkModeValue(updatedProfile.dark_mode === 1);
      }
    }
    // Recharger la liste des membres pour mettre à jour l'affichage
    loadMembers();
  };

  const handleMentionClick = (mentionedUsername) => {
    // TODO: Ajouter @username dans l'input
    console.log('TODO: Mention', mentionedUsername);
  };

  const handleSettingsClick = () => {
    console.log('TODO: Ouvrir les paramètres');
  };

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

  return (
    <div className="app app--logged">
      <AppHeader 
        channelName="#general"
        channelDescription="Discussion générale"
        userCount={userCount}
        onMembersClick={() => setRightSidebarOpen(!rightSidebarOpen)}
        onChannelsClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
        leftSidebarOpen={leftSidebarOpen}
        rightSidebarOpen={rightSidebarOpen}
      />
      
      <div className="app-content">
        <LeftSidebar
          isOpen={leftSidebarOpen}
          onClose={() => setLeftSidebarOpen(false)}
          currentChannel="general"
          onChannelClick={(channelId) => console.log('TODO: Switch to channel', channelId)}
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
        
        <RightSidebar
          members={members}
          isOpen={rightSidebarOpen}
          onClose={() => setRightSidebarOpen(false)}
          onProfileClick={handleUsernameClick}
          onMentionClick={handleMentionClick}
        />
      </div>
      
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