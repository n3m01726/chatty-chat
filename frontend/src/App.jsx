import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

// Connexion au serveur Socket.io
const socket = io('http://localhost:3000', {
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
});

function App() {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [username, setUsername] = useState('');
  const [isUsernameSet, setIsUsernameSet] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll vers le bas quand de nouveaux messages arrivent
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Gestion de la connexion
    socket.on('connect', () => {
      console.log('✅ Connecté au serveur');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('❌ Déconnecté du serveur');
      setIsConnected(false);
    });

    // Réception de l'historique des messages
    socket.on('message:history', (history) => {
      setMessages(history);
    });

    // Réception d'un nouveau message
    socket.on('message:new', (message) => {
      setMessages(prev => [...prev, message]);
    });

    // Nettoyage à la déconnexion du composant
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('message:history');
      socket.off('message:new');
    };
  }, []);

  const handleSetUsername = (e) => {
    e.preventDefault();
    if (username.trim()) {
      // Enregistrer l'utilisateur sur le serveur
      socket.emit('user:register', { username });
      setIsUsernameSet(true);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (messageInput.trim() && isUsernameSet) {
      // Envoi du message au serveur
      socket.emit('message:send', {
        content: messageInput,
        username: username
      });
      
      // Reset du champ
      setMessageInput('');
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Écran de choix du pseudo
  if (!isUsernameSet) {
    return (
      <div className="app app--login">
        <div className="login">
          <h1 className="login__title">Bienvenue sur ChattyChat</h1>
          <form onSubmit={handleSetUsername} className="login__form">
            <input
              type="text"
              placeholder="Entre ton pseudo..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="login__input"
              autoFocus
            />
            <button type="submit" className="login__button">
              Rejoindre le chat
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Interface de chat principale
  return (
    <div className="app">
      <div className="chat">
        <div className="chat__header">
          <h2 className="chat__title"># général</h2>
          <div className="chat__status">
            <span className={`chat__indicator ${isConnected ? 'chat__indicator--online' : 'chat__indicator--offline'}`}></span>
            {isConnected ? 'Connecté' : 'Déconnecté'}
          </div>
        </div>

        <div className="chat__messages">
          {messages.map((msg) => (
            <div key={msg.id} className="message">
              <img 
                src={msg.avatar} 
                alt={msg.username}
                className="message__avatar"
              />
              <div className="message__content">
                <div className="message__header">
                  <span className="message__username">{msg.username}</span>
                  <span className="message__timestamp">{formatTime(msg.timestamp)}</span>
                </div>
                <div className="message__text">{msg.content}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="chat__input-wrapper">
          <input
            type="text"
            placeholder="Envoie un message dans #général"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            className="chat__input"
            disabled={!isConnected}
          />
        </form>
      </div>
    </div>
  );
}

export default App;