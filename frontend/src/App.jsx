import { useState, useEffect } from 'react';
import { useSocket } from './hooks/useSocket';
import { useMessages } from './hooks/useMessages';
import { useTyping } from './hooks/useTyping';
import { useProfile } from './hooks/useProfile';
import Login from './features/auth/Login';
import Chat from './features/chat/Chat';
import UserProfile from './components/UserProfile/UserProfile';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUserData, setSelectedUserData] = useState(null);
  
  const { socket, isConnected } = useSocket();
  const { messages, sendMessage, editMessage, deleteMessage } = useMessages(socket);
  const { typingUsers, startTyping, stopTyping } = useTyping(socket);
  const { getProfile, updateProfile, profileCache } = useProfile(socket);
  
  // Gestion de la connexion utilisateur
  const handleLogin = (username) => {
    const userData = {
      username,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      socketId: socket?.id
    };
    
    setCurrentUser(userData);
    
    // Enregistrer l'utilisateur sur le serveur
    if (socket) {
      socket.emit('user:register', userData);
    }
  };
  
  // Mettre à jour le socketId quand la connexion change
  useEffect(() => {
    if (socket && currentUser && currentUser.socketId !== socket.id) {
      setCurrentUser(prev => ({ ...prev, socketId: socket.id }));
    }
  }, [socket, currentUser]);
  
  // Gestion du clic sur un utilisateur
  const handleUserClick = (userId) => {
    setSelectedUserId(userId);
    
    // Récupérer le profil depuis le cache ou le serveur
    const cachedProfile = profileCache.get(userId);
    if (cachedProfile) {
      setSelectedUserData(cachedProfile);
    } else {
      // Demander au serveur
      getProfile(userId);
    }
  };
  
  // Mettre à jour les données du profil sélectionné quand le cache change
  useEffect(() => {
    if (selectedUserId && profileCache.has(selectedUserId)) {
      setSelectedUserData(profileCache.get(selectedUserId));
    }
  }, [profileCache, selectedUserId]);
  
  // Gestion de la mise à jour du profil
  const handleProfileUpdate = (profileData) => {
    updateProfile(profileData);
  };
  
  // Si pas encore connecté, afficher l'écran de login
  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }
  
  return (
    <>
      <Chat
        messages={messages}
        isConnected={isConnected}
        currentUser={currentUser}
        typingUsers={typingUsers}
        onSendMessage={sendMessage}
        onEditMessage={editMessage}
        onDeleteMessage={deleteMessage}
        onTypingStart={startTyping}
        onTypingStop={stopTyping}
        onUserClick={handleUserClick}
      />
      
      {/* Modal de profil */}
      {selectedUserId && (
        <UserProfile
          userId={selectedUserId}
          userData={selectedUserData}
          isOwnProfile={selectedUserId === currentUser.socketId}
          onClose={() => {
            setSelectedUserId(null);
            setSelectedUserData(null);
          }}
          onUpdate={handleProfileUpdate}
        />
      )}
    </>
  );
}